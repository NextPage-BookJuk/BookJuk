package com.bookjuk.routes;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * 페이지 전환 렌더링용 컨트롤러
 * Thymeleaf 뷰템플릿 페이지를 렌더링
 */
@Controller
@Slf4j
public class PageController {
    // 메인페이지(모임리스트)로 이동
    @GetMapping("/")
    public String home() {
        return "meeting-list";
    }

    // 로그인/회원가입 페이지로 이동
    @GetMapping("/auth")
    public String auth() {
        return "auth";
    }

    // 모임 생성 페이지로 이동
    @GetMapping("/createMeeting")
    public String createMeeting() {
        return "create-meeting";
    }

    // 마이페이지로 이동
    @GetMapping("/mypage")
    public String mypage() {
        return "mypage";
    }

    // 내 정보 수정 페이지로 이동
    @GetMapping("/editProfile")
    public String editProfile() {
        return "edit-profile";
    }
}
