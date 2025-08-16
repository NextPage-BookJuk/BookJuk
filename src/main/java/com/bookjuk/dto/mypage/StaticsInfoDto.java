package com.bookjuk.dto.mypage;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 마이페이지 API 응답을 위한 통계 정보 DTO 클래스
 *
 * 사용자의 좋아요(리뷰), 참여 모임 개수 정보를 포함합니다.
 *
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaticsInfoDto {

    private Long receivedLikes;
    private int participatedMeeting;

    public static StaticsInfoDto of(Long likes, int meetings) {
        return StaticsInfoDto.builder()
                .receivedLikes(likes)
                .participatedMeeting(meetings)
                .build();
    }

}
