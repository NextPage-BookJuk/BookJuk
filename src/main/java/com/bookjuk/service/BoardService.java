package com.bookjuk.service;

import com.bookjuk.domain.board.Comment;
import com.bookjuk.domain.board.Post;
import com.bookjuk.domain.user.User;
import com.bookjuk.dto.board.request.CommentCreateRequest;
import com.bookjuk.dto.board.request.CommentUpdateRequest;
import com.bookjuk.dto.board.request.PostCreateRequest;
import com.bookjuk.dto.board.request.PostUpdateRequest;
import com.bookjuk.dto.board.response.CommentResponse;
import com.bookjuk.dto.board.response.PostDetailResponse;
import com.bookjuk.dto.board.response.PostListResponse;
import com.bookjuk.exception.CustomException;
import com.bookjuk.exception.ErrorCode;
import com.bookjuk.repository.board.CommentRepository;
import com.bookjuk.repository.board.PostRepository;
import com.bookjuk.repository.participant.MeetingParticipantRepository;
import com.bookjuk.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


/**
 * 모임 게시판 관련 비즈니스 로직을 처리하는 서비스 클래스.
 * 목록 조회(페이징, 작석자 닉네임 포함)
 * 상세 조회 (댓글 및 작성자 정보 포함)
 * 게시글 작성, 수정, 삭제
 * 댓글 작성, 수정, 삭제
 * 게시글,댓글 접근 권한 검증
 *
 * 게시글,댓글 작성: HOST 또는 APPROVED 상태의 PARTICIPANT만 가능
 * 게시글, 댓글 수정/삭제: 작성자 또는 HOST만 가능
 */
