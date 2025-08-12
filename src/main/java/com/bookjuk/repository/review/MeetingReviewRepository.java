package com.bookjuk.repository.review;

import com.bookjuk.domain.review.MeetingReview;
import com.bookjuk.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface MeetingReviewRepository extends JpaRepository<MeetingReview, Long>, MeetingReviewCustomRepository {

}

