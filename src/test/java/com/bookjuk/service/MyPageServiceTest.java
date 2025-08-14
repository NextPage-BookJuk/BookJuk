package com.bookjuk.service;

import com.bookjuk.domain.meeting.Meeting;
import com.bookjuk.domain.meeting.MeetingStatus;
import com.bookjuk.domain.participant.MeetingParticipant;
import com.bookjuk.domain.participant.ParticipantRole;
import com.bookjuk.domain.participant.ParticipantStatus;
import com.bookjuk.domain.review.MeetingReview;
import com.bookjuk.domain.user.User;
import com.bookjuk.dto.mypage.MyPageResponse;
import com.bookjuk.dto.review.ReviewResponse;
import com.bookjuk.repository.meeting.MeetingRepository;
import com.bookjuk.repository.participant.MeetingParticipantRepository;
import com.bookjuk.repository.review.MeetingReviewRepository;
import com.bookjuk.repository.user.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@Rollback(value = false)
class MyPageServiceTest {
    @Autowired
    MeetingRepository meetingRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    MeetingParticipantRepository meetingParticipantRepository;

    @Autowired
    MeetingReviewRepository meetingReviewRepository;

    @Autowired
    MyPageService myPageService;

    @Autowired
    EntityManager em;

    private User u1, u2, u3, u4;
    private Meeting m1, m2, m3;
    private MeetingParticipant mp1, mp2, mp3, mp4, mp5, mp6;

    private List<MeetingParticipant> meetingParticipants;

    @BeforeEach
    void insertBulk() {
        meetingParticipantRepository.deleteAll();
        meetingRepository.deleteAll();
        userRepository.deleteAll();
        // 유저정보 만들기 (임시 테스트용)
        u1 = User.builder()
                .username("치이카와")
                .email("abc123@naver.com")
                .password("abc123")
                .build();
        u2 = User.builder()
                .username("하치와레")
                .email("abc123@google.com")
                .password("abc123d")
                .build();
        u3 = User.builder()
                .username("우사기")
                .email("abc123@daum.net")
                .password("abcd123")
                .build();

        u4 = User.builder()
                .username("주댕치")
                .email("abc123ddd@daum.net")
                .password("abcddfdf123")
                .build();

        List<User> users = userRepository.saveAllAndFlush(
                List.of(u1, u2, u3, u4)
        );

        // 모임정보 만들기
        m1 = Meeting.builder()
                .host(u1)
                .title("먼작귀친구들")
                .description("책 읽으며 놀아요.")
                .imageUrl("https://example.com/image.jpg")
                .bookTitle("먼작귀")
                .bookAuthor("나가노작가")
                .genre("동화")
                .meetingTime(LocalDateTime.of(2025, 8, 20, 19, 0))
                .region("경기도")
                .city("안산시")
                .district("단원구")
                .maxParticipants(6)
                .meetingStatus(MeetingStatus.COMPLETED)
                .build();
        m2 = Meeting.builder()
                .host(u2)
                .title("가나디친구들")
                .description("책을 읽어봅시다.")
                .imageUrl("https://example.com/image2.jpg")
                .bookTitle("가나디")
                .bookAuthor("짤쓸사람")
                .genre("동화")
                .meetingTime(LocalDateTime.of(2025, 8, 18, 19, 0))
                .region("경기도")
                .city("안양시")
                .district("단원구")
                .maxParticipants(8)
                .meetingStatus(MeetingStatus.RECRUITING)
                .build();
        m3 = Meeting.builder()
                .host(u2)
                .title("초원의 왕")
                .description("왕이 되어봅시다.")
                .imageUrl("https://example.com/image3.jpg")
                .bookTitle("라이온킹")
                .bookAuthor("무파사")
                .genre("동화")
                .meetingTime(LocalDateTime.of(2025, 8, 21, 19, 0))
                .region("경기도")
                .city("구리시")
                .district("단원구")
                .maxParticipants(4)
                .meetingStatus(MeetingStatus.RECRUITING)
                .build();

        List<Meeting> meetings = meetingRepository.saveAllAndFlush(
                List.of(m1, m2, m3)
        );

        // 참가자 정보 만들기
        mp1 = MeetingParticipant.builder()
                .participant(u1)
                .meeting(m1)
                .role(ParticipantRole.HOST)
                .status(ParticipantStatus.APPROVED)
                .build();
        mp2 = MeetingParticipant.builder()
                .participant(u2)
                .meeting(m1)
                .role(ParticipantRole.PARTICIPANT)
                .status(ParticipantStatus.APPROVED)
                .build();
        mp3 = MeetingParticipant.builder()
                .participant(u3)
                .meeting(m1)
                .role(ParticipantRole.PARTICIPANT)
                .status(ParticipantStatus.PENDING)
                .build();
        mp4 = MeetingParticipant.builder()
                .participant(u1)
                .meeting(m2)
                .role(ParticipantRole.PARTICIPANT)
                .status(ParticipantStatus.PENDING)
                .build();
        mp5 = MeetingParticipant.builder()
                .participant(u2)
                .meeting(m2)
                .role(ParticipantRole.HOST)
                .status(ParticipantStatus.APPROVED)
                .build();
        mp6 = MeetingParticipant.builder()
                .participant(u2)
                .meeting(m3)
                .role(ParticipantRole.HOST)
                .status(ParticipantStatus.APPROVED)
                .build();


        meetingParticipants = meetingParticipantRepository.saveAllAndFlush(
                List.of(mp1, mp2, mp3, mp4, mp5, mp6)
        );

        // 좋아요 정보 생성
        MeetingReview rw1 = MeetingReview.builder()
                .meeting(m1)
                .reviewer(u1)
                .reviewee(u2)
                .build();

        MeetingReview rw2 = MeetingReview.builder()
                .meeting(m1)
                .reviewer(u1)
                .reviewee(u3)
                .build();

        meetingReviewRepository.save(rw1);
        meetingReviewRepository.save(rw2);

        em.flush();
        em.clear();
    }

    // ========== 마이페이지 정보 조회 ==========
    @Test
    @DisplayName("마이페이지에서 내 정보를 확인한다.")
    void getMyPage() {
        // given
        String email = "dsfsdfs@email.com";

        // when
        MyPageResponse response = myPageService.getMyPage(email);

        // then
        System.out.println("response = " + response);
    }

}