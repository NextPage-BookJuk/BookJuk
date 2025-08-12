package com.bookjuk.domain.review;

import com.bookjuk.domain.meeting.Meeting;
import com.bookjuk.domain.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * MeetingReview 클래스는 모임 종료후 참여자들 간의 리뷰(좋아요) 정보를 나타내는 엔티티이다.
 *
 * 이 클래스는 다음과 같은 주요 정보를 포함한다:
 *
 * - 고유 식별자 (id): 각 리뷰 정보를 구별하는 식별자
 * - 모임 (meeting): 사용자가 참여하는 모임 정보
 * - 사용자 (reviewer): 리뷰를 남기는 사용자 정보
 * - 사용자 (reviewee): 리뷰를 받는 사용자 정보
 * - 생성 시간 (createdAt): 참여 정보 생성 시점
 *
 * 이 클래스는 lombok 라이브러리를 활용하여 getter 메서드, equals, hashCode, toString 메서드를 자동으로 생성한다.
 * 불변성을 유지하기 위해 기본 생성자는 protected로 제한되어 있으며, 빌더 패턴을 지원하도록 설계될 수 있다.
 */
@Entity
@Table(name = "meeting_review")

@Getter @ToString(exclude = {"meeting", "reviewer", "reviewee"})
@EqualsAndHashCode(of = "id")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MeetingReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id")
    private Meeting meeting;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id")
    private User reviewer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewee_id")
    private User reviewee;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public MeetingReview(Meeting meeting, User reviewer, User reviewee) {
        this.meeting = meeting;
        this.reviewer = reviewer;
        this.reviewee = reviewee;
    }
}
