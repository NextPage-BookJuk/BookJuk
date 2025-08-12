package com.bookjuk.dto.user.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 인증 완료 후 클라이언트에게 전송할 내용
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token; // JWT 토큰

    @Builder.Default
    private String tokenType = "Bearer"; // 토큰 타입, Bearer로 고정

    private UserResponse user; // 로그인한 유저의 정보

    /**
     * 정적 팩토리 메서드: 토큰과 유저 정보를 받아 AuthResponse 객체를 생성합니다.
     */
    public static AuthResponse of(String token, UserResponse user) {
        return AuthResponse.builder()
                .token(token)
                .user(user)
                .build();
    }
}