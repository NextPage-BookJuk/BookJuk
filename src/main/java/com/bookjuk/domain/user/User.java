package com.bookjuk.domain.user;

import com.bookjuk.domain.meeting.Meeting;
import com.bookjuk.domain.participant.MeetingParticipant;
import com.bookjuk.domain.review.MeetingReview;
import jakarta.persistence.*;
import lombok.*;


import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@ToString
@EqualsAndHashCode
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // DB의 AUTO_INCREMENT를 따릅니다.
    @Column(name = "user_id")
    private Long id;

    @Column(nullable = false, length = 50)
    private String username;

    @Column(nullable = false, length = 50)
    private String password;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    // Meeting 엔티티와 1:N 관계
    @OneToMany(mappedBy = "host", cascade = CascadeType.ALL, orphanRemoval = true)
    List<Meeting> meetings = new ArrayList<>();
//
//    @OneToMany(mappedBy = "participant", cascade = CascadeType.ALL, orphanRemoval = true)
//    List<Meeting> participants = new ArrayList<>();

    // 중간 엔티티 기준 1:N
    @OneToMany(mappedBy = "participant", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MeetingParticipant> meetingParticipants = new ArrayList<>();

    // 중간 엔티티 기준 1:N
    @OneToMany(mappedBy = "reviewer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MeetingReview> meetingReviewers = new ArrayList<>();

    @OneToMany(mappedBy = "reviewee", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MeetingReview> meetingReviewees = new ArrayList<>();

    @Builder
    public User(String username, String password, String email) {
        this.username = username;
        this.password = password;
        this.email = email;
    }
}
