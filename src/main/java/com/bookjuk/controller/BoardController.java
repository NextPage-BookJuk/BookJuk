package com.bookjuk.controller;

import com.bookjuk.dto.board.request.CommentCreateRequest;
import com.bookjuk.dto.board.request.CommentUpdateRequest;
import com.bookjuk.dto.board.request.PostCreateRequest;
import com.bookjuk.dto.board.request.PostUpdateRequest;
import com.bookjuk.dto.board.response.CommentCreateResponse;
import com.bookjuk.dto.board.response.PostCreateResponse;
import com.bookjuk.dto.board.response.PostDetailResponse;
import com.bookjuk.dto.board.response.PostListResponse;
import com.bookjuk.service.BoardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

/**
 * 모임 게시판 관련 REST API를 제공하는 컨트롤러
 *
 * 게시글 작성, 수정, 삭제, 목록 조회, 상세 조회
 * 댓글 작성, 수정 삭제
 */
@Slf4j
@Controller
@RequestMapping("/api/meetings/{meetingId}/posts")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;

    /**
     * 특정 모임의 게시글 목록을 페이징하여 조회한다.(기본값: page=1, size=10)
     *
     * @param meetingId 모임 ID
     * @param page 페이지 번호 (기본값: 1)
     * @param size 페이지 크기 (기본값: 10)
     * @return 게시글 목록 응답 (200 OK)
     */
    @GetMapping   // 페이징 조회는 기본 경로
    @ResponseBody
    public ResponseEntity<Page<PostListResponse>> getPostList(
            @PathVariable Long meetingId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {

        log.info("게시글 목록 조회 요청 - meetingId: {}, page: {}, size: {}", meetingId, page, size);

        Page<PostListResponse> posts = boardService.getPostList(meetingId, page, size);

        log.info("게시글 목록 조회 완료 - meetingId: {}, totalElements: {}", meetingId, posts.getTotalElements());

        return ResponseEntity.ok(posts);
    }

    /**
     * 특정 게시글의 상세 정보를 조회한다. (게시글 정보와 모든 댓글)
     *
     * @param meetingId 모임 ID
     * @param postId 게시글 ID
     * @return 게시글 상세 정보 응답 (200 OK)
     * @throws com.bookjuk.exception.CustomException 게시글을 찾을 수 없는 경우 (404 Not Found)
     */
    @GetMapping("/{postId}")
    @ResponseBody
    public ResponseEntity<PostDetailResponse> getPostDetail(
            @PathVariable Long meetingId,
            @PathVariable Long postId) {

        log.info("게시글 상세 조회 요청 - meetingId: {}, postId: {}", meetingId, postId);

        PostDetailResponse post = boardService.getPostDetail(meetingId, postId);

        log.info("게시글 상세 조회 완료 - meetingId: {}, postId: {}, commentCount: {}",
                meetingId, postId, post.getComments().size());

        return ResponseEntity.ok(post);
    }

    /**
     * 새로운 게시글을 작성한다.(HOST 또는 APPROVED 상태의 PARTICIPANT만 작성할 수 있다)
     *
     * @param meetingId 모임 ID
     * @param request 게시글 작성 요청 데이터 (유효성 검증 적용)
     * @param userId JWT에서 추출한 사용자 ID
     * @return 생성된 게시글 ID 응답 (200 OK)
     * @throws com.bookjuk.exception.CustomException 작성 권한이 없는 경우 (403 Forbidden)
     * @throws com.bookjuk.exception.CustomException 입력 데이터가 유효하지 않은 경우 (400 Bad Request)
     */
    @PostMapping
    @ResponseBody
    public ResponseEntity<PostCreateResponse> createPost(
            @PathVariable Long meetingId,
            @Valid @RequestBody PostCreateRequest request,
            @RequestAttribute("userId") Long userId) {

        log.info("게시글 작성 요청 - meetingId: {}, userId: {}, title: {}", meetingId, userId, request.getTitle());

        Long postId = boardService.createPost(meetingId, userId, request);

        log.info("게시글 작성 완료 - meetingId: {}, userId: {}, postId: {}", meetingId, userId, postId);

        return ResponseEntity.ok(new PostCreateResponse(postId));
    }

    /**
     * 기존 게시글을 수정한다. (작성자, 모임의 HOST만 수정 가능)
     *
     * @param meetingId 모임 ID
     * @param postId 게시글 ID
     * @param request 게시글 수정 데이터 (유효성 검증 적용)
     * @param userId JWT에서 추출한 사용자 ID
     * @return 성공 응답 (200 OK)
     * @throws com.bookjuk.exception.CustomException 게시글을 찾을 수 없거나 수정 권한이 없는 경우
     */
    @PutMapping("/{postId}")
    @ResponseBody
    public ResponseEntity<Void> updatePost(
            @PathVariable Long meetingId,
            @PathVariable Long postId,
            @Valid @RequestBody PostUpdateRequest request,
            @RequestAttribute("userId") Long userId) {

        log.info("게시글 수정 요청 - meetingId: {}, postId: {}, userId: {}", meetingId, postId, userId);

        boardService.updatePost(meetingId, postId, userId, request);

        log.info("게시글 수정 완료 - meetingId: {}, postId: {}, userId: {}", meetingId, postId, userId);

        return ResponseEntity.ok().build();
    }

    /**
     * 게시글을 삭제한다. (작성자, 모임의 HOST만 가능)
     * 게시글과 함께 관련된 모든 댓글도 삭제.
     *
     * @param meetingId 모임 ID
     * @param postId 게시글 ID
     * @param userId JWT에서 추출한 사용자 ID
     * @return 성공 응답 (200 OK)
     * @throws com.bookjuk.exception.CustomException 게시글을 찾을 수 없거나 삭제 권한이 없는 경우
     */
    @DeleteMapping("/{postId}")
    @ResponseBody
    public ResponseEntity<Void> deletePost(
            @PathVariable Long meetingId,
            @PathVariable Long postId,
            @RequestAttribute("userId") Long userId) {

        log.info("게시글 삭제 요청 - meetingId: {}, postId: {}, userId: {}", meetingId, postId, userId);

        boardService.deletePost(meetingId, postId, userId);

        log.info("게시글 삭제 완료 - meetingId: {}, postId: {}, userId: {}", meetingId, postId, userId);

        return ResponseEntity.ok().build();
    }

    /**
     * 게시글에 댓글을 작성한다.
     * HOST 또는 APPROVED 상태의 PARTICIPANT만 작성할 수 있다.
     *
     * @param meetingId 모임 ID
     * @param postId 게시글 ID
     * @param request 댓글 작성 요청 데이터 (유효성 검증 적용)
     * @param userId JWT에서 추출한 사용자 ID
     * @return 생성된 댓글 ID 응답 (200 OK)
     * @throws com.bookjuk.exception.CustomException 게시글을 찾을 수 없거나 작성 권한이 없는 경우
     */
    @PostMapping("/{postId}/comments")
    @ResponseBody
    public ResponseEntity<CommentCreateResponse> createComment(
            @PathVariable Long meetingId,
            @PathVariable Long postId,
            @Valid @RequestBody CommentCreateRequest request,
            @RequestAttribute("userId") Long userId) {

        log.info("댓글 작성 요청 - meetingId: {}, postId: {}, userId: {}", meetingId, postId, userId);

        Long commentId = boardService.createComment(meetingId, postId, userId, request);

        log.info("댓글 작성 완료 - meetingId: {}, postId: {}, userId: {}, commentId: {}", meetingId, postId, userId, commentId);

        return ResponseEntity.ok(new CommentCreateResponse(commentId));
    }

    /**
     * 댓글을 수정한다. (작석장, 모임의 HOST만 가능)
     *
     * @param meetingId 모임 ID
     * @param postId 게시글 ID
     * @param commentId 댓글 ID
     * @param request 댓글 수정 데이터 (유효성 검증 적용)
     * @param userId JWT에서 추출한 사용자 ID
     * @return 성공 응답 (200 OK)
     * @throws com.bookjuk.exception.CustomException 게시글이나 댓글을 찾을 수 없거나 수정 권한이 없는 경우
     */
    @PutMapping("/{postId}/comments/{commentId}")
    @ResponseBody
    public ResponseEntity<Void> updateComment(
            @PathVariable Long meetingId,
            @PathVariable Long postId,
            @PathVariable Long commentId,
            @Valid @RequestBody CommentUpdateRequest request,
            @RequestAttribute("userId") Long userId) {

        log.info("댓글 수정 요청 - meetingId: {}, postId: {}, commentId: {}, userId: {}", meetingId, postId, commentId, userId);

        boardService.updateComment(meetingId, postId, commentId, userId, request);

        log.info("댓글 수정 완료 - meetingId: {}, postId: {}, commentId: {}, userId: {}", meetingId, postId, commentId, userId);

        return ResponseEntity.ok().build();
    }

    /**
     * 댓글을 삭제한다. (작성자, 모임의 HOST만 가능)
     *
     * @param meetingId 모임 ID
     * @param postId 게시글 ID
     * @param commentId 댓글 ID
     * @param userId JWT에서 추출한 사용자 ID
     * @return 성공 응답 (200 OK)
     * @throws com.bookjuk.exception.CustomException 게시글이나 댓글을 찾을 수 없거나 삭제 권한이 없는 경우
     */
    @DeleteMapping("/{postId}/comments/{commentId}")
    @ResponseBody
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long meetingId,
            @PathVariable Long postId,
            @PathVariable Long commentId,
            @RequestAttribute("userId") Long userId) {

        log.info("댓글 삭제 요청 - meetingId: {}, postId: {}, commentId: {}, userId: {}", meetingId, postId, commentId, userId);

        boardService.deleteComment(meetingId, postId, commentId, userId);

        log.info("댓글 삭제 완료 - meetingId: {}, postId: {}, commentId: {}, userId: {}", meetingId, postId, commentId, userId);

        return ResponseEntity.ok().build();
    }
}