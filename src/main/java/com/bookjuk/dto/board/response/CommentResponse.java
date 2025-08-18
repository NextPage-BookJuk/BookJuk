package com.bookjuk.dto.board.response;


import com.bookjuk.domain.board.Comment;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;


/**
 * 댓글 정보를 담는 응답 DTO 클래스
 * 댓글 작성자의 username도 함께 포함된다.
 */
@Getter
@Builder
public class CommentResponse {

    // 댓글 고유 식별자
    private Long commentId;
    // 댓글 내용
    private String content;
    // 댓글 작성자 ID
    private Long userId;
    // 댓글 작성자명
    private String username;
    // 댓글 작성 시간
    private LocalDateTime createdAt;
    // 댓글 수정 시간
    private LocalDateTime updatedAt;


    /**
     * 엔터티와 작성자로부터 CommentResponse 객체를 생성한다.
     *
     * @param comment 댓글 엔터티
     * @param username 작성자 사용자명
     * @return CommentResponse 객체
     */
    public static CommentResponse from(Comment comment, String username) {
        return CommentResponse.builder()
                .commentId(comment.getId())
                .content(comment.getContent())
                .userId(comment.getUserId())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}