@Service
@RequiredArgsConstructor
@Transactional
public class BoardService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final MeetingParticipantRepository participantRepository;
    private final UserRepository userRepository;

    /**
     * 특정 모임의 게시글 목록을 페이징하여 조회한다.
     * N+1 문제를 방지하기 위해 게시글 작성자들의 닉네임을 한번에 조회
     *
     * @param meetingId 모임Id
     * @param page 페이지 번호(1부터시작)
     * @param size 페이지 크기
     * @return 게시글 목록 (작성자 닉네임 포함)
     * @throws CustomException 잘못된 페이지 파라미터인 경우 (INVALID_INPUT)
     */
    @Transactional(readOnly = true)
    public Page<PostListResponse> getPostList(Long meetingId, int page, int size) {
        // 페이지 파라미터 유효성 검증
        if (page < 1 || size < 1) {
            throw new CustomException(ErrorCode.INVALID_INPUT);
        }

        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Post> posts = postRepository.findByMeetingIdOrderByCreatedAtDesc(meetingId, pageable);

        // 게시글 작성자들의 ID 목록 수집
        List<Long> userIds = posts.getContent().stream()
                .map(Post::getUserId)
                .distinct()
                .collect(Collectors.toList());

        // 사용자 정보 한번에 조회 (N+1 문제 해결)
        Map<Long, String> userNameMap = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, User::getUsername));

        return posts.map(post -> PostListResponse.from(post, userNameMap.get(post.getUserId())));
    }

    /**
     * 특정 게시글의 상세 정보를 조회한다. (
     * 게시글과 함께 첫번째 댓글(있을때)도 함께 조회하며 게시글 작성자와 댓글 작성자의 닉네임도 포함된다.
     *
     * @param meetingId 모임 ID
     * @param  postId 게시글 ID
     * @return 게시글 상세 정보 (댓글 및 작성자 정보 포함)
     * @throws CustomException 게시글을 찾을 수 없는 경우 (POST_NOT_FOUND)
     */
    @Transactional(readOnly = true)
    public PostDetailResponse getPostDetail(Long meetingId, Long postId) {
        Post post = postRepository.findByPostIdAndMeetingId(postId, meetingId)
                .orElseThrow(() -> new CustomException(ErrorCode.POST_NOT_FOUND));

        // 댓글 목록 조회 (페이징 없이 모든 댓글 조회)
        Page<Comment> comments = commentRepository.findByPostIdOrderByCreatedAtAsc(postId, Pageable.unpaged());

        // 게시글 작성자와 댓글 작성자들의 ID 수집
        List<Long> allUserIds = comments.getContent().stream()
                .map(Comment::getUserId)
                .collect(Collectors.toList());
        allUserIds.add(post.getUserId());

        // 사용자 정보 한 번에 조회
        Map<Long, String> userUsernameMap = userRepository.findAllById(allUserIds).stream()
                .collect(Collectors.toMap(User::getId, User::getUsername));

        // 게시글 작성자 username 조회
        String postAuthorUsername = userUsernameMap.getOrDefault(post.getUserId(), "알 수 없는 사용자");

        // 댓글 응답 DTO 생성
        List<CommentResponse> commentResponses = comments.getContent().stream()
                .map(comment -> CommentResponse.from(comment, userUsernameMap.getOrDefault(comment.getUserId(), "알 수 없는 사용자")))
                .collect(Collectors.toList());

        return PostDetailResponse.from(post, postAuthorUsername, commentResponses);
    }

    /**
     * 새로운 게시글을 작성한다 (권한 확인 후 게시글 생성)
     * HOST 또는 APPROVED 상태의 PARTICIPANT만 작성할 수 있다.
     *
     * @param meetingId 모임 ID
     * @param userId 작성자 ID
     * @param request 게시글 작성 요청 데이터
     * @return 생성된 게시글 ID
     * @throws CustomException 작성 권한이 없는 경우 (POST_ACCESS_DENIED)
     * @throws CustomException 입력 데이터가 유효하지 않은 경우 (INVALID_INPUT)
     */
    public Long createPost(Long meetingId, Long userId, PostCreateRequest request) {
        // 입력 데이터 유효성 검증
        validatePostRequest(request.getTitle(), request.getContent());

        // 권한 확인: HOST 또는 APPROVED 상태의 PARTICIPANT만 가능
        if (!participantRepository.existsMemberWithAccess(meetingId, userId)) {
            throw new CustomException(ErrorCode.POST_ACCESS_DENIED);
        }

        Post post = Post.builder()
                .meetingId(meetingId)
                .userId(userId)
                .title(request.getTitle())
                .content(request.getContent())
                .imageUrl(request.getImageUrl())
                .build();

        Post savedPost = postRepository.save(post);
        return savedPost.getPostId();
    }

    /**
     * 기존 게시글을 수정한다.(작성자 또는 HOST 확인 후 수정)
     *
     * @param meetingId 모임 ID
     * @param postId 게시글 ID
     * @param userId 수정 요청자 ID
     * @param request 게시글 수정 데이터
     * @throws CustomException 게시글을 찾을 수 없는 경우 (POST_NOT_FOUND)
     * @throws CustomException 수정 권한이 없는 경우 (POST_MODIFY_ACCESS_DENIED)
     * @throws CustomException 입력 데이터가 유효하지 않은 경우 (INVALID_INPUT)
     */
    public void updatePost(Long meetingId, Long postId, Long userId, PostUpdateRequest request) {
        // 입력 데이터 유효성 검증
        validatePostRequest(request.getTitle(), request.getContent());

        Post post = postRepository.findByPostIdAndMeetingId(postId, meetingId)
                .orElseThrow(() -> new CustomException(ErrorCode.POST_NOT_FOUND));

        // 권한 확인: 작성자 또는 호스트만 수정 가능
        if (!canModifyPost(meetingId, postId, userId)) {
            throw new CustomException(ErrorCode.POST_MODIFY_ACCESS_DENIED);
        }

        post.edit(request.getTitle(), request.getContent(), request.getImageUrl());
    }

    /**
     * 게시글을 삭제한다.(작성자 또는 HOST 확인 후 관련 게시글과 댓글을 모두 삭제)
     * FK 제약이 없으므로 댓글을 먼저 수동으로 삭제한다.
     *
     * @param meetingId 모임 ID
     * @param postId 게시글 ID
     * @param userId 삭제 요청자 ID
     * @throws CustomException 게시글을 찾을 수 없는 경우 (POST_NOT_FOUND)
     * @throws CustomException 삭제 권한이 없는 경우 (POST_MODIFY_ACCESS_DENIED)
     */
    public void deletePost(Long meetingId, Long postId, Long userId) {
        Post post = postRepository.findByPostIdAndMeetingId(postId, meetingId)
                .orElseThrow(() -> new CustomException(ErrorCode.POST_NOT_FOUND));

        // 권한 확인: 작성자 또는 호스트만 삭제 가능
        if (!canModifyPost(meetingId, postId, userId)) {
            throw new CustomException(ErrorCode.POST_MODIFY_ACCESS_DENIED);
        }

        // 댓글 먼저 삭제 (FK 제약이 없으므로 수동으로 처리)
        commentRepository.findByPostIdOrderByCreatedAtAsc(postId, Pageable.unpaged())
                .getContent()
                .forEach(comment -> commentRepository.delete(comment));

        postRepository.delete(post);
    }

    /**
     * 게시글에 댓글을 작성한다.(한개 제한에서 여러개의 댓글로 변경)
     * HOST 또는 APPROVED 상태의 PARTICIPANT만 작성할 수 있다.
     *
     * @param meetingId 모임 ID
     * @param postId 게시글 ID
     * @param userId 작성자 ID
     * @param request 댓글 작성 요청 데이터
     * @return 생성된 댓글 ID
     * @throws CustomException 게시글을 찾을 수 없는 경우 (POST_NOT_FOUND)
     * @throws CustomException 작성 권한이 없는 경우 (COMMENT_ACCESS_DENIED)
     * @throws CustomException 입력 데이터가 유효하지 않은 경우 (INVALID_INPUT)
     */
    public Long createComment(Long meetingId, Long postId, Long userId, CommentCreateRequest request) {
        // 입력 데이터 유효성 검증
        validateCommentRequest(request.getContent());

        // 게시글 존재 확인
        Post post = postRepository.findByPostIdAndMeetingId(postId, meetingId)
                .orElseThrow(() -> new CustomException(ErrorCode.POST_NOT_FOUND));

        // 권한 확인: HOST 또는 APPROVED 상태의 PARTICIPANT만 가능
        if (!participantRepository.existsMemberWithAccess(meetingId, userId)) {
            throw new CustomException(ErrorCode.COMMENT_ACCESS_DENIED);
        }

        Comment comment = Comment.builder()
                .postId(postId)
                .userId(userId)
                .content(request.getContent())
                .build();

        Comment savedComment = commentRepository.save(comment);
        return savedComment.getId();
    }

    /**
     * 댓글을 수정합니다.
     *
     * <p>수정 권한(작성자 또는 HOST)을 확인한 후 댓글 내용을 수정합니다.
     *
     * @param meetingId 모임 ID
     * @param postId 게시글 ID
     * @param commentId 댓글 ID
     * @param userId 수정 요청자 ID
     * @param request 댓글 수정 데이터
     * @throws CustomException 게시글을 찾을 수 없는 경우 (POST_NOT_FOUND)
     * @throws CustomException 댓글을 찾을 수 없는 경우 (COMMENT_NOT_FOUND)
     * @throws CustomException 수정 권한이 없는 경우 (COMMENT_MODIFY_ACCESS_DENIED)
     * @throws CustomException 입력 데이터가 유효하지 않은 경우 (INVALID_INPUT)
     */
    public void updateComment(Long meetingId, Long postId, Long commentId, Long userId, CommentUpdateRequest request) {
        // 입력 데이터 유효성 검증
        validateCommentRequest(request.getContent());

        // 게시글 존재 확인
        postRepository.findByPostIdAndMeetingId(postId, meetingId)
                .orElseThrow(() -> new CustomException(ErrorCode.POST_NOT_FOUND));

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new CustomException(ErrorCode.COMMENT_NOT_FOUND));

        // 권한 확인: 작성자 또는 호스트만 수정 가능
        if (!canModifyComment(meetingId, commentId, userId)) {
            throw new CustomException(ErrorCode.COMMENT_MODIFY_ACCESS_DENIED);
        }

        comment.edit(request.getContent());
    }

    /**
     * 댓글을 삭제합니다 (작성자 또는 HOST 확인 후 댓글 삭제)
     *
     * @param meetingId 모임 ID
     * @param postId 게시글 ID
     * @param commentId 댓글 ID
     * @param userId 삭제 요청자 ID
     * @throws CustomException 게시글을 찾을 수 없는 경우 (POST_NOT_FOUND)
     * @throws CustomException 댓글을 찾을 수 없는 경우 (COMMENT_NOT_FOUND)
     * @throws CustomException 삭제 권한이 없는 경우 (COMMENT_MODIFY_ACCESS_DENIED)
     */
    public void deleteComment(Long meetingId, Long postId, Long commentId, Long userId) {
        // 게시글 존재 확인
        postRepository.findByPostIdAndMeetingId(postId, meetingId)
                .orElseThrow(() -> new CustomException(ErrorCode.POST_NOT_FOUND));

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new CustomException(ErrorCode.COMMENT_NOT_FOUND));

        // 권한 확인: 작성자 또는 호스트만 삭제 가능
        if (!canModifyComment(meetingId, commentId, userId)) {
            throw new CustomException(ErrorCode.COMMENT_MODIFY_ACCESS_DENIED);
        }

        commentRepository.delete(comment);
    }

    /**
     * 게시글 수정/삭제 권한을 확인한다.(작성자, 해당모임의 HOST인 경우)
     *
     * @param meetingId 모임 ID
     * @param postId 게시글 ID
     * @param userId 사용자 ID
     * @return 권한이 있으면 true, 없으면 false
     */
    private boolean canModifyPost(Long meetingId, Long postId, Long userId) {
        // 작성자인지 확인
        boolean isAuthor = postRepository.existsByPostIdAndUserId(postId, userId);
        if (isAuthor) {
            return true;
        }

        // 호스트인지 확인
        return participantRepository.existsByMeeting_IdAndParticipant_IdAndRole(
                meetingId, userId, com.bookjuk.domain.participant.ParticipantRole.HOST);
    }

    /**
     * 댓글 수정/삭제 권한을 확인한다. (작성자, 해당모임의 HOST인 경우)
     *
     * @param meetingId 모임 ID
     * @param commentId 댓글 ID
     * @param userId 사용자 ID
     * @return 권한이 있으면 true, 없으면 false
     */
    private boolean canModifyComment(Long meetingId, Long commentId, Long userId) {
        // 작성자인지 확인
        boolean isAuthor = commentRepository.existsByIdAndUserId(commentId, userId);
        if (isAuthor) {
            return true;
        }

        // 호스트인지 확인
        return participantRepository.existsByMeeting_IdAndParticipant_IdAndRole(
                meetingId, userId, com.bookjuk.domain.participant.ParticipantRole.HOST);
    }

    /**
     * 게시글 요청 데이터의 유효성을 검증한다.
     *
     * @param title 게시글 제목
     * @param content 게시글 내용
     * @throws CustomException 제목이나 내용이 비어있는 경우 (INVALID_INPUT)
     */
    private void validatePostRequest(String title, String content) {
        if (title == null || title.trim().isEmpty()) {
            throw new CustomException(ErrorCode.INVALID_INPUT);
        }
        if (content == null || content.trim().isEmpty()) {
            throw new CustomException(ErrorCode.INVALID_INPUT);
        }
        if (title.length() > 200) {
            throw new CustomException(ErrorCode.INVALID_INPUT);
        }
    }

    /**
     * 댓글 요청 데이터의 유효성을 검증한다.
     *
     * @param content 댓글 내용
     * @throws CustomException 내용이 비어있는 경우 (INVALID_INPUT)
     */
    private void validateCommentRequest(String content) {
        if (content == null || content.trim().isEmpty()) {
            throw new CustomException(ErrorCode.INVALID_INPUT);
        }
    }
    /**
     * 특정 게시글의 댓글 목록만 조회 (별도 API용)
     */
    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsByPostId(Long meetingId, Long postId) {
        // 게시글 존재 확인
        postRepository.findByPostIdAndMeetingId(postId, meetingId)
                .orElseThrow(() -> new CustomException(ErrorCode.POST_NOT_FOUND));

        // 댓글 목록 조회
        Page<Comment> comments = commentRepository.findByPostIdOrderByCreatedAtAsc(postId, Pageable.unpaged());

        // 댓글 작성자들의 ID 수집
        List<Long> userIds = comments.getContent().stream()
                .map(Comment::getUserId)
                .distinct()
                .collect(Collectors.toList());

        // 사용자 정보 한 번에 조회 (N+1 문제 해결)
        Map<Long, String> userUsernameMap = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, User::getUsername));

        // 댓글 응답 DTO 생성
        return comments.getContent().stream()
                .map(comment -> CommentResponse.from(comment,
                        userUsernameMap.getOrDefault(comment.getUserId(), "알 수 없는 사용자")))
                .collect(Collectors.toList());
    }
}
