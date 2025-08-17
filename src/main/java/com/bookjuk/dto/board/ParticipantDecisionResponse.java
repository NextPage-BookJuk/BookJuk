package com.bookjuk.dto.board;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantDecisionResponse {
    private Long meetingId;
    private Long userId;   // 승인/거절 대상자
    private String status; // "APPROVED" | "REJECTED"

    public static ParticipantDecisionResponse of(Long meetingId, Long userId, String status) {
        return ParticipantDecisionResponse.builder()
                .meetingId(meetingId)
                .userId(userId)
                .status(status)
                .build();
    }
}