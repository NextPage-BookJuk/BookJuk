package com.bookjuk.controller;

import com.bookjuk.domain.user.User;
import com.bookjuk.dto.board.response.ParticipantResponse;
import com.bookjuk.dto.meeting.MeetingCreateRequest;
import com.bookjuk.dto.meeting.MeetingDetailResponse;
import com.bookjuk.dto.meeting.MeetingUpdateRequest;
import com.bookjuk.exception.CustomException;
import com.bookjuk.exception.ErrorCode;
import com.bookjuk.jwt.JwtProvider;
import com.bookjuk.repository.user.UserRepository;
import com.bookjuk.dto.meeting.request.MeetingListSearchRequest;
import com.bookjuk.dto.meeting.response.MeetingListResponse;
import com.bookjuk.repository.meeting.custom.MeetingRepositoryCustom;
import com.bookjuk.service.MeetingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;

@Slf4j
@Controller
@RequiredArgsConstructor
public class MeetingController {

    private final MeetingService meetingService;
    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;

    // 허용되는 이미지 파일 확장자
    private static final List<String> ALLOWED_IMAGE_EXTENSIONS = Arrays.asList(
            "jpg", "jpeg", "png", "gif", "bmp", "webp"
    );

    // 최대 파일 크기 (10MB)
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    /**
     * 모임 생성 페이지를 반환합니다.
     * 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트됩니다.
     *
     * @param request HTTP 요청
     * @return 모임 생성 템플릿 또는 로그인 페이지 리다이렉트
     */
    @GetMapping("/meetings/create")
    public String createMeetingPage(HttpServletRequest request, Model model) {
        log.info("모임 생성 페이지 요청");

        // JWT 토큰 검증
        User currentUser = getCurrentUserFromToken(request);
        if (currentUser == null) {
            log.warn("로그인하지 않은 사용자의 모임 생성 페이지 접근 시도");
            model.addAttribute("loginRequired", true);
            model.addAttribute("message", "모임을 생성하려면 로그인이 필요합니다.");
            return "auth"; // 로그인 페이지에 메시지와 함께 이동
        }

        log.info("로그인 사용자의 모임 생성 페이지 접근: {}", currentUser.getEmail());
        return "create-meeting"; // templates/create-meeting.html 반환
    }

    /**
     * 새로운 모임을 생성합니다.
     * <p>
     * 이미지 업로드 제한사항:
     * - 선택사항 (없어도 모임 생성 가능)
     * - 최대 1장만 업로드 가능
     * - 허용 형식: JPG, JPEG, PNG, GIF, BMP, WEBP
     * - 최대 크기: 10MB
     *
     * @param request   모임 생성 요청 데이터
     * @param imageFile 모임 대표 이미지 파일 (선택적, 최대 1장)
     * @return 생성된 모임의 상세 정보
     */
    @PostMapping("/api/meetings")
    @ResponseBody
    public ResponseEntity<MeetingDetailResponse> createMeeting(
            // 수업 시간 때 배운 RequestPart를 사용하여 json, Image를 동시에 보내는 api를 생성
            @Valid @RequestPart("meeting") MeetingCreateRequest request,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile,
            HttpServletRequest httpRequest) {

        log.info("모임 생성 요청 - 제목: {}, 도서: {}, 최대참여자: {}",
                request.getTitle(), request.getBookTitle(), request.getMaxParticipants());

        // JWT 토큰에서 현재 사용자 정보 가져오기
        User currentUser = getCurrentUserFromToken(httpRequest);
        if (currentUser == null) {
            throw new CustomException(ErrorCode.NEED_LOGIN);
        }

        // 이미지 파일 검증
        if (imageFile != null && !imageFile.isEmpty()) {
            validateImageFile(imageFile);
        }

        MeetingDetailResponse response = meetingService.createMeeting(request, currentUser, imageFile);

        log.info("모임 생성 완료 - ID: {}", response.getMeetingId());
        return ResponseEntity.ok(response);
    }

