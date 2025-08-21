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
    private String profileImage; // 사용자 프로필 이미지
    private Long reviewsCount; // 해당 사용자가 받은 총 리뷰 수 (Long 타입으로 변경)
    private Boolean isReviewedByCurrentUser; // 현재 사용자가 이 참여자를 리뷰 했는지 여부
    private ParticipantRole role;
    private ParticipantStatus status;
    private LocalDateTime createdAt;

    /**
     * MeetingParticipant 엔티티로부터 응답 DTO를 생성하는 정적 팩토리 메서드
     *
     * @param participant 참가자 엔티티
     * @param reviewsCount 사용자가 받은 총 리뷰 수
     * @param isReviewedByCurrentUser 현재 사용자가 이 참여자를 리뷰했는지 여부
     * @return ParticipantResponse 인스턴스
     */
    public static ParticipantResponse from(MeetingParticipant participant, Long reviewsCount, Boolean isReviewedByCurrentUser) {
        return ParticipantResponse.builder()
                .id(participant.getParticipant().getId())
                .username(participant.getParticipant().getUsername())
                .profileImage(participant.getParticipant().getProfileImage())
                .reviewsCount(reviewsCount != null ? reviewsCount : 0L)
                .isReviewedByCurrentUser(isReviewedByCurrentUser != null ? isReviewedByCurrentUser : false)
                .role(participant.getRole())
                .status(participant.getStatus())
                .createdAt(participant.getCreatedAt())
                .build();
    }

    /**
     * 리뷰 정보 없이 생성하는 간단한 팩토리 메서드
     *
     * @param participant 참가자 엔티티
     * @return ParticipantResponse 인스턴스
     */
    public static ParticipantResponse from(MeetingParticipant participant) {
        return from(participant, 0L, false);
    }
}