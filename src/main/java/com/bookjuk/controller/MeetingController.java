package com.bookjuk.controller;

import com.bookjuk.domain.user.User;
import com.bookjuk.dto.meeting.MeetingCreateRequest;
import com.bookjuk.dto.meeting.MeetingDetailResponse;
import com.bookjuk.exception.CustomException;
import com.bookjuk.exception.ErrorCode;
import com.bookjuk.jwt.JwtProvider;
import com.bookjuk.repository.user.UserRepository;
import com.bookjuk.service.MeetingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
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
     * @param request HTTP 요청
     * @return 모임 생성 템플릿 또는 로그인 페이지 리다이렉트
     */
    @GetMapping("/meetings/create")
    public String createMeetingPage(HttpServletRequest request) {
        log.info("모임 생성 페이지 요청");

        // JWT 토큰 검증
        User currentUser = getCurrentUserFromToken(request);
        if (currentUser == null) {
            log.warn("로그인하지 않은 사용자의 모임 생성 페이지 접근 시도");
            return "redirect:/login"; // 로그인 페이지로 리다이렉트
        }

        log.info("로그인 사용자의 모임 생성 페이지 접근: {}", currentUser.getEmail());
        return "create-meeting"; // templates/create-meeting.html 반환
    }

    /**
     * 새로운 모임을 생성합니다.
     * @param request 모임 생성 요청 데이터
     * @param imageFile 모임 대표 이미지 파일 (선택적)
     * @return 생성된 모임의 상세 정보
     */
    @PostMapping("/api/meetings")
    @ResponseBody
    public ResponseEntity<MeetingDetailResponse> createMeeting(
            @Valid @ModelAttribute MeetingCreateRequest request,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile,
            HttpServletRequest httpRequest) {

        log.info("모임 생성 요청 - 제목: {}, 도서: {}", request.getTitle(), request.getBookTitle());

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
     * HTTP 요청에서 JWT 토큰을 추출하고 현재 사용자 정보를 반환합니다.
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
}
