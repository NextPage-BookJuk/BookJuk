package com.bookjuk.repository.review;

import com.bookjuk.domain.meeting.Meeting;
import com.bookjuk.domain.review.MeetingReview;
import com.bookjuk.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MeetingReviewRepository extends JpaRepository<MeetingReview, Long>, MeetingReviewCustom {
    /**
     * 특정 모임의 모든 리뷰 조회
     */
    List<MeetingReview> findByMeeting(Meeting meeting);

    /**
     * 특정 모임에서 특정 사용자가 받은 리뷰 수
     */
    int countByMeetingAndReviewee(Meeting meeting, User reviewee);

    /**
     * 특정 사용자가 받은 전체 리뷰 수
     */
    int countByReviewee(User reviewee);
}

