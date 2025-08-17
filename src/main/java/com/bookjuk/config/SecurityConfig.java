package com.bookjuk.config;

import com.bookjuk.jwt.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

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

                // 인가 설정
                .authorizeHttpRequests(
                        auth -> auth
                                // 공개 접근 가능한 경로 (로그인 불필요)
                                .requestMatchers(
                                        "/"
                                        , "/auth"
                                        , "/login"
                                        , "/signup"
                                        , "/meetings/list"
                                        , "/meetings/create"
                                ).permitAll()
                                .requestMatchers("/css/**", "/js/**", "/images/**").permitAll()
                                .requestMatchers("/api/users/**").permitAll()

                                // 인증 및 권한이 필요한 경로
//                                .requestMatchers("/api/premium/**").hasAnyAuthority("VIP", "GOLD")
//                                .requestMatchers("/api/**").authenticated()

                                // 기타 경로
                                // 모든 다른 요청은 인증이 필요하다
                                // .anyRequest().authenticated() // 원본
                                .anyRequest().permitAll() // 테스트용
                )


                // 커스텀 필터 설정
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
        ;

        return http.build();

    }
}
