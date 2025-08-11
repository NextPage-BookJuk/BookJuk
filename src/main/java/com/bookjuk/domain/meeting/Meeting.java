package com.bookjuk.domain.meeting;

import com.bookjuk.domain.user.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import lombok.AccessLevel;
import lombok.*;
import org.hibernate.annotations.Comment;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

/**
 * Meeting 클래스는 독서 모임에 대한 정보를 나타내는 엔티티로, 모임의 기본 정보와 관련 데이터들을 포함한다.
 * 이 클래스는 JPA를 사용하여 데이터베이스와 매핑되고, 모임과 관련된 다양한 속성을 제공한다.
 *
 * 주요 속성:
 * - id: 모임의 고유 식별자
 * - user: 모임의 방장(주최자) 정보를 포함하는 User 엔티티와의 연관 관계
 * - title: 모임의 제목
 * - description: 모임의 상세 설명
 * - imageUrl: 대표 이미지 URL
 * - bookTitle: 모임에서 선정한 도서의 제목
 * - bookAuthor: 모임에서 선정한 도서의 저자
 * - genre: 모임 장르(도서 장르 등)
 * - meetingTime: 모임 시간
 * - location: 모임 장소
 * - maxParticipants: 모임 최대 참여 인원
 * - status: 모임 상태 (RECRUITING, COMPLETED, CANCELLED)
 * - createdAt: 모임 생성 시간 (자동 생성)
 * - updatedAt: 모임 정보 수정 시간 (자동 업데이트)
 *
 * 이 클래스는 lombok 라이브러리를 활용하여 getter 메서드, equals, hashCode, toString 메서드를 자동으로 생성한다.
 * 불변성을 유지하기 위해 기본 생성자는 protected로 제한되어 있으며, 빌더 패턴을 지원하도록 설계될 수 있다.
 */

@Entity
@Table(name = "meeting")
@Getter
@ToString(exclude = {"host"})   //  Meeting 엔티티는 User를 참조하고 있으므로, host 필드를 exclude
@EqualsAndHashCode(of = "id")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Meeting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "meeting_id")
    @Comment("모임 고유 식별자")
    private Long id;

    // User 엔티티와 N대1 관계
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "host_id", nullable = false)
    @Comment("방장(주최자)의 user_id")
    private User host; // host_id 컬럼을 User 객체로 매핑합니다.

    @Column(name = "title", nullable = false, length = 255)
    @Comment("모임 제목")
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    @Comment("모임 상세 설명")
    private String description;

    @Column(name = "image_url", length = 255)
    @Comment("모임 대표 이미지 URL")
    private String imageUrl;

    @Column(name = "book_title", nullable = false, length = 255)
    @Comment("선정 도서 제목")
    private String bookTitle;

    @Column(name = "book_author", nullable = false, length = 100)
    @Comment("선정 도서 저자")
    private String bookAuthor;

    @Column(name = "genre", length = 100)
    @Comment("모임 장르")
    private String genre;

    @Column(name = "meeting_time", nullable = false)
    @Comment("모임 시간")
    private LocalDateTime meetingTime;

    // 주소 정규화
    @Column(name = "region", nullable = false, length = 20)
    @Comment("시/도")
    private String region;

    @Column(name = "city", nullable = false, length = 30)
    @Comment("시/구/군")
    private String city;

    @Column(name = "detail_address", length = 255)
    @Comment("상세주소(선택)")
    private String detailAddress;

    @Column(name = "max_participants", nullable = false)
    @Comment("최대 참여 인원")
    @Max(value = 10)
    private Integer maxParticipants;

    @Column(name = "status", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    @Comment("RECRUITING(모집중), COMPLETED(종료), CANCELLED(취소)")
    private MeetingStatus meetingStatus;

    @CreationTimestamp // 엔티티가 생성될 때 현재 시간을 자동으로 저장
    @Column(name = "created_at", nullable = false, updatable = false)
    @Comment("모임 생성 시점")
    private LocalDateTime createdAt;

    @UpdateTimestamp // 엔티티가 업데이트될 때 현재 시간을 자동으로 저장
    @Column(name = "updated_at", nullable = false)
    @Comment("모임 정보 수정 시점")
    private LocalDateTime updatedAt;

    // 빌더 패턴을 사용한 생성자
    @Builder
    public Meeting(User host, String title, String description, String imageUrl, String bookTitle, String bookAuthor, String genre, LocalDateTime meetingTime, String region, String city, String detailAddress, Integer maxParticipants, MeetingStatus status) {
        this.host = host;
        this.title = title;
        this.description = description;
        this.imageUrl = imageUrl;
        this.bookTitle = bookTitle;
        this.bookAuthor = bookAuthor;
        this.genre = genre;
        this.meetingTime = meetingTime;
        this.region = region;
        this.city = city;
        this.detailAddress = detailAddress;
        this.maxParticipants = maxParticipants;
        this.meetingStatus = status;
    }

}