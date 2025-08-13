/*
package com.bookjuk.service;

import com.bookjuk.domain.meeting.Meeting;
import com.bookjuk.domain.meeting.MeetingStatus;
import com.bookjuk.domain.review.MeetingReview;
import com.bookjuk.domain.user.User;
import com.bookjuk.exception.CustomException;
import com.bookjuk.exception.ErrorCode;
import com.bookjuk.repository.participant.MeetingParticipantRepository;
import com.bookjuk.dto.review.ReviewRequest;
import com.bookjuk.dto.review.ReviewResponse;
import com.bookjuk.repository.meeting.MeetingRepository;
import com.bookjuk.repository.review.MeetingReviewRepository;
import com.bookjuk.repository.user.UserRepository;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

import static com.bookjuk.domain.meeting.MeetingStatus.COMPLETED;

@RequiredArgsConstructor
@Service
@Transactional
@Slf4j
public class ReviewService {

    // 의존 객체 주입
    private final MeetingReviewRepository meetingReviewRepository;
    private final MeetingRepository meetingRepository;
    private final MeetingParticipantRepository meetingParticipantRepository;
    private final UserRepository userRepository;

    */
/**
     * 좋아요 남기기 로직
     *
     *//*

    public ReviewResponse createReview(Long meetingId, Long reviewerId, Long revieweeId) {

        // 1. 미팅 정보 확인
        // 미팅 id로 해당 미팅이 존재하는지 확인
        // Meeting foundMeeting = meetingRepository.findById(meetingId).orElseThrow();
        // orElseThrow(() -> throw new CustomException())
        Meeting meeting = meetingRepository.findById(meetingId).orElseThrow(
                () -> new CustomException(ErrorCode.MEETING_NOT_FOUND)
        );

        // 2. 미팅의 종료여부 확인
        // 가져온 미팅의 상태가 종료인지 확인
        if(!meeting.getMeetingStatus().equals(COMPLETED)) throw new CustomException(ErrorCode.MEETING_NOT_COMPLETED);


        // 3. 유저(reviewer, reviewee) 가 미팅에 참여한 유저인지 확인
        // reviewerId 와 revieweeId 가 같은 지 확인
        // 자기 자신에게는 리뷰를 남길 수 없게 함
        if(reviewerId.equals(revieweeId)) throw new CustomException(ErrorCode.LIKE_SELF_NOT_ALLOWED);

        List<User> users = meetingParticipantRepository.findMeetingParticipantsByMeetingId(meetingId);

        boolean foundReviewer = false;
        boolean foundReviewee = false;

        // 가져온 유저정보를 확인해서 리뷰어, 리뷰이 id에 맞는 유저를 저장
        User reviewer = null;
        User reviewee = null;

        for (User user : users) {
            if(user.getId().equals(revieweeId))  {
                foundReviewee = true;
                reviewee = user;
            }
            if(user.getId().equals(reviewerId)) {
                foundReviewer = true;
                reviewer = user;
            }
        }

        if(!(foundReviewer && foundReviewee)) throw new CustomException(ErrorCode.USER_NOT_PARTICIPANT);

        // 리뷰어가 리뷰이에게 리뷰를 남겼는지 중복 체크
        boolean flag = meetingReviewRepository.existDuplicateReview(meeting, reviewer, reviewee);

        // 4. 리뷰 테이블에 insert
        // review 객체 생성
        if(flag) throw new CustomException(ErrorCode.DUPLICATE_LIKE);

        MeetingReview saved = MeetingReview.builder()
                .meeting(meeting)
                .reviewer(reviewer)
                .reviewee(reviewee)
                .build();

        // 5. meeting 리뷰 테이블에 저장
        meetingReviewRepository.save(saved);
        return ReviewResponse.from(saved);

    }


}
*/
