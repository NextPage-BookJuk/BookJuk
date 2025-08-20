package com.bookjuk.controller;

import com.bookjuk.dto.common.ApiResponse;
import com.bookjuk.dto.mypage.MeetingInfoDto;
import com.bookjuk.dto.mypage.MyPageResponse;
import com.bookjuk.dto.mypage.request.UpdateProfileRequest;
import com.bookjuk.dto.mypage.response.UpdateProfileResponse;
import com.bookjuk.service.MyPageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
        return ResponseEntity.ok(ApiResponse.success("마이페이지 정보 조회를 성공했습니다.", response));
    }

    @GetMapping("/meetings")
    public ResponseEntity<?> getMyMeetings(
            @AuthenticationPrincipal String email,
            @PageableDefault(page = 0, size = 5, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<MeetingInfoDto> response = myPageService.getMyMeetings(email, pageable);
        return ResponseEntity.ok(ApiResponse.success("마이페이지 나의 참여 모임 정보 조회를 성공했습니다.", response));
    }

    @PutMapping("/profile")
    @ResponseBody
    public ResponseEntity<?> updateProfile(
            @RequestPart("profile") @Valid UpdateProfileRequest request
            ,@AuthenticationPrincipal String email
            ,@RequestPart(value = "imageFile", required = false) MultipartFile imageFile
            ) {

        UpdateProfileResponse response = myPageService.updateProfile(request, email, imageFile);
        log.info("사용자 정보 수정 완료: {}", response.getUsername());
        return ResponseEntity.ok(ApiResponse.success("프로필이 수정되었습니다", response));
    }
}
