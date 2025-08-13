package com.bookjuk.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

/**
 * JWT 인증 필터
 * 클라이언트 모든 요청에 대해 토큰을 검사하는 자동화된 필터
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        try {
            // 클라이언트의 요청에서 들어온 토큰을 뜯어와야함.
            String token = extractTokenFromHeader(request);

            // 서명, 토큰 위조 검사
            if (jwtProvider.validateToken(token)) {
                // 토큰에서 이메일을 추출
                String email = jwtProvider.getEmailFromToken(token);

                // 시큐리티에게 알려줄 인증정보(사용자명, 권한) 생성
                UsernamePasswordAuthenticationToken auth
                        = new UsernamePasswordAuthenticationToken(
                        email   // Principal: 컨트롤러가 사용할 인증된 유저의 식별자
                        , null // 비밀번호 저장: 일반적으로 저장 안함
                        , new ArrayList<>()
                );


                // 스프링 시큐리티에게 인증 성공을 알려줌
                SecurityContextHolder.getContext().setAuthentication(auth);
                log.debug("JWT 인증 성공: {}", email);
            }

        } catch (Exception e) {
            log.error("JWT 인증 오류 발생: {}", e.getMessage());
        }

        // 다음 필터로 요청 전달
        filterChain.doFilter(request, response);

    }

    private String extractTokenFromHeader(HttpServletRequest request) {
        // 1. 요청 헤더에서 Authorization 키를 파싱
        String bearerToken = request.getHeader("Authorization");

        // 2. 토큰을 파싱하면 앞에 접두사로 Bearer가 붙는데 이를 제거
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}