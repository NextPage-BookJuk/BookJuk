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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

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

    /**
     * 모임 종료 후 다른 참여자에게 리뷰(좋아요)를 남길 수 있는 기능입니다.
     * @param meetingId - 모임 id
     * @param reviewerId - 리뷰를 남기려는 유저 본인 id
     * @param request -  api 로 응답받은 다른 참가자 정보
     * @return ReviewResponse
     */
    public ReviewResponse createReview(Long meetingId, Long reviewerId, ReviewRequest request) {

        // 1. 미팅 정보 확인
        Meeting meeting = meetingRepository.findById(meetingId).orElseThrow(
                () -> new CustomException(ErrorCode.MEETING_NOT_FOUND)
        );

        // 2. 미팅의 종료여부 확인
        if(!meeting.getMeetingStatus().equals(COMPLETED)) {
            throw new CustomException(ErrorCode.MEETING_NOT_COMPLETED);
        }

        // 3. 유저(reviewer, reviewee) 가 미팅에 참여한 유저인지 확인
        Long revieweeId = request.getToUserId();
        if(reviewerId.equals(revieweeId)) {
            throw new CustomException(ErrorCode.LIKE_SELF_NOT_ALLOWED);
        }

        List<User> users = meetingParticipantRepository.findMeetingParticipantsByMeetingId(meetingId);

        boolean foundReviewer = false;
        boolean foundReviewee = false;

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

        if(!(foundReviewer && foundReviewee)) {
            throw new CustomException(ErrorCode.USER_NOT_PARTICIPANT);
        }

        // 리뷰어가 리뷰이에게 리뷰를 남겼는지 중복 체크
        boolean flag = meetingReviewRepository.existDuplicateReview(meeting, reviewer, reviewee);

        if(flag) {
            throw new CustomException(ErrorCode.DUPLICATE_LIKE);
        }

        // 4. 리뷰 객체 생성 및 저장
        MeetingReview saved = MeetingReview.builder()
                .meeting(meeting)
                .reviewer(reviewer)
                .reviewee(reviewee)
                .build();

        meetingReviewRepository.save(saved);
        return ReviewResponse.from(saved);
    }

    /**
     * 모임의 모든 리뷰 조회 (새로 추가)
     * @param meetingId 모임 ID
     * @return 리뷰 목록
     */
    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByMeetingId(Long meetingId) {
        Meeting meeting = meetingRepository.findById(meetingId).orElseThrow(
                () -> new CustomException(ErrorCode.MEETING_NOT_FOUND)
        );

        List<MeetingReview> reviews = meetingReviewRepository.findByMeeting(meeting);
        return reviews.stream()
                .map(ReviewResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 특정 사용자가 특정 모임에서 받은 리뷰 수 조회 (새로 추가)
     * @param meetingId 모임 ID
     * @param userId 사용자 ID
     * @return 리뷰 수
     */
    @Transactional(readOnly = true)
    public int getReviewCountByUserAndMeeting(Long meetingId, Long userId) {
        Meeting meeting = meetingRepository.findById(meetingId).orElseThrow(
                () -> new CustomException(ErrorCode.MEETING_NOT_FOUND)
        );

        User user = userRepository.findById(userId).orElseThrow(
                () -> new CustomException(ErrorCode.USER_NOT_FOUND)
        );

        return meetingReviewRepository.countByMeetingAndReviewee(meeting, user);
    }

    /**
     * 특정 사용자가 받은 전체 리뷰 수 조회 (새로 추가)
     * @param userId 사용자 ID
     * @return 전체 리뷰 수
     */
    @Transactional(readOnly = true)
    public int getTotalReviewCountByUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(
                () -> new CustomException(ErrorCode.USER_NOT_FOUND)
        );

        return meetingReviewRepository.countByReviewee(user);
    }

    /**
     * 현재 사용자가 특정 사용자에게 리뷰를 남겼는지 확인 (새로 추가)
     * @param meetingId 모임 ID
     * @param fromUserId 리뷰를 남긴 사용자 ID
     * @param toUserId 리뷰를 받은 사용자 ID
     * @return 리뷰 존재 여부
     */
    @Transactional(readOnly = true)
    public boolean hasUserReviewed(Long meetingId, Long fromUserId, Long toUserId) {
        Meeting meeting = meetingRepository.findById(meetingId).orElseThrow(
                () -> new CustomException(ErrorCode.MEETING_NOT_FOUND)
        );

        User reviewer = userRepository.findById(fromUserId).orElseThrow(
                () -> new CustomException(ErrorCode.USER_NOT_FOUND)
        );

        User reviewee = userRepository.findById(toUserId).orElseThrow(
                () -> new CustomException(ErrorCode.USER_NOT_FOUND)
        );

        return meetingReviewRepository.existDuplicateReview(meeting, reviewer, reviewee);
    }

    /**
     * 특정 사용자가 주최한 모임 수 조회 (새로 추가)
     * @param userId 사용자 ID
     * @return 주최한 모임 수
     */
    @Transactional(readOnly = true)
    public int getHostedMeetingsCount(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(
                () -> new CustomException(ErrorCode.USER_NOT_FOUND)
        );

        return meetingRepository.countByHost(user);
    }
}