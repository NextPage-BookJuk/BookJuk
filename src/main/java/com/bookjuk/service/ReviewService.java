package com.bookjuk.service;

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

@RequiredArgsConstructor
@Service
@Slf4j
public class ReviewService {

    // 의존 객체 주입
    private final MeetingReviewRepository meetingReviewRepository;
    // 각 레포지토리 생성 후 주석 제거
    /*
    private final MeetingRepository meetingRepository;
    private final MeetingParticipantRepository meetingParticipantRepository;
    private final UserRepository userRepository;
    */

    /**
     * 좋아요 남기기 로직
     *
     */
    public void createReview(Long meetingId, Long reviewerId, Long revieweeId) {

        // 1. 미팅 정보 확인
        // 미팅 id로 해당 미팅이 존재하는지 확인
        // Meeting foundMeeting = meetingRepository.findById(meetingId).orElseThrow();
        // orElseThrow(() -> throw new CustomException())

        // 2. 미팅의 종료여부 확인
        // 가져온 미팅의 상태가 종료인지 확인
        // if(!foundMeeting.getStatue.equals(COMPLETED)) throw new CustomException(Error);

        // 3. 유저(reviewer, reviewee) 가 미팅에 참여한 유저인지 확인
        // Long userId = foundMeeting.getUser().getUserId();
        // if(!userId == reviewerId) throw new CustomException()
        // if(!userId == revieweeId) throw new CustomException()


        // 4. 리뷰 테이블에 insert
        // review 객체 생성
        // MeetingReview.Builder().meeting().reviewer().reviewee().build();
        // meetingRepository.save();

    }


}
