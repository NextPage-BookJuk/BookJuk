package com.bookjuk.service;

import com.bookjuk.repository.meeting.MeetingRepository;
import com.bookjuk.repository.participant.MeetingParticipantRepository;
import com.bookjuk.repository.review.MeetingReviewRepository;
import com.bookjuk.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class MyPageService {

    // 의존 객체 주입
    private final UserRepository userRepository;
    private final MeetingRepository meetingRepository;
    private final MeetingReviewRepository meetingReviewRepository;
    private final MeetingParticipantRepository meetingParticipantRepository;

    public void viewMyPage() {

    }
}
