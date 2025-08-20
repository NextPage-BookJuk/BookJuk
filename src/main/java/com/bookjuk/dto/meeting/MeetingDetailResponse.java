package com.bookjuk.dto.meeting;

import com.bookjuk.domain.meeting.Meeting;
import com.bookjuk.domain.meeting.MeetingStatus;
import com.bookjuk.domain.user.User;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class MeetingDetailResponse {

    private Long meetingId;
    private String title;
    private String description;
    private String imageUrl;
    private String bookTitle;
    private String bookAuthor;
    private String genre;
    private LocalDateTime meetingTime;
    private String location; // 주소를 하나로 합친 필드
    private int maxParticipants;
    private int currentParticipants; // 현재 참여 인원
    private MeetingStatus meetingStatus;

    //  호스트 정보를 직접 필드로 추가
    private HostInfo host;

    // HostInfoResponseDto 대신 User의 정보를 직접 필드로 선언
    private Long hostId;

    /**
     * 모임 완료 여부 확인 메서드
     */
    public boolean isCompleted() {
        return meetingStatus == MeetingStatus.COMPLETED;
    }

    /**
     * Meeting 엔티티를 DTO로 변환하는 정적 팩토리 메서드
     * @param meeting 원본 Meeting 엔티티
     * @param currentParticipants 서비스 계층에서 계산된 현재 참여 인원
     * @param hostLikesCount 호스트가 받은 좋아요 수 (새로 추가)
     * @param hostMeetingsCount 호스트가 주최한 모임 수 (새로 추가)
     * @return 변환된 DTO 객체
     */
    public static MeetingDetailResponse from(Meeting meeting, int currentParticipants,
                                             int hostLikesCount, int hostMeetingsCount) {
        MeetingDetailResponse dto = new MeetingDetailResponse();

        // 1. 모임 관련 정보 설정
        dto.setMeetingId(meeting.getId());
        dto.setTitle(meeting.getTitle());
        dto.setDescription(meeting.getDescription());
        dto.setImageUrl(meeting.getImageUrl());
        dto.setBookTitle(meeting.getBookTitle());
        dto.setBookAuthor(meeting.getBookAuthor());
        dto.setGenre(meeting.getGenre());
        dto.setMeetingTime(meeting.getMeetingTime());
        dto.setMaxParticipants(meeting.getMaxParticipants());
        dto.setMeetingStatus(meeting.getMeetingStatus());
        dto.setCurrentParticipants(currentParticipants);

        // 2. 주소 정보 조합
        String fullLocation = String.join(" ", meeting.getRegion(), meeting.getCity(), meeting.getDetailAddress()).trim();
        dto.setLocation(fullLocation);

        // 3. 호스트 정보 설정 (완전한 객체로)
        User hostUser = meeting.getHost();
        if (hostUser != null) {
            dto.setHostId(hostUser.getId()); // hostId도 설정
            dto.setHost(HostInfo.builder()
                    .id(hostUser.getId())
                    .username(hostUser.getUsername())
                    .likesCount(hostLikesCount) // 실제 좋아요 수
                    .hostedMeetingsCount(hostMeetingsCount) // 실제 주최 모임 수
                    .build());
        }
        return dto;
    }

    /**
     * 기존 방식 지원을 위한 오버로드된 메서드 (좋아요/모임 수 기본값 0)
     */
    public static MeetingDetailResponse from(Meeting meeting, int currentParticipants) {
        return from(meeting, currentParticipants, 0, 0);
    }

    /**
     * 호스트 정보 내부 클래스
     */
    @Getter
    @Builder
    public static class HostInfo {
        private Long id;
        private String username;
        private Integer likesCount;
        private Integer hostedMeetingsCount;
    }
}