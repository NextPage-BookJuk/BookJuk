package com.bookjuk.controller;

import com.bookjuk.dto.board.request.PostUpdateRequest;
import com.bookjuk.dto.board.response.PostResponse;
import com.bookjuk.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

/**
 * 게시글 단건 수정 REST API 컨트롤러
 *
 * 게시글 ID 단위로 수정 (작성자 또는 HOST)
 */
@Slf4j
@Controller
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    /**
     * 게시글을 수정한다. (작성자, 모임 HOST만 가능)
     *
     * @param postId  게시글 ID
     * @param request 게시글 수정 요청(제목/내용 부분 수정 허용)
     * @param userId  JWT에서 추출한 사용자 ID
     * @return 수정된 게시글 응답 (200 OK)
     * @throws com.bookjuk.exception.CustomException 게시글 없음(404), 권한 없음(403), 입력 오류(400)
     */
    @PatchMapping("/{postId}")
    @ResponseBody
    public ResponseEntity<PostResponse> update(
            @PathVariable Long postId,
            @Valid @RequestBody PostUpdateRequest request,
            @RequestAttribute("userId") Long userId
    ) {
        log.info("게시글 수정 요청 - postId: {}, userId: {}", postId, userId);

        PostResponse resp = postService.updatePost(postId, request, userId);

        log.info("게시글 수정 완료 - postId: {}, userId: {}", postId, userId);
        return ResponseEntity.ok(resp);
        // BoardController와 중복 사용은 피하세요. (경로 정책 중 하나만 채택)
    }
}
