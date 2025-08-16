package com.bookjuk.repository.meeting;

import com.bookjuk.domain.meeting.Meeting;
import com.bookjuk.domain.meeting.MeetingStatus;
import com.bookjuk.domain.participant.MeetingParticipant;
import com.bookjuk.domain.participant.ParticipantRole;
import com.bookjuk.domain.participant.ParticipantStatus;
import com.bookjuk.domain.review.MeetingReview;
import com.bookjuk.domain.user.User;
import com.bookjuk.repository.meeting.custom.MeetingRepositoryCustom;
import com.bookjuk.repository.participant.MeetingParticipantRepository;
import com.bookjuk.repository.review.MeetingReviewRepository;
import com.bookjuk.repository.user.UserRepository;
import com.bookjuk.service.ReviewService;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
@Transactional
@Rollback(value = false)
public class MeetingListTest {

    @Autowired
    MeetingRepository meetingRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    MeetingParticipantRepository meetingParticipantRepository;

    @Autowired
    MeetingReviewRepository meetingReviewRepository;

    @Autowired
    ReviewService reviewService;

    @Autowired
    EntityManager em;

    private User u1, u2, u3, u4;
    private Meeting m1, m2, m3, m4;
    private MeetingParticipant mp1, mp2, mp3, mp4, mp5, mp6, mp7;

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
                .meetingStatus(MeetingStatus.RECRUITING)
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
                .district("주먹구구")
                .maxParticipants(8)
                .meetingStatus(MeetingStatus.COMPLETED)
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
                .district("구구")
                .maxParticipants(4)
                .meetingStatus(MeetingStatus.RECRUITING)
                .build();
        m4 = Meeting.builder()
                .host(u3)
                .title("뽀롱롱")
                .description("언제나 즐거운 친구들")
                .imageUrl("https://example.com/image4.jpg")
                .bookTitle("뽀로로")
                .bookAuthor("무적친구뽀로로")
                .genre("동화")
                .meetingTime(LocalDateTime.of(2025, 8, 19, 19, 0))
                .meetingStatus(MeetingStatus.RECRUITING)
                .region("서울특별시")
                .city("중랑구")
                .district("abc")
                .maxParticipants(8)
                .build();

        List<Meeting> meetings = meetingRepository.saveAllAndFlush(
                List.of(m1, m2, m3, m4)
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
        mp7 = MeetingParticipant.builder()
                .participant(u2)
                .meeting(m4)
                .role(ParticipantRole.HOST)
                .status(ParticipantStatus.APPROVED)
                .build();


        meetingParticipants = meetingParticipantRepository.saveAllAndFlush(
                List.of(mp1, mp2, mp3, mp4, mp5, mp6, mp7)
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

        MeetingReview rw3 = MeetingReview.builder()
                .meeting(m2)
                .reviewer(u1)
                .reviewee(u2)
                .build();

        meetingReviewRepository.save(rw1);
        meetingReviewRepository.save(rw2);
        meetingReviewRepository.save(rw3);

        em.flush();
        em.clear();
    }


    // ========== MeetingRepositoryImpl: getTripList ==========
    // =========================
    // 1) 지역/장르/상태 필터링
    // =========================
    @Test
    @DisplayName("지역/장르/상태로 필터링하면 조건에 맞는 미팅만 반환된다")
    void getTripListByRegionGenreStatus() {
        // given
        // 페이지 정보 생성
        // 페이지 번호는 0출발
        Pageable pageable = PageRequest.of(0, 2);

        // 검색 조건
        MeetingRepositoryCustom.MeetingSearchCondition condition
                = MeetingRepositoryCustom.MeetingSearchCondition.builder()
                .region("경기도")
                .genre("동화")
                .status(MeetingStatus.COMPLETED)
                .build();

        // when
        Page<Meeting> meetingPage = meetingRepository.getMeetingList(condition, pageable);
        // 실제 데이터 꺼냄
        List<Meeting> meetingList = meetingPage.getContent();
        // then
        meetingList.forEach(System.out::println);

//        assertEquals(1, meetingPage.getTotalElements());
//        assertEquals("가나디친구들", meetingPage.getContent().get(0).getTitle());
    }

    // =========================
    // 2) 정렬: popular (방장 리뷰 수 desc)
    // =========================
    @Test
    @DisplayName("정렬 popular: 방장이 받은 리뷰 수 내림차순으로 반환된다")
    void getTripListSortPopular() {
        // given
        // 페이지 정보 생성
        // 페이지 번호는 0출발
        Pageable pageable = PageRequest.of(0, 2);

        // 검색 조건
        MeetingRepositoryCustom.MeetingSearchCondition condition
                = MeetingRepositoryCustom.MeetingSearchCondition.builder()
                .sortBy("popular")
                .build();

        // when
        Page<Meeting> meetingPage = meetingRepository.getMeetingList(condition, pageable);
        // 실제 데이터 꺼냄
        List<Meeting> meetingList = meetingPage.getContent();
        // then
        for (Meeting m : meetingList) {
            System.out.println("\n\n\n\n" + m);
        }

        assertEquals(2, meetingPage.getTotalElements());
        assertEquals("먼작귀친구들", meetingPage.getContent().get(1).getTitle());
    }

}
