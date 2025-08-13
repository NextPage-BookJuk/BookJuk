package com.bookjuk.dto.board.response;

import com.bookjuk.domain.board.Post;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;


/**
 * 게시글 상세 조회 시 반환되는 응답 DTO 클래스
 * 댓글 목록도 포함되며 작성자의 username도 제공된다.
 */
@Getter
@Builder
public class PostDetailResponse {

    // 게시글 고유 식별자
    private Long postId;
    // 게시글 제목
    private String title;
    // 게시글 내용
    private String content;
    // 게시글 이미지 URL (NULL 가능)
    private String imageUrl;
    // 게시글 작성자 ID
    private Long userId;
    // 게시글 작성자명 (사용자를 찾을 수 없는 경우 "알 수 없는 사용자"로 표시된다.)
    private String username;
    // 작성 시간
    private LocalDateTime createdAt;
    // 수정 시간
    private LocalDateTime updatedAt;
    // 게시글에 달린 댓글 목록( 없는 경우 빈 리스트반환)
    private List<CommentResponse> comments;


    /**
     * 엔터티, 작성자, 댓글 목록으로부터 객체를 생성합니다.
     *
     * @param post 게시글 엔터티
     * @param username 작성자명
     * @param comments 댓글 응답 DTO 리스트
     * @return PostDetailResponse 객체
     */
    public static PostDetailResponse from(Post post, String username, List<CommentResponse> comments) {
        return PostDetailResponse.builder()
                .postId(post.getPostId())
                .title(post.getTitle())
                .content(post.getContent())
                .imageUrl(post.getImageUrl())
                .userId(post.getUserId())
                .username(username)
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .comments(comments)
                .build();
    }

}
