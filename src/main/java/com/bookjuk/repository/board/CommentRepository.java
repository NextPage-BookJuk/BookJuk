package com.bookjuk.repository.board;

import com.bookjuk.domain.board.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    Page<Comment> findByPostIdOrderByCreatedAtAsc(Long postId, Pageable pageable);
    boolean existsByIdAndUserId(Long id, Long userId);
}
