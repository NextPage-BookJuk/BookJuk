package com.bookjuk.dto.board.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 게시글 수정 요청 데이터를 담는 DTO 클래스
 * 작성자 또는 모임의 HOST만 수정할 수 있다.
 */
@Getter
@NoArgsConstructor
public class PostCreateRequest {


    // 수정할 게시글 제목은 공백만으로 구성될 수 없다.(1~200자)
    @NotBlank(message = "게시글 제목은 필수입니다.")
    @Size(max = 200, message = "게시글 제목은 200자 이하로 작성해주세요.")
    private String title;


    //  수정할 게시글 내용은 HTML태그는 허용되지 않으며 일반 텍스트로 저장된다.
    @NotBlank(message = "게시글 내용은 필수입니다.")
    private String content;


    // 수정할 이미지 URL(Null 허용), 기존 이미지를 삭제하려면 빈 문자열을 전달한다.
    private String imageUrl;

}
