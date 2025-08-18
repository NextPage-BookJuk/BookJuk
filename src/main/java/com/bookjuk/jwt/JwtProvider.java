// src/main/java/com/bookjuk/jwt/JwtProvider.java
package com.bookjuk.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * JWT 토큰 생성, 검증, 파싱 기능을 제공하는 유틸 클래스
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class JwtProvider {

    private final JwtProperties jwtProperties;

    /**
     * JWT 토큰 발급에 필요한 서명 만들기
     * @return - 서명 키 객체
     */
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8));
    }

    /**
     * JWT 토큰을 발급하는 메서드
     * @param email - 발급 대상의 이메일 (사용자를 식별하는 값)
     * @return - 생성된 JWT 토큰 문자열
     */
    public String generateToken(String email) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtProperties.getExpiration());

        return Jwts.builder()
                .setSubject(email) // 이 토큰을 유일하게 식별할 키
                .setIssuedAt(now) // 언제 발급했는지
                .setExpiration(expiryDate) // 언제 만료되는지
                .issuer("BookJuk") // 발급자 정보
                .signWith(getSigningKey()) // 서명
                .compact();
    }

    /**
     * 주어진 토큰을 검증하고, 유효하면 true를 반환합니다.
     * @param token - 검증할 JWT 토큰
     * @return 토큰 유효성 여부
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.error("유효하지 않은 토큰입니다. reason: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 토큰에서 사용자 이메일(Subject)을 추출합니다.
     * @param token - JWT 토큰
     * @return 사용자 이메일
     */
    public String getEmailFromToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }
}