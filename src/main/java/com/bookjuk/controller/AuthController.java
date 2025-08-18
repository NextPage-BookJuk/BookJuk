package com.bookjuk.controller;

import com.bookjuk.domain.user.User;
import com.bookjuk.dto.user.response.UserResponse;
import com.bookjuk.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 인증 관련 API 컨트롤러
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final UserService userService;

    /**
     * 현재 로그인한 사용자 정보 조회
     * JWT 토큰으로 인증된 사용자의 정보를 반환합니다.
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        try {
            // SecurityContext에서 인증된 사용자의 이메일 추출
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || authentication.getPrincipal() == null) {
                log.warn("인증 정보가 없습니다.");
                return ResponseEntity.status(401).build();
            }

            String email = authentication.getPrincipal().toString();
            log.info("현재 사용자 정보 요청: email={}", email);

            // 이메일로 사용자 조회
            User user = userService.findUser(email);

            // UserResponse로 변환하여 반환
            UserResponse response = UserResponse.from(user);
            log.info("사용자 정보 반환 성공: userId={}, username={}", user.getId(), user.getUsername());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("사용자 정보 조회 중 오류 발생", e);
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * 로그아웃 처리
     * 클라이언트에서 토큰을 제거하도록 안내
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        try {
            // JWT는 stateless이므로 서버에서 특별한 처리 없이
            // 클라이언트에서 토큰을 제거하는 것으로 충분
            log.info("로그아웃 요청 처리 완료");
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("로그아웃 처리 중 오류 발생", e);
            return ResponseEntity.status(500).build();
        }
    }
}