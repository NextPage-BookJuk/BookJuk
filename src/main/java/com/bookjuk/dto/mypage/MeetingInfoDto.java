package com.bookjuk.dto.mypage;

import com.bookjuk.domain.meeting.Meeting;
import com.bookjuk.domain.meeting.MeetingStatus;
import com.bookjuk.domain.participant.MeetingParticipant;
import com.bookjuk.domain.participant.ParticipantRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 마이페이지 API 응답을 위한 모임 정보 DTO 클래스
 *
 * 사용자가 참여한 모임 정보를 포함합니다.
 *
 */
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MeetingInfoDto {

    // 모임 정보
    private String meetingTitle;
    private LocalDateTime meetingTime;
    private MeetingStatus meetingStatus;
    private ParticipantRole role;
    private Map<String, String> book;

    public static MeetingInfoDto from(MeetingParticipant meetingParticipant) {
        Meeting meeting = meetingParticipant.getMeeting();

        Map<String, String> bookMap = new HashMap<>();
        bookMap.put("title", meeting.getBookTitle());
        bookMap.put("author", meeting.getBookAuthor());

        return MeetingInfoDto.builder()
                .meetingTitle(meeting.getTitle())
                .meetingTime(meeting.getMeetingTime())
                .meetingStatus(meeting.getMeetingStatus())
                .role(meetingParticipant.getRole())
                .book(bookMap)
                .build();

    }
}
