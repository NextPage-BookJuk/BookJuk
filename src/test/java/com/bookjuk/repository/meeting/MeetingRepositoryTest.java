package com.bookjuk.repository.meeting;

import com.bookjuk.domain.meeting.Meeting;
import com.bookjuk.domain.meeting.MeetingStatus;
import com.bookjuk.domain.participant.MeetingParticipant;
import com.bookjuk.domain.participant.ParticipantRole;
import com.bookjuk.domain.participant.ParticipantStatus;
import com.bookjuk.domain.user.User;
import com.bookjuk.repository.participant.MeetingParticipantRepository;
import com.bookjuk.repository.user.UserRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional  // 연관관계 사용시 필수
class MeetingRepositoryTest {

    @Autowired
    MeetingRepository meetingRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    MeetingParticipantRepository meetingParticipantRepository;

    @Autowired
    EntityManager em;

    @BeforeEach
    void insertBulk() {
        meetingParticipantRepository.deleteAll();
        meetingRepository.deleteAll();
        userRepository.deleteAll();
        // 유저정보 만들기 (임시 테스트용)
        User u1 = User.builder()
                .nickname("치이카와")
                .email("abc123@naver.com")
                .build();
        User u2 = User.builder()
                .nickname("하치와레")
                .email("abc123@google.com")
                .build();
        User u3 = User.builder()
                .nickname("우사기")
                .email("abc123@daum.net")
                .build();

        List<User> users = userRepository.saveAllAndFlush(
                List.of(u1, u2, u3)
        );

        // 모임정보 만들기
        Meeting m1 = Meeting.builder()
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
                .maxParticipants(6)
                .meetingStatus(MeetingStatus.RECRUITING)
                .build();
        Meeting m2 = Meeting.builder()
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
                .maxParticipants(8)
                .meetingStatus(MeetingStatus.RECRUITING)
                .build();
        Meeting m3 = Meeting.builder()
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
                .maxParticipants(4)
                .meetingStatus(MeetingStatus.RECRUITING)
                .build();

        List<Meeting> meetings = meetingRepository.saveAllAndFlush(
                List.of(m1, m2, m3)
        );
        
        // 참가자 정보 만들기
        MeetingParticipant mp1 = MeetingParticipant.builder()
                .participant(u1)
                .meeting(m1)
                .role(ParticipantRole.HOST)
                .status(ParticipantStatus.APPROVED)
                .build();
        MeetingParticipant mp2 = MeetingParticipant.builder()
                .participant(u2)
                .meeting(m1)
                .role(ParticipantRole.PARTICIPANT)
                .status(ParticipantStatus.APPROVED)
                .build();
        MeetingParticipant mp3 = MeetingParticipant.builder()
                .participant(u3)
                .meeting(m1)
                .role(ParticipantRole.PARTICIPANT)
                .status(ParticipantStatus.PENDING)
                .build();
        MeetingParticipant mp4 = MeetingParticipant.builder()
                .participant(u1)
                .meeting(m2)
                .role(ParticipantRole.PARTICIPANT)
                .status(ParticipantStatus.PENDING)
                .build();
        MeetingParticipant mp5 = MeetingParticipant.builder()
                .participant(u2)
                .meeting(m2)
                .role(ParticipantRole.HOST)
                .status(ParticipantStatus.APPROVED)
                .build();
        MeetingParticipant mp6 = MeetingParticipant.builder()
                .participant(u2)
                .meeting(m3)
                .role(ParticipantRole.HOST)
                .status(ParticipantStatus.APPROVED)
                .build();


        List<MeetingParticipant> meetingParticipants = meetingParticipantRepository.saveAllAndFlush(
                List.of(mp1, mp2, mp3, mp4, mp5, mp6)
        );

        em.flush();
        em.clear();
    }


    // ========== MeetingRepository: CREATE + READ ==========
    @Test
    @DisplayName("미팅 엔티티를 저장하면 ID가 생성되고 조회가 된다.")
    void meeting_create_and_read() {
        // given
        User u = User.builder()
                .nickname("루피")
                .email("lulu123@naver.com")
                .build();
        userRepository.save(u);


        Meeting newMeeting = Meeting.builder()
                .host(u)
                .title("가을 낭독회")
                .description("낭독하며 토론해요")
                .imageUrl("https://example.com/image5.jpg")
                .bookTitle("가을의 시")
                .bookAuthor("이시인")
                .genre("시")
                .meetingTime(LocalDateTime.of(2025, 8, 27, 19, 0))
                .region("서울광역시")
                .city("강남구")
                .maxParticipants(7)
                .meetingStatus(MeetingStatus.RECRUITING)
                .build();

        // when
        Meeting saved = meetingRepository.save(newMeeting);

        em.flush();
        em.clear();

        // then
        assertNotNull(saved.getId());
        Meeting found = meetingRepository.findById(saved.getId()).orElse(null);
        assertNotNull(found);
        assertEquals(newMeeting.getTitle(), found.getTitle());
        assertEquals(u.getId(), found.getHost().getId());
    }

    // ========== MeetingRepository: UPDATE ==========
    @Test
    @DisplayName("기존 미팅이 주어졌을때 제목을 수정 후 저장하면 수정 내용이 반영된다.")
    void meeting_update_title() {
        // given
        String title = "먼작귀친구들";
        List<Meeting> meetings = meetingRepository.findByTitle(title);

        // when (더티 체킹)
        String updatedTitle = meetings.get(0).getTitle() + "-수정";
        meetings.get(0).changeTitle(updatedTitle);
        em.flush();
        em.clear();

        // then
        List<Meeting> changedMeeting = meetingRepository.findByTitle(updatedTitle);
        assertEquals(updatedTitle, changedMeeting.get(0).getTitle());
    }

    // ========== MeetingRepository: DELETE ==========
    @Test
    @DisplayName("기존 미팅이 주어졌을때 삭제하면 더 이상 조회되지 않는다.")
    void meetingDelete() {
        // given
        String title = "먼작귀친구들";
        List<Meeting> meetings = meetingRepository.findByTitle(title);
        Long givenId = meetings.get(0).getId();

        // when
        meetingRepository.deleteById(givenId);
        em.flush();
        em.clear();

        // then
        assertTrue(meetingRepository.findById(givenId).isEmpty());
    }





}