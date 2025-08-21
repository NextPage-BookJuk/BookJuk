package com.bookjuk.repository.participant;

import com.bookjuk.domain.meeting.Meeting;
import com.bookjuk.domain.participant.MeetingParticipant;
import com.bookjuk.domain.participant.ParticipantRole;
import com.bookjuk.domain.participant.ParticipantStatus;
import com.bookjuk.domain.review.MeetingReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
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
    /**
     * 특정 모임의 특정 상태 참가자 수를 카운트합니다.
     *
     * @param meetingId 모임 ID
     * @param status 참가자 상태
     * @return 해당 상태의 참가자 수
     */
    Integer countByMeeting_IdAndStatus(Long meetingId, ParticipantStatus status);

    /**
     * 특정 모임의 특정 상태 참가자 목록을 조회합니다.
     *
     * @param meetingId 모임 ID
     * @param status 참가자 상태
     * @return 참가자 목록
     */
    List<MeetingParticipant> findByMeeting_IdAndStatus(Long meetingId, ParticipantStatus status);

    /**
     * 특정 모임의 여러 상태 참가자 목록을 조회합니다.
     *
     * @param meetingId 모임 ID
     * @param statuses 참가자 상태 목록
     * @return 참가자 목록
     */
    List<MeetingParticipant> findByMeeting_IdAndStatusIn(Long meetingId, List<ParticipantStatus> statuses);

    /**
     * 특정 사용자가 특정 모임에 이미 신청했는지 확인합니다.
     *
     * @param meetingId 모임 ID
     * @param userId 사용자 ID
     * @return 신청 여부
     */
    boolean existsByMeeting_IdAndParticipant_Id(Long meetingId, Long userId);
    /**
     * 특정 모임의 모든 리뷰 조회
     */
    List<MeetingReview> findByMeeting(Meeting meeting);
}

