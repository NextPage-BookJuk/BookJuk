package com.bookjuk.repository.review;

import com.bookjuk.domain.meeting.Meeting;
import com.bookjuk.domain.user.User;

public interface MeetingReviewCustomRepository {

    // 한 미팅에서 좋아요가 중복인지 체크
    boolean existDuplicateReview(Meeting meeting, User reviewer, User reviewee);
}
