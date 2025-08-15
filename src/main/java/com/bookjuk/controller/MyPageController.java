package com.bookjuk.controller;

import com.bookjuk.dto.mypage.MyPageResponse;
import com.bookjuk.service.MyPageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/mypage")
@RequiredArgsConstructor
public class MyPageController {

    private final MyPageService myPageService;

    @GetMapping
    public ResponseEntity<?> getMyPage(@AuthenticationPrincipal String email) {
        MyPageResponse response = myPageService.getMyPage(email);
        log.info("사용자 정보 조회 완료: {}", response.getProfile().getUsername());
        return ResponseEntity.ok(response);
    }

}
