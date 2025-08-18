package com.bookjuk.dto.board.response;

import com.bookjuk.domain.board.Post;
import lombok.*;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostResponse {
    private Long postId;
    private Long meetingId;
    private Long userId;
    private String title;
    private String content;

    public static PostResponse from(Post p) {
        return PostResponse.builder()
                .postId(p.getPostId())
                .meetingId(p.getMeetingId())
                .userId(p.getUserId())
                .title(p.getTitle())
                .content(p.getContent())
                .build();
    }
}