package com.bookjuk.controller;

import com.bookjuk.dto.user.request.UserLoginRequest;
import com.bookjuk.dto.user.request.UserSignupRequest;
import com.bookjuk.dto.user.response.AuthResponse;
import com.bookjuk.dto.user.response.EmailCheckResponse;
import com.bookjuk.dto.user.response.UserResponse;
import com.bookjuk.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * 1-1. 회원가입 API
     * @param request 회원가입 정보 DTO (@Valid로 유효성 검증)
     * @return 생성된 사용자 정보와 HTTP 201 Created 상태 코드
     */
    @PostMapping("/signup")
    public ResponseEntity<UserResponse> signup(@Valid @RequestBody UserSignupRequest request) {
        log.info("회원가입 요청: {}", request.getEmail());
        UserResponse response = userService.registerUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 1-2. 이메일 중복 확인 API
     * @param email 검증할 이메일 주소
     * @return 이메일 사용 가능 여부와 HTTP 200 OK 상태 코드
     */
    @GetMapping("/check-email")
    public ResponseEntity<EmailCheckResponse> checkEmail(@RequestParam String email) {
        log.info("이메일 중복 확인 요청: {}", email);
        boolean isAvailable = userService.isEmailAvailable(email);
        return ResponseEntity.ok(EmailCheckResponse.of(isAvailable));
    }

    /**
     * 1-3. 로그인 API
     * @param request 로그인 정보 DTO (@Valid로 유효성 검증)
     * @return JWT 토큰, 사용자 정보와 HTTP 200 OK 상태 코드
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody UserLoginRequest request) {
        log.info("로그인 요청: {}", request.getEmail());
        AuthResponse response = userService.loginUser(request);
        return ResponseEntity.ok(response);
    }
}