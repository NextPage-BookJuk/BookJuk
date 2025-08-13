package com.bookjuk.dto.board.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 댓글 작성 시(성공) 반환되는 응답 DTO 클래스
 * 새로 생성된 댓글의 ID를 클라이언트에게 전달한다.
 */
@Getter
@AllArgsConstructor
public class CommentCreatedResponse {

    // 새로 생성된 댓글의 고유 식별자(클라이언트는 이 ID를 사용하여 생성된 게시글에 접근할 수 있다.)
    private Long commentId;
}
