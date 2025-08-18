package com.bookjuk.controller;

import com.bookjuk.domain.review.MeetingReview;
import com.bookjuk.domain.user.User;
import com.bookjuk.dto.review.ReviewRequest;
import com.bookjuk.dto.review.ReviewResponse;
import com.bookjuk.repository.meeting.MeetingRepository;
import com.bookjuk.repository.user.UserRepository;
import com.bookjuk.service.ReviewService;
import com.bookjuk.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/meetings")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final UserService userService;

    /**
     * Review API - 다른 참여자에게 리뷰를 남길 수 있습니다.
     * POST: /api/meeting/{meetingId}/reviews
     */
    @PostMapping("/{meetingId}/reviews")
    public ResponseEntity<?> createReview(
            @PathVariable Long meetingId,
            @AuthenticationPrincipal String email,
            @RequestBody @Valid ReviewRequest request
            ) {

        // 스프링 시큐리티 컨텍스트에서 인증된 사용자의 정보(email)로 사용자 객체를 조회
        User user = userService.findUser(email);
        Long reviewerId = user.getId();

        ReviewResponse response = reviewService.createReview(meetingId, reviewerId, request);

        log.info("{} 모임에서 {}님이 {}님에게 리뷰를 남겼습니다.", meetingId, reviewerId, request);
        return ResponseEntity.ok(response);
    }
}
