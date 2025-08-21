package com.bookjuk.dto.meeting;

import com.bookjuk.domain.meeting.Meeting;
import com.bookjuk.domain.meeting.MeetingStatus;
import com.bookjuk.domain.user.User;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MeetingDetailResponse {

    private Long meetingId;
    private String title;
    private String description;
    private String imageUrl;
    private String bookTitle;
    private String bookAuthor;
    private String genre;
    private LocalDateTime meetingTime;
    private String location; // 주소를 하나로 합친 필드 (호환성용)

    private String region;
    private String city;
    private String district;
    private String detailAddress;

    private int maxParticipants;
    private int currentParticipants;
    private MeetingStatus meetingStatus;

    private HostInfo host;
    private Long hostId;

    /**
     * 모임 완료 여부 확인 메서드
     */
    public boolean isCompleted() {
        return meetingStatus == MeetingStatus.COMPLETED;
    }

    /**
     * Meeting 엔티티를 DTO로 변환하는 정적 팩토리 메서드
     */
    public static MeetingDetailResponse from(Meeting meeting, int currentParticipants,
                                             int hostLikesCount, int hostMeetingsCount) {

        // 호스트 정보 생성
        HostInfo hostInfo = null;
        Long hostId = null;
        User hostUser = meeting.getHost();
        if (hostUser != null) {
            hostId = hostUser.getId();
            hostInfo = HostInfo.builder()
                    .id(hostUser.getId())
                    .username(hostUser.getUsername())
                    .likesCount(hostLikesCount)
                    .hostedMeetingsCount(hostMeetingsCount)
                    .build();
        }

        String fullLocation = String.join(" ",
                meeting.getRegion(),
                meeting.getCity(),
                meeting.getDistrict(),
                meeting.getDetailAddress() != null ? meeting.getDetailAddress() : ""
        ).trim().replaceAll("\\s+", " ");

        // ✅ 빌더 패턴으로 객체 생성
        return MeetingDetailResponse.builder()
                .meetingId(meeting.getId())
                .title(meeting.getTitle())
                .description(meeting.getDescription())
                .imageUrl(meeting.getImageUrl())
                .bookTitle(meeting.getBookTitle())
                .bookAuthor(meeting.getBookAuthor())
                .genre(meeting.getGenre())
                .meetingTime(meeting.getMeetingTime())
                .maxParticipants(meeting.getMaxParticipants())
                .meetingStatus(meeting.getMeetingStatus())
                .currentParticipants(currentParticipants)
                // ✅ 개별 주소 필드 설정
                .region(meeting.getRegion())
                .city(meeting.getCity())
                .district(meeting.getDistrict())
                .detailAddress(meeting.getDetailAddress())
                // 호환성용 location 필드
                .location(fullLocation)
                // 호스트 정보
                .hostId(hostId)
                .host(hostInfo)
                .build();
    }

    /**
     * 기존 방식 지원을 위한 오버로드된 메서드
     */
    public static MeetingDetailResponse from(Meeting meeting, int currentParticipants) {
        return from(meeting, currentParticipants, 0, 0);
    }

    /**
     * 호스트 정보 내부 클래스
     */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HostInfo {
        private Long id;
        private String username;
        private Integer likesCount;
        private Integer hostedMeetingsCount;
    }
}