    /**
     * 임시 사용자 생성 또는 조회 메서드
     * 실제 데이터베이스에 저장된 사용자를 반환합니다.
     * 모임 목록 조회 API (동적 쿼리)
     * GET /api/meetings
     */
    @GetMapping("/api/meetings")
    public ResponseEntity<?> getMeetings(MeetingListSearchRequest request) {
        log.info("모임 목록 조회 API 호출 - 페이지: {}, 크기: {}", request.getPage(), request.getSize());

        // 요청 → 검색조건 + 페이지로 변환
        MeetingRepositoryCustom.MeetingSearchCondition condition = request.toCondition();
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize());

        // 서비스 호출 (MeetingListResponse)
        MeetingListResponse response = meetingService.getMeetingList(condition, pageable);

        // 공통 응답 포맷으로 감싸기
        return ResponseEntity.ok(response);
    }

    /**
     * 모임 상세 정보를 조회합니다.
     *
     * @param id 모임 ID
     * @return 모임 상세 정보
     */
    @GetMapping("/api/meetings/{id}")
    @ResponseBody
    public ResponseEntity<MeetingDetailResponse> getMeetingDetail(@PathVariable("id") Long id) {
        MeetingDetailResponse detail = meetingService.getMeetingDetail(id);
        return ResponseEntity.ok(detail);
    }

    /**
     * HTTP 요청에서 JWT 토큰을 추출하고 현재 사용자 정보를 반환합니다.
     *
     * @param request HTTP 요청
     * @return 현재 사용자 정보 (토큰이 유효하지 않으면 null)
     */
    private User getCurrentUserFromToken(HttpServletRequest request) {
        try {
            // Authorization 헤더에서 토큰 추출
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.warn("Authorization 헤더가 없거나 Bearer 토큰이 아닙니다.");
                return null;
            }

            String token = authHeader.substring(7); // "Bearer " 제거

            // 토큰 유효성 검증
            if (!jwtProvider.validateToken(token)) {
                log.warn("유효하지 않은 JWT 토큰입니다.");
                return null;
            }

            // 토큰에서 이메일 추출
            String email = jwtProvider.getEmailFromToken(token);

            // 사용자 조회
            return userRepository.findByEmail(email)
                    .orElse(null);

        } catch (Exception e) {
            log.error("JWT 토큰 처리 중 오류 발생: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 업로드된 이미지 파일을 검증합니다.
     *
     * @param imageFile 검증할 이미지 파일
     * @throws CustomException 검증 실패 시
     */
    private void validateImageFile(MultipartFile imageFile) {
        // 파일 크기 검증
        if (imageFile.getSize() > MAX_FILE_SIZE) {
            log.warn("파일 크기 초과: {} bytes (최대: {} bytes)", imageFile.getSize(), MAX_FILE_SIZE);
            throw new CustomException(ErrorCode.FILE_SIZE_EXCEEDED);
        }

        // 파일 확장자 검증
        String originalFilename = imageFile.getOriginalFilename();
        if (originalFilename == null || originalFilename.trim().isEmpty()) {
            throw new CustomException(ErrorCode.INVALID_INPUT);
        }

        String extension = getFileExtension(originalFilename).toLowerCase();
        if (!ALLOWED_IMAGE_EXTENSIONS.contains(extension)) {
            log.warn("허용되지 않는 파일 확장자: {}", extension);
            throw new CustomException(ErrorCode.INVALID_INPUT);
        }

        // MIME 타입 검증
        String contentType = imageFile.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            log.warn("이미지 파일이 아닙니다. Content-Type: {}", contentType);
            throw new CustomException(ErrorCode.INVALID_INPUT);
        }

        log.info("이미지 파일 검증 통과 - 파일명: {}, 크기: {} bytes, 타입: {}",
                originalFilename, imageFile.getSize(), contentType);
    }

    /**
     * 파일명에서 확장자를 추출합니다.
     *
     * @param filename 파일명
     * @return 확장자 (점 제외)
     */
    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1 || lastDotIndex == filename.length() - 1) {
            return "";
        }
        return filename.substring(lastDotIndex + 1);
    }

    /**
     * 특정 모임의 참가자 목록을 조회합니다.
     */
    @GetMapping("/api/meetings/{meetingId}/participants")
    @ResponseBody
    public ResponseEntity<List<ParticipantResponse>> getParticipants(
            @PathVariable Long meetingId,
            @RequestParam(required = false) String status,
            HttpServletRequest request) { // 이 부분 추가

        log.info("참가자 목록 조회 요청 - meetingId: {}, status: {}", meetingId, status);

        // 현재 사용자 ID 추출 (JWT 토큰에서)
        User currentUser = getCurrentUserFromToken(request);
        Long currentUserId = currentUser != null ? currentUser.getId() : null;

        // 수정된 서비스 메서드 호출 (2개 파라미터)
        List<ParticipantResponse> participants = meetingService.getParticipants(meetingId, status);

        log.info("참가자 목록 조회 완료 - meetingId: {}, count: {}", meetingId, participants.size());
        return ResponseEntity.ok(participants);
    }

    /**
     * 모임에 참가 신청을 합니다.
     */
    @PostMapping("/api/meetings/{meetingId}/apply")
    @ResponseBody
    public ResponseEntity<Void> applyToMeeting(
            @PathVariable Long meetingId,
            @RequestAttribute("userId") Long userId) {

        log.info("모임 신청 요청 - meetingId: {}, userId: {}", meetingId, userId);

        meetingService.applyToMeeting(meetingId, userId);

        log.info("모임 신청 완료 - meetingId: {}, userId: {}", meetingId, userId);
        return ResponseEntity.ok().build();
    }

    /**
     * 모임 종료 (호스트 전용)
     */
    @PutMapping("/api/meetings/{meetingId}/complete")
    @ResponseBody
    public ResponseEntity<Void> completeMeeting(
            @PathVariable Long meetingId,
            @RequestAttribute("userId") Long hostId) {

        meetingService.completeMeeting(meetingId, hostId);
        return ResponseEntity.ok().build();
    }

    /**
     * 참여자 강제 퇴장 (호스트 전용)
     */
    @DeleteMapping("/api/meetings/{meetingId}/participants/{userId}")
    @ResponseBody
    public ResponseEntity<Void> removeParticipant(
            @PathVariable Long meetingId,
            @PathVariable Long userId,
            @RequestAttribute("userId") Long hostId) {

        meetingService.removeParticipant(meetingId, userId, hostId);
        return ResponseEntity.ok().build();
    }


    /**
     * 모임 정보를 수정합니다. (호스트만 가능)
     */
    @PutMapping("/api/meetings/{meetingId}")  // ✅ 수정: API 경로 완성
    @ResponseBody
    public ResponseEntity<Void> updateMeeting(
            @PathVariable Long meetingId,
            @Valid @RequestBody MeetingUpdateRequest request,
            HttpServletRequest httpRequest) {  // ✅ 수정: @RequestAttribute 대신 JWT에서 직접 추출

        log.info("모임 수정 요청 - meetingId: {}, request: {}", meetingId, request);

        // JWT 토큰에서 현재 사용자 정보 가져오기
        User currentUser = getCurrentUserFromToken(httpRequest);
        if (currentUser == null) {
            throw new CustomException(ErrorCode.NEED_LOGIN);
        }

        Long userId = currentUser.getId();
        log.info("모임 수정 권한 확인 - userId: {}, meetingId: {}", userId, meetingId);

        meetingService.updateMeeting(meetingId, userId, request);

        log.info("모임 수정 완료 - meetingId: {}", meetingId);
        return ResponseEntity.ok().build();
    }
}

