package com.bookjuk.dto.board.response;

import com.bookjuk.domain.board.Post;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class PostListResponse {

    private Long postId;
    private String title;
    private String content;
    private String imageUrl;
    private Long userId;
    private String username;
    private LocalDateTime createdAt;
    private LocalDateTime updateAt;

    public static PostListResponse from(Post post) {
        return PostListResponse.builder()
                .postId(post.getPostId())
                .title(post.getTitle())
                .content(post.getContent())
                .imageUrl(post.getImageUrl())
                .userId(post.getUserId())
                .createdAt(post.getCreatedAt())
                .updateAt(post.getUpdatedAt())
                .build();
    }
}
