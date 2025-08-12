package com.bookjuk.repository.participant;

import com.bookjuk.domain.participant.ParticipantRole;
import com.bookjuk.domain.participant.ParticipantStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MeetingParticipantRepository extends JpaRepository<com.bookjuk.domain.participant.MeetingParticipant, Long>, MeetingParticipantCustom {

    // 파생 쿼리: 연관관계 경로를 정확히 기술 (Meeting.id / User.id)
    boolean existsByMeeting_IdAndParticipant_IdAndStatus(
            Long meetingId, Long userId, ParticipantStatus status);

    Optional<MeetingParticipantRepository> findByMeeting_IdAndParticipant_Id(
            Long meetingId, Long userId);

    boolean existsByMeeting_IdAndParticipant_IdAndRole(
            Long meetingId, Long userId, ParticipantRole role);

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

}
