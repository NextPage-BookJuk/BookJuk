package com.bookjuk.repository.participant;

import com.bookjuk.domain.participant.MeetingParticipant;
import com.bookjuk.domain.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface MeetingParticipantCustom {

    // 미팅 id로 미팅 참여자 찾기
    List<User> findMeetingParticipantsByMeetingId(Long id);

    // 유저 id로 참여 미팅 리스트 반환
    Page<MeetingParticipant> findMeetingsByUserId(Long id, Pageable pageable);

    // 유저 id도 참여 미팅 리스트의 총 개수 반환
    Long countMeetingByUserId(Long id);
}
