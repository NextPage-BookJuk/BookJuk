package com.bookjuk.repository.board;

import com.bookjuk.domain.board.Post;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
@Rollback(false)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class PostRepositoryTest {

    @Autowired PostRepository postRepository;
    @Autowired JdbcTemplate jdbc;

    final Long meetingId = 100L;
    final Long user1 = 1000L;
    final Long user2 = 1001L;

    @BeforeEach
    void setUp() {
        jdbc.execute("SET FOREIGN_KEY_CHECKS=0");
        jdbc.execute("TRUNCATE TABLE post");
        jdbc.execute("TRUNCATE TABLE meeting");
        jdbc.execute("TRUNCATE TABLE user");
        jdbc.execute("SET FOREIGN_KEY_CHECKS=1");

        jdbc.update("INSERT INTO user (user_id, username, email, password, created_at, updated_at) VALUES (?,?,?,?,NOW(),NOW())",
                user1, "alice", "alice@test.com", "{noop}pw");
        jdbc.update("INSERT INTO user (user_id, username, email, password, created_at, updated_at) VALUES (?,?,?,?,NOW(),NOW())",
                user2, "bob",   "bob@test.com",   "{noop}pw");

        jdbc.update("""
                INSERT INTO meeting (
                  meeting_id, host_id, meeting_time, status, title, region, city, district,
                  book_title, book_author, genre, max_participants, description, detail_address, image_url,
                  created_at, updated_at
                ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NOW())
                """,
                meetingId, user1, Timestamp.valueOf(LocalDateTime.now().plusDays(1)),
                "RECRUITING", "테스트 모임", "서울","강남","삼성",
                "데이터 JPA", "김영한", "스터디", 10,
                "설명", "상세", null
        );

        // 게시글 4개: 제목 2개 '공지' 포함, 내용 1개 '공지' 포함
        jdbc.update("INSERT INTO post (post_id, meeting_id, user_id, title, content, image_url, created_at, updated_at) VALUES (?,?,?,?,?,?,NOW(),NOW())",
                1L, meetingId, user1, "첫 공지", "본문1", null);
        jdbc.update("INSERT INTO post (post_id, meeting_id, user_id, title, content, image_url, created_at, updated_at) VALUES (?,?,?,?,?,?,NOW(),NOW())",
                2L, meetingId, user1, "두번째 공지", "본문2", null);
        jdbc.update("INSERT INTO post (post_id, meeting_id, user_id, title, content, image_url, created_at, updated_at) VALUES (?,?,?,?,?,?,NOW(),NOW())",
                3L, meetingId, user2, "잡담", "공지 포함한 내용", null);
        jdbc.update("INSERT INTO post (post_id, meeting_id, user_id, title, content, image_url, created_at, updated_at) VALUES (?,?,?,?,?,?,NOW(),NOW())",
                4L, meetingId, user2, "random", "NO KEYWORD", null);
    }

    @Test
    @DisplayName("검색: 제목에 키워드(대소문자 무시)")
    void search_title_only_ignorecase() {
        Page<Post> page = postRepository.findByMeetingIdAndTitleContainingIgnoreCase(
                meetingId, "공지", PageRequest.of(0, 10));

        assertThat(page.getContent()).hasSize(2);

        assertThat(page.getContent())
                .extracting(Post::getTitle)
                .allSatisfy(t -> assertThat(t).contains("공지"));
        // 또는:
        // .contains("첫 공지", "두번째 공지");
    }

    @Test
    @DisplayName("검색: 제목 또는 내용에 키워드(대소문자 무시)")
    void search_title_or_content_ignorecase() {
        Page<Post> page = postRepository.findByMeetingIdAndTitleOrContentContainingIgnoreCase(
                meetingId, "공지", PageRequest.of(0, 10));

        assertThat(page.getContent()).hasSize(3);

        assertThat(page.getContent())
                .extracting(Post::getTitle)
                .contains("첫 공지", "두번째 공지");

        // 내용에도 '공지'가 들어간 게시글이 하나 이상 있어야 함
        assertThat(page.getContent().stream().anyMatch(p -> p.getContent().contains("공지"))).isTrue();
    }
}
