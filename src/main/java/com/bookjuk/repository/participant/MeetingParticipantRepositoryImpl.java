package com.bookjuk.repository.participant;

import com.bookjuk.domain.participant.MeetingParticipant;
import com.bookjuk.domain.user.User;
import lombok.RequiredArgsConstructor;
import com.querydsl.jpa.impl.JPAQueryFactory;

import java.util.List;

import static com.bookjuk.domain.participant.QMeetingParticipant.meetingParticipant;


@RequiredArgsConstructor
public class MeetingParticipantRepositoryImpl implements MeetingParticipantCustom {

    // queryDsl 을 사용하기 위한 의존객체
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

    // 유저 id로 참여한 미팅 id 반환
    @Override
    public List<MeetingParticipant> findMeetingsByUserId(Long id) {
        return factory
                .selectFrom(meetingParticipant)
                .where(meetingParticipant.participant.id.eq(id))
                .fetch();
    }

}
