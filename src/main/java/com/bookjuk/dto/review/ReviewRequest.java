package com.bookjuk.dto.review;

import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewRequest {

    // 좋아요를 받는 타켓 유저의 id
    private Long toUserId;
}
