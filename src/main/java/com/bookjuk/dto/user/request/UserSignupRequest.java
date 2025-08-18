package com.bookjuk.dto.user.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * 회원 가입 요청에 사용할 DTO
 * - 클라이언트로부터 회원가입폼에서 작성한 데이터를 받고 검증하는 객체
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class UserSignupRequest {

    @NotBlank(message = "닉네임은 필수입니다.")
    @Size(max = 50, message = "닉네임은 50자를 초과할 수 없습니다.")
    private String username;

    @NotBlank(message = "이메일은 필수입니다.")
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    @Size(max = 100, message = "이메일은 100자를 초과할 수 없습니다.")
    private String email;

    @NotBlank(message = "비밀번호는 필수입니다.")
    @Size(min = 6, max = 20, message = "비밀번호는 6자 이상 20자 이하여야 합니다.")
    // '영문+숫자' 조합 패턴 검증은 서비스단이나 클라이언트단에서 추가로 처리.
    private String password;

    // 선택 입력 필드 (유효성 검증 불필요)
    private String preferredGenre;
    private String introduction;
}