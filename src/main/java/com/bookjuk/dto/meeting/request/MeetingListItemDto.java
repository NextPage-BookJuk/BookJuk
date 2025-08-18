package com.bookjuk.dto.meeting.request;

import com.bookjuk.domain.meeting.Meeting;
import com.bookjuk.domain.user.User;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 모임 목록 전용 응답 DTO
 * /api/meetings 목록 화면 렌더링에 필요한 정보만 포함
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MeetingListItemDto {

    private Long meetingId;

    @Getter @Builder
    @AllArgsConstructor @NoArgsConstructor
    public static class HostSummary {
        private Long userId;
        private String username;
        private String profileImage;
        private String introduction;
        private Long hostLikeCount;
    }

    private HostSummary host;

    private String title;
    private String description;
    private String imageUrl;

    private String bookTitle;
    private String bookAuthor;
    private String genre;
    private LocalDateTime meetingTime;

    private String region;
    private String city;
    private String district;
    private String detailAddress;

    private Integer maxParticipants;
    private Integer currentParticipants;

    private String status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static MeetingListItemDto from(Meeting m, int currentParticipants, Long hostLikeCount) {
        User h = m.getHost();
        HostSummary hostSummary = HostSummary.builder()
                .userId(h.getId())
                .username(h.getUsername())
                .profileImage(h.getProfileImage())
                .introduction(h.getIntroduction())
                .hostLikeCount(hostLikeCount)
                .build();

        return MeetingListItemDto.builder()
                .meetingId(m.getId())
                .host(hostSummary)
                .title(m.getTitle())
                .description(m.getDescription())
                .imageUrl(m.getImageUrl())
                .bookTitle(m.getBookTitle())
                .bookAuthor(m.getBookAuthor())
                .genre(m.getGenre())
                .meetingTime(m.getMeetingTime())
                .region(m.getRegion())
                .city(m.getCity())
                .detailAddress(m.getDetailAddress())
                .maxParticipants(m.getMaxParticipants())
                .currentParticipants(currentParticipants)
                .status(m.getMeetingStatus().name())
                .createdAt(m.getCreatedAt())
                .updatedAt(m.getUpdatedAt())
                .build();
    }
}
