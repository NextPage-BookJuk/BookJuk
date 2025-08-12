package com.bookjuk.controller;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/meetings")
public class ReviewController {

    /**
     * Review API - GET 방식은 URL에 파라미터가 노출될 가능성이 높음
     * POST: /api/meeting/{meetingId}/reviews
     */
    @PostMapping("/{meetingId}/reviews")
    public ResponseEntity<?> review() {
        return null;
    }
}
