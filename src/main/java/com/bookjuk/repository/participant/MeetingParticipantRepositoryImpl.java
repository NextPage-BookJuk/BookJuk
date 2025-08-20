package com.bookjuk.repository.participant;

import com.bookjuk.domain.participant.MeetingParticipant;
import com.bookjuk.domain.user.User;
import lombok.RequiredArgsConstructor;
import com.querydsl.jpa.impl.JPAQueryFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

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
    public Page<MeetingParticipant> findMeetingsByUserId(Long id, Pageable pageable) {

        List<MeetingParticipant> contents = factory
                .selectFrom(meetingParticipant)
                .where(meetingParticipant.participant.id.eq(id))
                .offset(pageable.getOffset())   // 시작 위치
                .limit(pageable.getPageSize())  // 페이지 크기
                .fetch();

        Long total = factory
                .select(meetingParticipant.count())
                .from(meetingParticipant)
                .where(meetingParticipant.participant.id.eq(id))
                .fetchOne();

        return new PageImpl<>(contents, pageable, total);
    }

    // 유저 id로 참여한 미팅의 총 개수 반환
    @Override
    public Long countMeetingByUserId(Long id) {
        return factory
                .select(meetingParticipant.meeting.count())
                .from(meetingParticipant)
                .where(meetingParticipant.participant.id.eq(id))
                .fetchOne();
    }

}
