package com.bookjuk.repository.review;

import com.bookjuk.domain.meeting.Meeting;
import com.bookjuk.domain.user.User;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import static com.bookjuk.domain.review.QMeetingReview.meetingReview;

@RequiredArgsConstructor
public class MeetingReviewRepositoryImpl implements MeetingReviewCustom {

    // queryDsl을 사용하기 위한 의존객체
    private final JPAQueryFactory factory;

    @Override
    public boolean existDuplicateReview(Meeting meeting, User reviewer, User reviewee) {
        return factory
                .selectFrom(meetingReview)
                .where(meetingReview.meeting.eq(meeting)
                        .and(meetingReview.reviewer.eq(reviewer))
                        .and(meetingReview.reviewee.eq(reviewee))
                )
                .fetchOne() != null ? true : false;

    }

    @Override
    public Long countReviewByUserId(Long id) {
        return factory
                .select(meetingReview.reviewee.count())
                .from(meetingReview)
                .where(meetingReview.reviewee.id.eq(id))
                .fetchOne()
                ;
    }
}
