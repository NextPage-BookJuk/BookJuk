package com.bookjuk.controller;

import com.bookjuk.domain.user.User;
import com.bookjuk.dto.common.ApiResponse;
import com.bookjuk.dto.meeting.MeetingCreateRequest;
import com.bookjuk.dto.meeting.MeetingDetailResponse;
import com.bookjuk.repository.user.UserRepository;
import com.bookjuk.dto.meeting.request.MeetingListItemDto;
import com.bookjuk.dto.meeting.request.MeetingListSearchRequest;
import com.bookjuk.dto.meeting.response.MeetingListResponse;
import com.bookjuk.repository.meeting.custom.MeetingRepositoryCustom;
import com.bookjuk.service.MeetingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Controller
@RequiredArgsConstructor
public class MeetingController {

    private final MeetingService meetingService;
    private final UserRepository userRepository;

    /**
     * 모임 생성 페이지를 반환합니다.
     * @return 모임 생성 템플릿
     */
    @GetMapping("/meetings/create")
    public String createMeetingPage() {
        log.info("모임 생성 페이지 요청");
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
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile) {

        log.info("모임 생성 요청 - 제목: {}, 도서: {}", request.getTitle(), request.getBookTitle());

        // TODO: 현재 로그인한 사용자 정보 가져오기
        // 실제 구현에서는 Security Context나 세션에서 현재 사용자를 가져와야 합니다.
        // 지금은 임시로 더미 사용자를 생성합니다.
        User currentUser = getOrCreateDummyUser(); // 임시 구현

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
        log.info("모임 목록 조회 API 호출 - 페이지: {}, 크기: {}");

        // 요청 → 검색조건 + 페이지로 변환
        MeetingRepositoryCustom.MeetingSearchCondition condition = request.toCondition();
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize());

        // 서비스 호출 (MeetingListResponse)
        MeetingListResponse response = meetingService.getMeetingList(condition, pageable);

        // 공통 응답 포맷으로 감싸기
        return ResponseEntity.ok(
                ApiResponse.success("모임 정보 목록이 조회되었습니다.", response)
        );
    }

    /**
     * 임시 사용자 생성 메서드
     * TODO: 실제 인증 시스템 구현 후 제거 예정
     */
    private User getOrCreateDummyUser() {
        // 이미 존재하는 더미 사용자가 있는지 확인
        String dummyEmail = "dummy@bookjuk.com";

        return userRepository.findByEmail(dummyEmail)
                .orElseGet(() -> {
                    // 없으면 새로 생성해서 저장
                    User newUser = User.builder()
                            .username("더미사용자")
                            .email(dummyEmail)
                            .password("dummy123") // 실제로는 암호화해야 함
                            .preferredGenre("소설")
                            .introduction("테스트용 더미 사용자입니다.")
                            .build();

                    User savedUser = userRepository.save(newUser);
                    log.info("더미 사용자 생성 완료 - ID: {}", savedUser.getId());
                    return savedUser;
                });
    }

}
