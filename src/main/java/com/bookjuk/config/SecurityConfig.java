package com.bookjuk.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // 비밀번호 암호화를 위한 PasswordEncoder 빈 등록
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // 기본 인증 옵션 설정
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                // CSRF 공격 설정 off - JWT 인증방식 방해
                .csrf(AbstractHttpConfigurer::disable)
                // CORS 설정 off - 우리가 따로 나중에 수동설정
                .cors(cors-> cors.configure(http))
                // 세션 관리 설정을 JWT에 맞게 함
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // 로그인 기본 폼 제거
                .formLogin(AbstractHttpConfigurer::disable)
                // 기본 인증 비활성화
                .httpBasic(AbstractHttpConfigurer::disable)
        ;

        return http.build();

    }
}
