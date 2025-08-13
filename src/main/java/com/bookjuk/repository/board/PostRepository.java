package com.bookjuk.repository.board;

import com.bookjuk.domain.board.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;


/**
 * 게시글 엔터티에 대한 데이터 접근을 담당하는 Repository 인터페이스
 *
 * 특정 모임의 게시글 목록 조회(페이징, 정렬)
 * 모임 ID와 게시글 ID로 게시글 상세 조회
 * 게시글 작성자 권한 확인
 * 기본적인 CRUD 작업
 */
@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    /**
     * 특정 모임의 게시글 목록을 작성 시간 역순으로 조회한다.
     * @param meetingId 모임 ID
     * @param pageable 페이징 정보 (페이지 번호, 크기, 정렬)
     * @return 게시글 페이지 객체
     */
    Page<Post> findByMeetingIdOrderByCreatedAtDesc(Long meetingId, Pageable pageable);

    /**
     * 특정 모임의 특정 게시글을 조회한다.
     * 게시글 ID와 모임 ID가 모두 일치하는 게시글만 조회된다.(다른 모임 방지)
     *
     * @param postId 게시글 Id
     * @param meetingId 모임 ID
     * @return 게시글 Optional 객체 (존재하지 않으면 empty)
     */
    Optional<Post> findByPostIdAndMeetingId(Long postId, Long meetingId);

    /**
     * 특정 게시글의 작성자인지 확인한다 (수정,삭제 권한 시)
     *
     * @param postId 게시글 ID
     * @param userId 사용자 ID
     * @return 작성자이면 true 아니면 false
     */
    boolean existsByPostIdAndUserId(Long postId, Long userId);

    /**
     * 특정 모임의 게시글 목록을 조회한다.
     *
     * @param meetingId 모임 ID
     * @return 개시글 개수
     */
    long countByMeetingId(Long meetingId);

    /**
     * 특정 사용자가 작성한 게시글 목록을 조회한다. (역순 정렬)
     *
     * @param userId 사용자 ID
     * @param pageable 페이징 정보
     * @return 게시글 페이지 객체
     */
    Page<Post> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    /**
     * 특정 모임에서 특정 사용자가 작성한 게시글 개수를 조회한다.
     *
     * @param meetingId 모임 ID
     * @param userId 사용자 ID
     * @return 게시글 개수
     */
    long countByMeetingIdAndUserId(Long meetingId, Long userId);

    /**
     * 특정 모임의 게시글 중 제목에 특정 키워드가 포함된 게시글을 검색한다.
     * 대소문자를 구분하지 않고 역순으로 정렬
     *
     * @param meetingId 모임 ID
     * @param keyword 검색 키워드
     * @param pageable 페이징 정보
     * @return 검색된 게시글 페이지 객체
     */
    @Query("SELECT p FROM Post p WHERE p.meetingId = :meetingId AND LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY p.createdAt DESC")
    Page<Post> findByMeetingIdAndTitleContainingIgnoreCase(
            @Param("meetingId") Long meetingId,
            @Param("keyword") String keyword,
            Pageable pageable);

    /**
     * 특정 모임의 게시글 중 제목 또는 내용에 특정 키워드가 포함된 게시글을 검색한다.
     * 대소문자를 구분하지 않고 역순으로 정렬.
     *
     * @param meetingId 모임 ID
     * @param keyword 검색 키워드
     * @param pageable 페이징 정보
     * @return 검색된 게시글 페이지 객체
     */
    @Query("SELECT p FROM Post p WHERE p.meetingId = :meetingId AND " +
            "(LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "ORDER BY p.createdAt DESC")
    Page<Post> findByMeetingIdAndTitleOrContentContainingIgnoreCase(
            @Param("meetingId") Long meetingId,
            @Param("keyword") String keyword,
            Pageable pageable);
}