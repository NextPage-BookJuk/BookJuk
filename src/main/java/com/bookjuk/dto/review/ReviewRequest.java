package com.bookjuk.dto.review;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewRequest {

    // 좋아요를 받는 타켓 유저의 id
    @NotNull
    private Long toUserId;
}
