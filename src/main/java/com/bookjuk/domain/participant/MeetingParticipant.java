package com.bookjuk.domain.participant;

import com.bookjuk.domain.meeting.Meeting;
import com.bookjuk.domain.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Comment;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * MeetingParticipant 클래스는 모임에 참여하는 사용자 정보를 나타내는 엔티티이다.
 *
 * 이 클래스는 다음과 같은 주요 정보를 포함한다:
 *
 * - 고유 식별자 (id): 각 참여 정보를 구별하는 식별자
 * - 모임 (meeting): 사용자가 참여하는 모임 정보
 * - 사용자 (participant): 참여하는 사용자 정보
 * - 역할 (role): 사용자의 모임 내 역할 (예: HOST, PARTICIPANT)
 * - 상태 (status): 사용자 참여 상태 (예: PENDING, APPROVED, REJECTED 등)
 * - 생성 시간 (createdAt): 참여 정보 생성 시점
 * - 수정 시간 (updatedAt): 참여 상태가 변경된 시점
 *
 * 이 클래스는 lombok 라이브러리를 활용하여 getter 메서드, equals, hashCode, toString 메서드를 자동으로 생성한다.
 * 불변성을 유지하기 위해 기본 생성자는 protected로 제한되어 있으며, 빌더 패턴을 지원하도록 설계될 수 있다.
 */
@Entity
@Table(name = "meeting_participant")
@Getter
// MeetingParticipant 엔티티는 Meeting, User를 참조하고 있으므로,
// meeting과 participant 필드를 exclude
@ToString(exclude = {"meeting", "participant"})
@EqualsAndHashCode(of = "id")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MeetingParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    @Comment("참여 고유 식별자")
    private Long id;

    // Meeting 엔티티와 N대1 관계
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id", nullable = false)
    @Comment("참여 모임의 id (meeting.meeting_id 참조)")
    private Meeting meeting;

    // User 엔티티와 N대1 관계
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @Comment("참여 사용자의 user_id (user.user_id 참조)")
    private User participant;

    @Column(name = "role", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    @Comment("HOST(주최자), PARTICIPANT(참여자)")
    private ParticipantRole role;

    @Column(name = "status", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    @Comment("PENDING(신청), APPROVED(승인), REJECTED(거절), BANNED(차단), ATTENDED(출석), ABSENT(불참)")
    private ParticipantStatus status;

    @CreationTimestamp // 엔티티가 생성될 때 현재 시간을 자동으로 저장
    @Column(name = "created_at", nullable = false, updatable = false)
    @Comment("신청 시점")
    private LocalDateTime createdAt;

    @UpdateTimestamp // 엔티티가 업데이트될 때 현재 시간을 자동으로 저장
    @Column(name = "updated_at", nullable = false)
    @Comment("상태 변경 시점")
    private LocalDateTime updatedAt;

    // 빌더 패턴을 사용한 생성자
    @Builder
    public MeetingParticipant(Meeting meeting, User participant, ParticipantRole role, ParticipantStatus status) {
        this.meeting = meeting;
        this.participant = participant;
        this.role = role;
        this.status = status;
    }

    /**
     * 사용자의 모임 내 역할을 변경한다.
     * @param role 변경할 역할 (ParticipantRole 열거형으로, 예: HOST, PARTICIPANT)
     */
    public void changeRole(ParticipantRole role) {
        this.role = role;
    }
}
