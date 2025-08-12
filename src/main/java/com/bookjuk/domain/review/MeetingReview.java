package com.bookjuk.domain.review;

import com.bookjuk.domain.meeting.Meeting;
import com.bookjuk.domain.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/*
* -- auto-generated definition
create table meeting_review
(
    id          bigint auto_increment comment '후기(좋아요) 고유 식별자'
        primary key,
    meeting_id  bigint                                not null comment '관련 모임의 id (meeting.id 참조)',
    reviewer_id bigint                                not null comment '리뷰(좋아요)를 남긴 사용자의 user_id (user.user_id 참조)',
    reviewee_id bigint                                not null comment '리뷰(좋아요)를 받은 사용자의 user_id (user.user_id 참조)',
    created_at  timestamp default current_timestamp() not null comment '리뷰 작성 시간'
)
    comment '모임 후기 (멤버 간 좋아요 평가)' charset = utf8mb4;
* */
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

}
