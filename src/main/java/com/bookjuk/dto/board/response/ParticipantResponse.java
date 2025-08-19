package com.bookjuk.dto.board.response;

import com.bookjuk.domain.participant.MeetingParticipant;
import com.bookjuk.domain.participant.ParticipantRole;
import com.bookjuk.domain.participant.ParticipantStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 참가자 정보 응답 DTO
 * 프론트엔드에서 참가자 목록 표시에 필요한 정보를 포함
 */
@Getter
@Builder
public class ParticipantResponse {

    private Long id;
    private String username;
    private ParticipantRole role;
    private ParticipantStatus status;
    private LocalDateTime createdAt;
    private Integer likesCount; // 사용자가 받은 좋아요 수 (선택사항)

    /**
     * MeetingParticipant 엔티티로부터 응답 DTO를 생성하는 정적 팩토리 메서드
     *
     * @param participant 참가자 엔티티
     * @param likesCount 사용자가 받은 좋아요 수 (nullable)
     * @return ParticipantResponse 인스턴스
     */
    public static ParticipantResponse from(MeetingParticipant participant, Integer likesCount) {
        return ParticipantResponse.builder()
                .id(participant.getParticipant().getId())
                .username(participant.getParticipant().getUsername())
                .role(participant.getRole())
                .status(participant.getStatus())
                .createdAt(participant.getCreatedAt())
                .likesCount(likesCount != null ? likesCount : 0)
                .build();
    }

    /**
     * 좋아요 수 없이 생성하는 간단한 팩토리 메서드
     *
     * @param participant 참가자 엔티티
     * @return ParticipantResponse 인스턴스
     */
    public static ParticipantResponse from(MeetingParticipant participant) {
        return from(participant, 0);
    }
}