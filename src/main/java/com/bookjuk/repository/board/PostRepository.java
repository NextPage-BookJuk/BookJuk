package com.bookjuk.repository.board;

import com.bookjuk.domain.board.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PostRepository extends JpaRepository<Post, Long> {
    Page<Post> findByMeetingIdOrderByCreatedAtDesc(Long meetingId, Pageable pageable);
    Optional<Post> findByPostIdAndMeetingId(Long postId, Long meetingId);
    boolean existsByPostIdAndUserId(Long postId, Long userId);
}