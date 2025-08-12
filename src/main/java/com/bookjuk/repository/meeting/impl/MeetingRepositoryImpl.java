package com.bookjuk.repository.meeting.impl;

import com.bookjuk.domain.meeting.Meeting;
import com.bookjuk.repository.meeting.custom.MeetingRepositoryCustom;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.OrderSpecifier;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.NumberExpression;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;

import static com.bookjuk.domain.meeting.QMeeting.meeting;
import static com.bookjuk.domain.review.QMeetingReview.meetingReview;

/**
 * MeetingRepositoryCustom의 구현체
 * QueryDSL이나 JDBC 네이티브쿼리 자유롭게 사용가능
 */
@Repository
@Slf4j
@RequiredArgsConstructor
public class MeetingRepositoryImpl implements MeetingRepositoryCustom {

    private final JPAQueryFactory factory;

    @Override
    public Page<Meeting> getTripList(MeetingSearchCondition condition, Pageable pageable) {

        log.info("\ngetTripList call by QueryDSL");

        // WHERE절 동적으로 만들기
        BooleanBuilder whereClause = new BooleanBuilder();
        // 1. 모임은 무조건 방장이 있어야 함.
        whereClause.and(meeting.host.isNotNull());
        // 2. 시/도 검색
        if (condition.getRegion() != null) {
            whereClause.and(meeting.region.eq(condition.getRegion()));
        }
        // 3. 시/구/군 검색
        if (condition.getCity() != null) {
            whereClause.and(meeting.city.eq(condition.getCity()));
        }
        // 4. 모임 장르 검색
        if (condition.getGenre() != null) {
            whereClause.and(meeting.genre.eq(condition.getGenre()));
        }
        // 5. 모집 상태 검색, 필터링 없으면 RECRUITING 상태의 모임만 나온다.
        if (condition.getStatus() != null) {
            whereClause.and(meeting.meetingStatus.eq(condition.getStatus()));
        }

        // 모임 목록 조회
        List<Meeting> meetingList = factory
                .selectFrom(meeting)
                .where(whereClause)
                .orderBy(getOrderSpecifier(condition))
                .fetch();


        return null;
    }

    private OrderSpecifier<?> getOrderSpecifier(MeetingSearchCondition condition) {

        // 정렬조건
        String sortBy = condition.getSortBy();

        OrderSpecifier<?> specifier;

        switch (sortBy.toLowerCase()) {
            case "latest": // 생성일 기준 최신순
                return meeting.createdAt.desc();
            case "deadline": // 미팅 시간 임박 순서
                return meeting.meetingTime.desc();
            case "popular":
                // 서브쿼리로 count(*) 가져오기
                NumberExpression<Long> reviewCountSub =
                        Expressions.numberTemplate(Long.class,
                                "({0})",
                                JPAExpressions
                                        .select(meetingReview.id.count())
                                        .from(meetingReview)
                                        .where(meetingReview.reviewee.eq(meeting.host))
                        );

                // NULL → 0 처리
                NumberExpression<Long> reviewCountOrZero =
                        Expressions.numberTemplate(Long.class, "coalesce({0}, 0)", reviewCountSub);

                return reviewCountOrZero.desc();
            default:
                return meeting.createdAt.desc();
        }

    }
}
