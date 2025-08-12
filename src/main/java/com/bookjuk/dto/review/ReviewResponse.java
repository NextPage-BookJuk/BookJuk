package com.bookjuk.dto.review;

import com.bookjuk.domain.review.MeetingReview;
import lombok.*;

import java.time.LocalDateTime;

@Getter @ToString
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponse {

    private Long reviewId;
    private Long fromUserId;
    private Long toUserId;
    private LocalDateTime createdAt;

    // 엔터티를 dto로 바꾸는 정적 팩토리 메소드
    public static ReviewResponse from(MeetingReview review) {
        ReviewResponse response = ReviewResponse.builder()
                .reviewId(review.getId())
                // 유저 엔터티 생성 후 주석 제거
                /*
                .fromUserId(review.getReviewer().getId())
                .toUserId(review.getReviewee().getId())
                */
                .createdAt(review.getCreatedAt())
                .build();

        return response;
    }
}
