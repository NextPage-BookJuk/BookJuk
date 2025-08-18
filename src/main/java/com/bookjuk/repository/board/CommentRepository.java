package com.bookjuk.repository.board;

import com.bookjuk.domain.board.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


/**
 * 댓글 엔터티에 대한 데이터 접근을 담당하는 Repository 인터페이스
 *
 * 특정 게시글의 댓글 목록 조회(페이징, 정렬)
 * 댓글 작성자 권한 확인
 * 게시글별 댓글 개수 조회
 * 댓글 일괄 삭제 (게시글 삭제 시)
 * 기본적인 CRUD
 */
@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {


    /**
     * 특정 게시글의 댓글 목록을 작성 시간 순으로 조회한다. (페이징 처리 오래된 댓글우선)
     * 게시글 상세 조회 시 댓글 목록을 표시하기 위해 사용된다
     *
     * @param postId 게시글 ID
     * @param pageable 페이징 정보 (페이지 번호, 크기, 정렬)
     * @return 댓글 페이지 객체
     */
    Page<Comment> findByPostIdOrderByCreatedAtAsc(Long postId, Pageable pageable);

    /**
     * 특정 댓글의 작성자인지 확인한다. (수정,삭제 권한 확인 시)
     *
     * @param id 댓글 ID
     * @param userId 사용자 ID
     * @return 작성자이면 true, 아니면 false
     */
    boolean existsByIdAndUserId(Long id, Long userId);

    /**
     * 특정 게시글의 댓글 개수를 조회한다.
     *
     * @param postId 게시글 ID
     * @return 댓글 개수
     */
    long countByPostId(Long postId);

    /**
     * 특정 사용자가 작성한 댓글 목록을 조회합니다. (역순 정렬)
     *
     * @param userId 사용자 ID
     * @param pageable 페이징 정보
     * @return 댓글 페이지 객체
     */
    Page<Comment> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    /**
     * 특정 게시글의 댓글을 모두 삭제한다. (게시글 삭제 시 모든 댓글 삭제)
     * FK 제약이 없으므로 수동으로 처리
     *
     * @param postId 게시글 ID
     * @return 삭제된 댓글 개수
     */
    @Modifying
    @Query("DELETE FROM Comment c WHERE c.postId = :postId")
    int deleteByPostId(@Param("postId") Long postId);

    /**
     * 특정 게시글의 댓글 목록을 List로 조회한다.(페이징 없이)
     * 작성 시간 순으로 정렬된다.
     *
     * @param postId 게시글 ID
     * @return 댓글 리스트
     */
    List<Comment> findByPostIdOrderByCreatedAtAsc(Long postId);

    /**
     * 특정 게시글의 최신 댓글을 조회한다. (최신 댓글 미리보기)
     *
     * @param postId 게시글 ID
     * @return 최신 댓글 Optional 객체 (존재하지 않으면 empty)
     */
    @Query("SELECT c FROM Comment c WHERE c.postId = :postId ORDER BY c.createdAt DESC LIMIT 1")
    Optional<Comment> findTopByPostIdOrderByCreatedAtDesc(@Param("postId") Long postId);

    /**
     * 특정 게시글의 첫 번째 댓글을 조회합니다. (첫 댓글 표시)
     *
     * @param postId 게시글 ID
     * @return 첫 번째 댓글 Optional 객체 (존재하지 않으면 empty)
     */
    @Query("SELECT c FROM Comment c WHERE c.postId = :postId ORDER BY c.createdAt ASC LIMIT 1")
    Optional<Comment> findTopByPostIdOrderByCreatedAtAsc(@Param("postId") Long postId);

    /**
     * 여러 게시글의 댓글 개수를 한 번에 조회. (효율 up)
     * N+1 문제를 방지
     *
     * @param postIds 게시글 ID 목록
     * @return 게시글 ID를 키로 하고 댓글 개수를 값으로 하는 결과 리스트
     */
    @Query("SELECT c.postId, COUNT(c) FROM Comment c WHERE c.postId IN :postIds GROUP BY c.postId")
    List<Object> countByPostIdIn(@Param("postIds") List<Long> postIds);

    /**
     * 특정 사용자가 특정 게시글에 작성한 댓글 개수를 조회한다.
     * 중복 댓글 방지나 사용자별 활동 제한 시 사용
     *
     * @param postId 게시글 ID
     * @param userId 사용자 ID
     * @return 댓글 개수
     */
    long countByPostIdAndUserId(Long postId, Long userId);

    /**
     * 특정 모임의 모든 게시글에서 특정 사용자가 작성한 댓글을 조회한다.
     *
     * @param meetingId 모임 ID
     * @param userId 사용자 ID
     * @param pageable 페이징 정보
     * @return 댓글 페이지 객체
     */
    @Query("SELECT c FROM Comment c JOIN Post p ON c.postId = p.postId " +
            "WHERE p.meetingId = :meetingId AND c.userId = :userId " +
            "ORDER BY c.createdAt DESC")
    Page<Comment> findByMeetingIdAndUserIdOrderByCreatedAtDesc(
            @Param("meetingId") Long meetingId,
            @Param("userId") Long userId,
            Pageable pageable);

}
