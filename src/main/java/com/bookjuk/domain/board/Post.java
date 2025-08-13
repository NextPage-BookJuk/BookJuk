package com.bookjuk.domain.board;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.swing.text.html.HTML;
import java.time.LocalDateTime;

/**
 * 모임 게시판의 게시글을 나타내는 엔터티 클래스
 *
 * 특정 모임 게시글 관리
 * FK 제약 조건 대신 ID 값으로 관리
 * 제목 최대 200자 제한
 * 이미지 첨부 가능
 * 작성 시간과 수정시간 자동관리
 * 게시글 수정 시 비즈니스 로직 검증 (작성, 수정, 삭제 등)
 */
@Entity
@Table(name = "post")
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Post {


    // 게시글의 고유 식별자(자동 생성) post_id 컬럼과 1:1매핑
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "post_id")
    private Long postId;

     // 게시글이 속한 모임의 ID (ID 값으로만 관리 FK x), 모임 삭제 시 게시글도 삭제되도록 처리
    @Column(nullable = false)
    private Long meetingId;

    // 게시글 작성자의 사용자 ID (실제 정보는 User 엔터티에서 별도로 조회) 작성자는 username 필드를 통해 표시
    @Column(nullable = false)
    private Long userId;

    //게시글 제목은 최대 200자까지 허용되며 필수 입력해야한다. (공백x, 앞뒤 공백 자동x)
    @Column(nullable = false, length = 200)
    private String title;

    // 게시글 내용 LOB(Large Object) 타입으로 긴 텍스트를 저장하고 (필수 입력, 빈 값x)
    @Lob
    @Column(nullable = false)
    private String content;

    // 게시글에 첨부된 이미지의 URL 선택적 필드 (URL은 유요한 형식이여야 하고 빈 문자열은 null)
    @Column(name = "image_url")
    private String imageUrl;

    // 게시글 작성 시간 (저장될 때 시간 자동)
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // 게시글 최종 수정 시간 (업데이트 때 시간 자동)
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * 게시글 정보를 수정한다
     *
     * 유효성 검증 (null, 빈 문자열, 길이 제한 체크)
     * 게시글 제목, 내용, 이미지URL 업데이트
     * 공백 정리 (trim 처리)
     * @param title 새로운 게시글 제목 (1-200자, null이나 빈 문자열 불가)
     * @param content 새로운 게시글 내용 (null이나 빈 문자열 불가)
     * @param imageUrl 새로운 이미지 URL (null 허용, 빈 문자열은 null로 처리)
     * @throws IllegalArgumentException title이나 content가 null이거나 빈 문자열인 경우
     * @throws IllegalArgumentException title이 200자를 초과하는 경우
     */
    public void edit(String title, String content, String imageUrl) {
        // 제목 유효성 검증
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("게시글 제목은 비어있을 수 없습니다.");
        }
        if (title.trim().length() > 200) {
            throw new IllegalArgumentException("게시글 제목은 200자를 초과할 수 없습니다.");
        }

        // 내용 유효성 검증
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("게시글 내용은 비어있을 수 없습니다.");
        }

        // 필드 업데이트 (공백 정리)
        this.title = title.trim();
        this.content = content.trim();

        // 이미지 URL 처리 (빈 문자열은 null로 변환)
        if (imageUrl != null && imageUrl.trim().isEmpty()) {
            this.imageUrl = null;
        } else {
            this.imageUrl = imageUrl != null ? imageUrl.trim() : null;
        }
    }

    /**
     * 게시글이 특정 사용자에 의해 작성되었는지 확인한다 (수정,삭제 권한 확인 시 사용)
     *
     * @param userId 확인할 사용자 ID
     * @return 해당 사용자가 작성한 게시글이면 true, 아니면 false
     */
    public boolean isWrittenBy(Long userId) {
        return this.userId != null && this.userId.equals(userId);
    }

    /**
     * 게시글이 특정 모임에 속하는지 확인한다 (조회 시 모임 소속 여부 확인)
     *
     * @param meetingId 확인할 모임 ID
     * @return 해당 모임에 속한 게시글이면 true, 아니면 false
     */
    public boolean belongsToMeeting(Long meetingId) {
        return this.meetingId != null && this.meetingId.equals(meetingId);
    }

    /**
     * 게시글에 이미지가 첨부되어 있는지 확인한다. (프론트엔드에서 이미지 표시 여부를 결정할 때 사용가능)
     *
     * @return 이미지가 첨부되어 있으면 true, 아니면 false
     */
    public boolean hasImage() {
        return this.imageUrl != null && !this.imageUrl.trim().isEmpty();
    }
}
