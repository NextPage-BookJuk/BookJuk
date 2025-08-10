package com.bookjuk.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

// 테스트용 간단 페이지 라우팅 컨트롤러
@Controller
@RequestMapping
public class PageTestController {

    // 헬스체크/서버 동작 확인용
    @GetMapping("/test")
    @ResponseBody
    public String test() {
        return "Hello World! Server is running!";
    }

    // 인증 페이지
    @GetMapping("/auth")
    public String auth() {
        // src/main/resources/templates/auth.html
        return "auth";
    }

    // 마이페이지
    @GetMapping("/mypage")
    public String mypage() {
        // src/main/resources/templates/mypage.html
        return "mypage";
    }

    // 프로필 수정 페이지
    @GetMapping("/profile/edit")
    public String editProfile() {
        // src/main/resources/templates/edit-profile.html
        return "edit-profile";
    }

    // 모임 생성 페이지
    @GetMapping("/meeting/create")
    public String createMeeting() {
        // src/main/resources/templates/create-meeting.html
        return "create-meeting";
    }

    // 모임 상세 페이지 (동적 파라미터 예시)
    @GetMapping("/meeting/{id}")
    public String meetingDetail(@PathVariable Long id, Model model) {
        model.addAttribute("meetingId", id);
        // src/main/resources/templates/meeting-detail.html
        return "meeting-detail";
    }

    // 게시글 상세 페이지 (동적 파라미터 예시)
    @GetMapping("/board/{postId}")
    public String boardDetail(@PathVariable Long postId, Model model) {
        model.addAttribute("postId", postId);
        // src/main/resources/templates/board-detail.html
        return "board-detail";
    }
}
