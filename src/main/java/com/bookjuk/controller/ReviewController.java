package com.bookjuk.controller;

import com.bookjuk.domain.review.MeetingReview;
import com.bookjuk.domain.user.User;
import com.bookjuk.dto.common.ApiResponse;
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

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/meetings")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final UserService userService;

    /**
     * Review API - 다른 참여자에게 리뷰를 남길 수 있습니다.
     * POST: /api/meetings/{meetingId}/reviews
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

        log.info("{} 모임에서 {}님이 {}님에게 리뷰를 남겼습니다.", meetingId, reviewerId, request.getToUserId());
        return ResponseEntity.ok(ApiResponse.success("다른 사용자에게 리뷰 남기기를 성공했습니다.", response));
    }

    /**
     * 모임의 모든 리뷰 조회 API (새로 추가)
     * GET: /api/meetings/{meetingId}/reviews
     */
    @GetMapping("/{meetingId}/reviews")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getReviews(@PathVariable Long meetingId) {
        List<ReviewResponse> reviews = reviewService.getReviewsByMeetingId(meetingId);
        return ResponseEntity.ok(ApiResponse.success("리뷰 목록 조회 성공", reviews));
    }

    /**
     * 특정 사용자가 받은 리뷰 수 조회 API (새로 추가)
     * GET: /api/meetings/{meetingId}/reviews/count/{userId}
     */
    @GetMapping("/{meetingId}/reviews/count/{userId}")
    public ResponseEntity<ApiResponse<Integer>> getReviewCount(
            @PathVariable Long meetingId,
            @PathVariable Long userId) {
        int reviewCount = reviewService.getReviewCountByUserAndMeeting(meetingId, userId);
        return ResponseEntity.ok(ApiResponse.success("리뷰 수 조회 성공", reviewCount));
    }

    /**
     * 현재 사용자가 특정 사용자에게 리뷰를 남겼는지 확인 API (새로 추가)
     * GET: /api/meetings/{meetingId}/reviews/check/{toUserId}
     */
    @GetMapping("/{meetingId}/reviews/check/{toUserId}")
    public ResponseEntity<ApiResponse<Boolean>> checkReviewExists(
            @PathVariable Long meetingId,
            @PathVariable Long toUserId,
            @AuthenticationPrincipal String email) {

        User user = userService.findUser(email);
        Long fromUserId = user.getId();

        boolean exists = reviewService.hasUserReviewed(meetingId, fromUserId, toUserId);
        return ResponseEntity.ok(ApiResponse.success("리뷰 존재 여부 확인 성공", exists));
    }
}