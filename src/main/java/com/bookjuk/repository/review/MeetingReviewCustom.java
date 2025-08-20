package com.bookjuk.repository.review;

import com.bookjuk.domain.meeting.Meeting;
import com.bookjuk.domain.user.User;

import java.util.List;

public interface MeetingReviewCustom {

    // 한 미팅에서 좋아요가 중복인지 체크
    boolean existDuplicateReview(Meeting meeting, User reviewer, User reviewee);

    // 유저 id 별로 좋아요 받은 개수 확인
    Long countReviewByUserId(Long id);

    // 특정 모임에서 리뷰어가 리뷰한 모든 참여자 ID 목록 조회
    List<Long> findReviewedUserIdsByMeeting(Long reviewerId, Long meetingId);
}
