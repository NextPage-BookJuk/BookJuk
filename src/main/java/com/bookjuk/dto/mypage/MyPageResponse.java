package com.bookjuk.dto.mypage;

import com.bookjuk.domain.meeting.Meeting;
import com.bookjuk.domain.meeting.MeetingStatus;
import com.bookjuk.domain.participant.MeetingParticipant;
import com.bookjuk.domain.participant.ParticipantRole;
import com.bookjuk.domain.user.User;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 마이페이지 API 응답을 위한 DTO 클래스
 *
 * 사용자의 프로필 정보, 통계 정보, 참여한 미팅 목록을 포함합니다.
 *
 */
@Getter
@Builder @ToString
@AllArgsConstructor
@NoArgsConstructor
public class MyPageResponse {


    private UserInfoDto profile;
    private StaticsInfoDto statistics;
    private List<MeetingInfoDto> meetings;


    // 마이페이지 응답 dto로 바꾸는 정적 팩토리 메소드
    public static MyPageResponse of(UserInfoDto profile, StaticsInfoDto statistics, List<MeetingInfoDto> meetings) {

        return MyPageResponse.builder()
                .profile(profile)
                .statistics(statistics)
                .meetings(meetings)
                .build();
    }
}

