package com.bookjuk.controller;

import com.bookjuk.domain.user.User;
import com.bookjuk.dto.meeting.MeetingCreateRequest;
import com.bookjuk.dto.meeting.MeetingDetailResponse;
import com.bookjuk.service.MeetingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Controller
@RequiredArgsConstructor
public class MeetingController {

    private final MeetingService meetingService;
  
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
        User currentUser = createDummyUser(); // 임시 구현

        MeetingDetailResponse response = meetingService.createMeeting(request, currentUser, imageFile);

        log.info("모임 생성 완료 - ID: {}", response.getMeetingId());
        return ResponseEntity.ok(response);
    }

    /**
     * 임시 사용자 생성 메서드
     * TODO: 실제 인증 시스템 구현 후 제거 예정
     */
    private User createDummyUser() {
        // User 엔티티에 빌더나 생성자가 있다고 가정
        // 실제 User 엔티티 구조에 맞게 수정 필요
        return User.builder()
                .id(1L)
                .username("테스트유저")
                .email("test@example.com")
                .build();
    }

}
