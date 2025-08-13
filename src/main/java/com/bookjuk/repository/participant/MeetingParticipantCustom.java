package com.bookjuk.repository.participant;

import com.bookjuk.domain.user.User;

import java.util.List;

public interface MeetingParticipantCustom {

    // 미팅 id로 미팅 참여자 찾기
    List<User> findMeetingParticipantsByMeetingId(Long id);

}
