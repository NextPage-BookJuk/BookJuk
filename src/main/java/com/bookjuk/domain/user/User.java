package com.bookjuk.domain.user;

import com.bookjuk.domain.meeting.Meeting;
import com.bookjuk.domain.participant.MeetingParticipant;
import com.bookjuk.domain.review.MeetingReview;
import com.bookjuk.dto.mypage.request.UpdateProfileRequest;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;


import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@ToString(exclude = {"meetings", "meetingParticipants"})
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @Column(nullable = false, length = 50)
    private String username;


    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(name = "preferred_genre", length = 100)
    private String preferredGenre;

    @Column(name = "profile_image", length = 255)
    private String profileImage;

    @Column(columnDefinition = "TEXT")
    private String introduction;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Meeting 엔티티와 1:N 관계
    @OneToMany(mappedBy = "host", cascade = CascadeType.ALL, orphanRemoval = true)
    List<Meeting> meetings = new ArrayList<>();
//
//    @OneToMany(mappedBy = "participant", cascade = CascadeType.ALL, orphanRemoval = true)
//    List<Meeting> participants = new ArrayList<>();

    // 중간 엔티티 기준 1:N
    @OneToMany(mappedBy = "participant", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MeetingParticipant> meetingParticipants = new ArrayList<>();


    @Builder
    public User(Long id, String username, String email, List<Meeting> meetings, List<MeetingParticipant> meetingParticipants,
                String password, String preferredGenre, String profileImage, String introduction,
                LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.meetings = meetings != null ? meetings : new ArrayList<>();
        this.meetingParticipants = meetingParticipants != null ? meetingParticipants : new ArrayList<>();
        this.password = password;
        this.preferredGenre = preferredGenre;
        // 프로필 이미지가 없으면 기본값 설정
        this.profileImage = (profileImage == null || profileImage.trim().isEmpty()) ? "/images/defaultProfile.png" : profileImage;
        this.introduction = introduction;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // 프로필 수정 편의 메소드
    public void updateProfile(UpdateProfileRequest request, String profileImage) {
        this.username = request.getUsername();
        this.introduction = request.getIntroduction();
        this.preferredGenre = request.getPreferredGenre();

        // 이미지 URL 이 null 이 아닌 경우에만 업데이트
        if (profileImage != null) {
            this.profileImage = profileImage;
        }
    }
}
