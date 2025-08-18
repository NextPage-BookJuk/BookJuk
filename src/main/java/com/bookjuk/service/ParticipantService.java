package com.bookjuk.service;

import com.bookjuk.domain.participant.MeetingParticipant;
import com.bookjuk.domain.participant.ParticipantRole;
import com.bookjuk.domain.participant.ParticipantStatus;
import com.bookjuk.dto.board.ParticipantDecisionRequest;
import com.bookjuk.dto.board.ParticipantDecisionResponse;
import com.bookjuk.exception.CustomException;
import com.bookjuk.exception.ErrorCode;
import com.bookjuk.repository.participant.MeetingParticipantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ParticipantService {

    private final MeetingParticipantRepository meetingParticipantRepository;

    @Transactional
    public ParticipantDecisionResponse decideParticipant(
            Long meetingId, Long targetUserId, ParticipantDecisionRequest req, Long requesterId) {

        // 1) 요청자 HOST 검증
        boolean isHost = meetingParticipantRepository
                .existsByMeeting_IdAndParticipant_IdAndRole(meetingId, requesterId, ParticipantRole.HOST);
        if (!isHost) {
            throw new CustomException(ErrorCode.NOT_MEETING_HOST);
        }

        // 2) 대상 신청건 조회
        MeetingParticipant mp = meetingParticipantRepository
                .findByMeeting_IdAndParticipant_Id(meetingId, targetUserId)
                .orElseThrow(() -> new CustomException(ErrorCode.PARTICIPANT_NOT_FOUND));

        // 3) 상태 전이 가능 여부(PENDING만 가능)
        if (mp.getStatus() != ParticipantStatus.PENDING) {
            throw new CustomException(ErrorCode.INVALID_STATUS_TRANSITION);
        }

        // 4) 승인/거절 처리 (세터 금지 → 도메인 메서드)
        if (req.getAction() == ParticipantDecisionRequest.Action.APPROVE) {
            mp.approve();
        } else if (req.getAction() == ParticipantDecisionRequest.Action.REJECT) {
            mp.reject();
        } else {
            throw new CustomException(ErrorCode.INVALID_INPUT);
        }

        // 5) 응답
        return ParticipantDecisionResponse.of(meetingId, targetUserId, mp.getStatus().name());
    }
}
