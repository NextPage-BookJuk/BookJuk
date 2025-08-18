package com.bookjuk.service;

import com.bookjuk.domain.board.Post;
import com.bookjuk.domain.participant.ParticipantRole;
import com.bookjuk.dto.board.request.PostUpdateRequest;
import com.bookjuk.dto.board.response.PostResponse;
import com.bookjuk.exception.CustomException;
import com.bookjuk.exception.ErrorCode;
import com.bookjuk.repository.board.PostRepository;
import com.bookjuk.repository.participant.MeetingParticipantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final MeetingParticipantRepository meetingParticipantRepository;

    @Transactional
    public PostResponse updatePost(Long postId, PostUpdateRequest req, Long requesterId) {
        // 1) 게시글 로드
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new CustomException(ErrorCode.POST_NOT_FOUND));

        // 2) 권한 판단: 작성자 or HOST
        boolean isAuthor = postRepository.existsByPostIdAndUserId(postId, requesterId);
        Long meetingId = post.getMeetingId(); // 엔티티에서 직접 참조
        boolean isHost = meetingParticipantRepository
                .existsByMeeting_IdAndParticipant_IdAndRole(meetingId, requesterId, ParticipantRole.HOST);

        if (!isAuthor && !isHost) {
            throw new CustomException(ErrorCode.POST_MODIFY_ACCESS_DENIED);
        }

        // 3) 빈 업데이트 요청 가드(제목/내용 모두 없음/공백이면 차단)
        boolean noTitle = (req.getTitle() == null || req.getTitle().trim().isEmpty());
        boolean noContent = (req.getContent() == null || req.getContent().trim().isEmpty());
        if (noTitle && noContent) {
            throw new CustomException(ErrorCode.INVALID_INPUT);
        }

        // 4) 실제 수정(세터 금지 → 도메인 메서드 사용)
        post.updateTitle(req.getTitle());
        post.updateContent(req.getContent());

        // 5) 응답
        return PostResponse.from(post); // 더티 체킹으로 커밋 시 DB 반영
    }
}
