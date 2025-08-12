package com.bookjuk.repository.participant;

import com.bookjuk.domain.user.User;
import lombok.RequiredArgsConstructor;
import com.querydsl.jpa.impl.JPAQueryFactory;

import java.util.List;

import static com.bookjuk.domain.participant.QMeetingParticipant.meetingParticipant;


@RequiredArgsConstructor
public class MeetingParticipantImpl implements MeetingParticipantCustom {

    // queryDsl을 사용하기 위한 의존객체
    private final JPAQueryFactory factory;

    // 미팅 id로 참여자 찾기
    @Override
    public List<User> findMeetingParticipantsByMeetingId(Long id) {
        return factory
                .select(meetingParticipant.participant)
                .from(meetingParticipant)
                .where(meetingParticipant.meeting.id.eq(id))
                .fetch();
    }

}
