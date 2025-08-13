package com.bookjuk.domain.board;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;


/**
 * 게시글에 달린 댓글을 나타내는 엔티티 클래스
 *
 * 게시글에는 여러 개의 댓글을 작성할 수 있다.
 * FK 제약 조건 대신 ID 값으로 관리
 * 작성, 수정시간 자동 관리
 * 수정 시 비즈니스 로직 (작성, 수정, 삭제 등)
 */
@Entity
@Table(name = "comment")
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Comment {

    // 댓글의 고유 식별자 (자동생성, DDL의 id 컬럼과 1:1 매핑)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 댓글이 속한 게시글의 ID (ID 값으로만 관리 FK X) 게시글이 삭제될 때 관련 댓글도 함께 삭제되도록 처리
    @Column(nullable = false)
    private Long postId;

    // 댓글 작성자의 사용자 ID (실제 사용자 정보는 엔터티에서 별도로 조회) 작성자 정보는 username 필드를 통해 표시
    @Column(nullable = false)
    private Long userId;

     // 댓글 내용 LOB(Large Object) 타입으로 긴 텍스트를 저장하고 (필수 입력, 빈 값x)
    @Lob
    @Column(nullable = false)
    private String content;

    // 댓글 작성 시간 (저장될 때 시간 자동)
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // 댓글 수정 시간 (업데이트 때 시간 자동)
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * 댓글 내용을 수정한다.
     *
     * 입력값 유효성 검증(null, 빈 문자열 체크)
     * 댓글 내용 업데이트
     *
     * @param content 새로운 댓글 내용 (null이나 빈 문자열 불가)
     * @throws IllegalArgumentException content가 null이거나 빈 문자열인 경우
     */
    public void edit(String content) {
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("댓글 내용은 비어있을 수 없습니다.");
        }
        this.content = content.trim();
    }

    /**
     * 댓글이 특정 사용자에 의해 작성되었는지 확인한다. (댓글 수정,삭제 권한 확인 시)
     *
     * @param userId 확인할 사용자 ID
     * @return 해당 사용자가 작성한 댓글이면 true, 아니면 false
     */
    public boolean isWrittenBy(Long userId) {
        return this.userId != null && this.userId.equals(userId);
    }

    /**
     * 댓글이 특정 게시글에 속하는지 확인한다.
     *
     * <p>댓글 조회 시 게시글 소속 여부를 확인하기 위해 사용됩니다.
     *
     * @param postId 확인할 게시글 ID
     * @return 해당 게시글에 속한 댓글이면 true, 아니면 false
     */
    public boolean belongsToPost(Long postId) {
        return this.postId != null && this.postId.equals(postId);
    }
}
