package com.bookjuk.domain.meeting;


import com.bookjuk.domain.participant.MeetingParticipant;
import com.bookjuk.domain.user.User;
import com.bookjuk.dto.meeting.MeetingUpdateRequest;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import lombok.AccessLevel;
import lombok.*;
import org.hibernate.annotations.Comment;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Meeting 클래스는 사용자가 생성한 독서 모임 정보를 관리하는 엔티티입니다.
 * 모임의 제목, 설명, 선정 도서 정보, 장소, 모임 시간, 최대 참여 인원, 현재 상태 등을 포함합니다.
 * 또한 주최자 정보와 연관된 참가자 리스트를 포함하며, 데이터베이스의 "meeting" 테이블과 매핑됩니다.
 * 불변성을 유지하기 위해 기본 생성자는 protected로 제한되어 있습니다.
 *
 * 주요 기능:
 * - 모임 생성 시 필요한 데이터를 설정할 수 있습니다.
 * - 모임 정보 변경을 위한 도메인 메서드 및 업데이트 메서드를 제공합니다.
 *
 * 제약 사항:
 * - 모임의 최대 참여 인원(maxParticipants)은 10명을 초과할 수 없습니다.
 * - 모임의 상태는 모집 중(RECRUITING), 종료(COMPLETED), 취소됨(CANCELLED) 중 하나여야 합니다.
 *
 * 연관 관계:
 * - 다대일 관계로 주최자(User)와 연관됩니다.
 * - 일대다 관계로 참가자 리스트(MeetingParticipant)와 연관됩니다.
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

    // 중간 엔티티 기준 1:N
    @OneToMany(mappedBy = "meeting", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MeetingParticipant> meetingParticipants = new ArrayList<>();


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

    @Column(name = "genre", nullable = false, length = 100)
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
    @Comment("시/군")
    private String city;

    @Column(name = "district", nullable = false, length = 30)
    @Comment("구/군")
    private String district;

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
    public Meeting(User host,
                   String title,
                   String description,
                   String imageUrl,
                   String bookTitle,
                   String bookAuthor,
                   String genre,
                   LocalDateTime meetingTime,
                   String region,
                   String city,
                   String district,
                   String detailAddress,
                   Integer maxParticipants,
                   MeetingStatus meetingStatus) {
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
        this.district = district;
        this.detailAddress = detailAddress;
        this.maxParticipants = maxParticipants;
        this.meetingStatus = meetingStatus;
    }

    /**
     * 모임 정보 수정 메서드
     * DTO로부터 받은 데이터로 엔티티의 상태를 변경합니다.
     * 이미지 URL은 별도로 받아와서 업데이트합니다.
     *
     * @param request 수정할 정보가 담긴 DTO
     * @param imageUrl 새로 업로드된 이미지의 URL (변경이 없으면 null 또는 기존 URL)
     */
    public void update(MeetingUpdateRequest request, String imageUrl) {
        this.title = request.getTitle();
        this.description = request.getDescription();
        this.bookTitle = request.getBookTitle();
        this.bookAuthor = request.getBookAuthor();
        this.genre = request.getGenre();
        this.meetingTime = request.getMeetingTime();
        this.region = request.getRegion();
        this.city = request.getCity();
        this.district = request.getDistrict();
        this.detailAddress = request.getDetailAddress();
        this.maxParticipants = request.getMaxParticipants();

        // 이미지 URL이 null이 아닌 경우에만 업데이트
        if (imageUrl != null) {
            this.imageUrl = imageUrl;
        }
    }

    // 제목 변경  테스트
    public void changeTitle(String newTitle) {
        if (newTitle == null) return;
        String t = newTitle.trim();
        if (t.isEmpty()) return;
        if (!t.equals(this.title)) {
            this.title = t;
        }
    }

}

