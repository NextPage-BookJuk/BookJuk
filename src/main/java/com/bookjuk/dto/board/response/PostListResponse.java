package com.bookjuk.dto.board.response;

import com.bookjuk.domain.board.Post;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;


/**
 * 게시글 목록 조회 시 반환되는 응답 DTO 클래스
 * 작성자의 username도 함께 포함된다.
 */
@Getter
@Builder
public class PostListResponse {

    // 게시글 고유 식별자
    private Long postId;
    // 게시글 제목
    private String title;
    // 게시글 내용
    private String content;
    // 게시글 이미지 URL
    private String imageUrl;
    // 게시글 작성자 ID
    private Long userId;
    // 게시글 작성자명 (사용자를 찾을 수 없는 경우 "알 수 없는 사용자"로 표시된다)
    private String username;
    // 게시글 작성 시간
    private LocalDateTime createdAt;
    // 게시글 수정 시간
    private LocalDateTime updatedAt;


    /**
     * Post 엔터티와 작성자 username 으로부터 PostListResponse 객체를 생성한다.
     * @param post 게시글 엔터티
     * @param username 작성자명
     * @return PostListResponse 객체
     */
    public static PostListResponse from(Post post, String username) {
        return PostListResponse.builder()
                .postId(post.getPostId())
                .title(post.getTitle())
                .content(post.getContent())
                .imageUrl(post.getImageUrl())
                .userId(post.getUserId())
                .username(username)
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }

}
