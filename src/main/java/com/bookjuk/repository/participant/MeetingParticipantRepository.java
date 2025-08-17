package com.bookjuk.repository.participant;

import com.bookjuk.domain.meeting.Meeting;
import com.bookjuk.domain.participant.MeetingParticipant;
import com.bookjuk.domain.participant.ParticipantRole;
import com.bookjuk.domain.participant.ParticipantStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MeetingParticipantRepository extends JpaRepository<MeetingParticipant, Long>, MeetingParticipantCustom {

    // 파생 쿼리: 연관관계 경로를 정확히 기술 (Meeting.id / User.id)
    boolean existsByMeeting_IdAndParticipant_IdAndStatus(
            Long meetingId, Long userId, ParticipantStatus status);

    Optional<MeetingParticipant> findByMeeting_IdAndParticipant_Id(
            Long meetingId, Long userId);

    boolean existsByMeeting_IdAndParticipant_IdAndRole(
            Long meetingId, Long userId, ParticipantRole role);

    /**
     * 특정 모임의 특정 상태 참여자 수를 카운트합니다.
     * @param meeting 모임 엔티티
     * @param status 참여자 상태
     * @return 해당 상태의 참여자 수
     */
    int countByMeetingAndStatus(Meeting meeting, ParticipantStatus status);

    // 게시판 접근 권한: HOST 이거나 APPROVED ?
    @Query("""
        select (count(mp) > 0) from MeetingParticipant mp
        where mp.meeting.id = :meetingId
          and mp.participant.id = :userId
          and (mp.role = com.bookjuk.domain.participant.ParticipantRole.HOST
               or mp.status = com.bookjuk.domain.participant.ParticipantStatus.APPROVED)
    """)
    boolean existsMemberWithAccess(@Param("meetingId") Long meetingId,
                                   @Param("userId") Long userId);

    /**
     * 주어진 모임 ID를 기반으로 해당 모임에 참여 중인 사용자 수를 반환한다.
     *
     * @param meetingId 참여 중인 사용자를 확인할 모임의 ID
     * @return 해당 모임에 참여 중인 사용자 수
     */
    int countByMeetingId(Long meetingId);
}

