package com.bookjuk.dto.board.request;


import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;


/**
 * 댓글 수정 요청 데이터를 담는 DTO 클래스
 * 작성자 또는 모임의 HOST만 수정할 수 있다.
 */
@Getter
@NoArgsConstructor
public class CommentUpdateRequest {

    // 수정할 댓글 내용은 HTML 태그는 허용되지 않으며 일반 텍스트로 저장된다.
    @NotBlank(message = "댓글 내용은 필수입니다.")
    private String content;
}
