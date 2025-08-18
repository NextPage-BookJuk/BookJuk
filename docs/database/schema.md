```sql
-- =================================================================
--  BookJuk 데이터베이스 스키마 (v1.0)
--  오프라인 독서모임 플랫폼 DDL
--  작성일: 2025-08-18
--  특징: FK/UNIQUE 제약 조건 제거, 애플리케이션 레벨 무결성 보장
-- =================================================================

-- =================================================================
--  1. 데이터베이스 생성 및 선택
-- =================================================================
CREATE DATABASE IF NOT EXISTS bookjuk
DEFAULT CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE bookjuk;

-- =================================================================
--  2. 테이블 생성
-- =================================================================

-- -----------------------------------------------------
-- Table `user` - 사용자 정보
-- -----------------------------------------------------
DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
                        `user_id`        BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '유저 고유 식별자',
                        `username`       VARCHAR(50) NOT NULL COMMENT '닉네임 (중복 허용)',
                        `email`          VARCHAR(100) NOT NULL COMMENT '이메일 (로그인 ID)',
                        `password`       VARCHAR(255) NOT NULL COMMENT '비밀번호 (해시화하여 저장)',
                        `preferred_genre` VARCHAR(100) NULL COMMENT '선호 장르',
                        `profile_image`  VARCHAR(255) NULL DEFAULT 'default_profile.jpg' COMMENT '프로필 이미지 URL',
                        `introduction`   TEXT NULL COMMENT '자기소개',
                        `created_at`     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '회원 가입 시점',
                        `updated_at`     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '회원 정보 수정 시점'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='사용자 정보';

-- -----------------------------------------------------
-- Table `meeting` - 독서 모임
-- -----------------------------------------------------
DROP TABLE IF EXISTS `meeting`;

CREATE TABLE `meeting` (
                           `meeting_id`       BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '모임 고유 식별자',
                           `host_id`          BIGINT NOT NULL COMMENT '방장(주최자)의 user_id',
                           `title`            VARCHAR(255) NOT NULL COMMENT '모임 제목',
                           `description`      TEXT NULL COMMENT '모임 상세 설명',
                           `image_url`        VARCHAR(255) NULL COMMENT '모임 대표 이미지 URL',
                           `book_title`       VARCHAR(255) NOT NULL COMMENT '선정 도서 제목',
                           `book_author`      VARCHAR(100) NOT NULL COMMENT '선정 도서 저자',
                           `genre`            VARCHAR(100) NOT NULL COMMENT '모임 장르',
                           `meeting_time`     DATETIME NOT NULL COMMENT '모임 시간',
                           `region`           VARCHAR(20) NOT NULL COMMENT '시/도',
                           `city`             VARCHAR(30) NOT NULL COMMENT '시/군',
                           `district`         VARCHAR(30) NOT NULL COMMENT '구/군',
                           `detail_address`   VARCHAR(255) NULL COMMENT '상세주소(선택)',
                           `max_participants` INT NOT NULL COMMENT '최대 참여 인원',
                           `status`           VARCHAR(20) NOT NULL DEFAULT 'RECRUITING' COMMENT '모임 상태 (RECRUITING, FULL, COMPLETED, CANCELLED)',
                           `created_at`       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '모임 생성 시점',
                           `updated_at`       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '모임 정보 수정 시점'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='독서 모임';

-- -----------------------------------------------------
-- Table `meeting_participant` - 모임 참여자
-- -----------------------------------------------------
DROP TABLE IF EXISTS `meeting_participant`;

CREATE TABLE `meeting_participant` (
                                       `id`         BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '참여 고유 식별자',
                                       `meeting_id` BIGINT NOT NULL COMMENT '참여 모임의 id',
                                       `user_id`    BIGINT NOT NULL COMMENT '참여 사용자의 user_id',
                                       `role`       VARCHAR(20) NOT NULL COMMENT '역할: HOST, PARTICIPANT',
                                       `status`     VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT '참여 상태: PENDING, APPROVED, REJECTED',
                                       `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '신청 시점',
                                       `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '상태 변경 시점'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='모임 참여자';

-- -----------------------------------------------------
-- Table `meeting_review` - 모임 후기 (좋아요)
-- -----------------------------------------------------
DROP TABLE IF EXISTS `meeting_review`;

CREATE TABLE `meeting_review` (
                                  `id`           BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '후기(좋아요) 고유 식별자',
                                  `meeting_id`   BIGINT NOT NULL COMMENT '관련 모임의 id',
                                  `reviewer_id`  BIGINT NOT NULL COMMENT '리뷰 작성자 (좋아요를 누른 사람)',
                                  `reviewee_id`  BIGINT NOT NULL COMMENT '리뷰 받은 사용자 (좋아요를 받은 사람)',
                                  `created_at`   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '리뷰 작성 시간'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='모임 후기 (좋아요)';

-- -----------------------------------------------------
-- Table `post` - 모임별 게시글
-- -----------------------------------------------------
DROP TABLE IF EXISTS `post`;

CREATE TABLE `post` (
                        `post_id`         BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '게시글 고유 식별자',
                        `meeting_id`      BIGINT NOT NULL COMMENT '소속된 모임의 id',
                        `user_id`         BIGINT NOT NULL COMMENT '작성자의 user_id',
                        `title`           VARCHAR(200) NOT NULL COMMENT '게시글 제목',
                        `content`         TEXT NOT NULL COMMENT '게시글 내용',
                        `image_url`       VARCHAR(255) NULL COMMENT '첨부 이미지 URL',
                        `created_at`      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '작성일',
                        `updated_at`      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='모임별 게시판의 게시글';

-- -----------------------------------------------------
-- Table `comment` - 댓글
-- -----------------------------------------------------
DROP TABLE IF EXISTS `comment`;

CREATE TABLE `comment` (
                           `id`         BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '댓글 고유 식별자',
                           `post_id`    BIGINT NOT NULL COMMENT '원본 게시글의 id',
                           `user_id`    BIGINT NOT NULL COMMENT '작성자의 user_id',
                           `content`    TEXT NOT NULL COMMENT '댓글 내용',
                           `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '작성일',
                           `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='게시글의 댓글';

-- =================================================================
--  3. 인덱스 생성 (성능 최적화)
-- =================================================================

-- 사용자 이메일 검색 최적화 (로그인, 중복 체크)
CREATE INDEX idx_user_email ON `user`(email);

-- 모임 호스트 검색 최적화
CREATE INDEX idx_meeting_host ON `meeting`(host_id);

-- 모임 검색 최적화 (지역, 장르, 상태별 필터링)
CREATE INDEX idx_meeting_region_city ON `meeting`(region, city);
CREATE INDEX idx_meeting_genre_status ON `meeting`(genre, status);
CREATE INDEX idx_meeting_status_time ON `meeting`(status, meeting_time);

-- 참가자 검색 최적화 (모임별, 사용자별, 상태별)
CREATE INDEX idx_mp_meeting_user_status ON `meeting_participant`(meeting_id, user_id, status);
CREATE INDEX idx_mp_user_status ON `meeting_participant`(user_id, status);

-- 리뷰 검색 최적화
CREATE INDEX idx_review_meeting ON `meeting_review`(meeting_id);
CREATE INDEX idx_review_reviewer ON `meeting_review`(reviewer_id);
CREATE INDEX idx_review_reviewee ON `meeting_review`(reviewee_id);

-- 게시글 검색 최적화 (모임별, 최신순)
CREATE INDEX idx_post_meeting_created ON `post`(meeting_id, created_at);
CREATE INDEX idx_post_user ON `post`(user_id);

-- 댓글 검색 최적화 (게시글별, 최신순)
CREATE INDEX idx_comment_post_created ON `comment`(post_id, created_at);
CREATE INDEX idx_comment_user ON `comment`(user_id);

-- =================================================================
--  4. 샘플 데이터 삽입 (개발/테스트용)
-- =================================================================

-- 테스트 사용자 데이터
INSERT INTO `user` (username, email, password, preferred_genre, introduction) VALUES
                                                                                  ('책읽는호랑이', 'tiger@bookjuk.com', '$2a$10$hashedpassword1', '소설', '안녕하세요! 소설을 좋아하는 독서광입니다.'),
                                                                                  ('문학소녀', 'girl@bookjuk.com', '$2a$10$hashedpassword2', '에세이', '에세이와 시를 사랑합니다.'),
                                                                                  ('철학자', 'philosophy@bookjuk.com', '$2a$10$hashedpassword3', '철학', '깊이 있는 사고를 좋아합니다.'),
                                                                                  ('역사덕후', 'history@bookjuk.com', '$2a$10$hashedpassword4', '역사', '역사책만 읽어도 하루가 부족해요!'),
                                                                                  ('과학맨', 'science@bookjuk.com', '$2a$10$hashedpassword5', '과학', '과학의 세계는 무궁무진합니다.');

-- 테스트 모임 데이터
INSERT INTO `meeting` (host_id, title, description, book_title, book_author, genre, meeting_time, region, city, district, detail_address, max_participants) VALUES
                                                                                                                                                                (1, '8월 소설 읽기 모임', '장류진 작가의 소설을 함께 읽어요!', '달까지 가자', '장류진', '소설', '2025-08-25 19:00:00', '서울특별시', '강남구', '삼성동', '스타벅스 코엑스점', 6),
                                                                                                                                                                (2, '에세이 북클럽', '감성적인 에세이를 함께 나누어요', '나는 나로 살기로 했다', '김수현', '에세이', '2025-08-28 14:00:00', '서울특별시', '종로구', '인사동', '인사동 북카페', 8),
                                                                                                                                                                (3, '철학 토론 모임', '존재에 대해 깊이 생각해봅시다', '존재와 시간', '마르틴 하이데거', '철학', '2025-09-01 15:00:00', '경기도', '수원시', '영통구', '수원대학교 도서관', 5),
                                                                                                                                                                (4, '역사 탐험대', '조선시대 역사를 파헤쳐보아요', '조선왕조실록', '이성무', '역사', '2025-09-05 10:00:00', '서울특별시', '중구', '명동', '서울역사박물관', 7),
                                                                                                                                                                (5, '과학 세미나', '양자역학의 신비를 탐구합니다', '양자역학 강의', '파인만', '과학', '2025-09-10 18:00:00', '경기도', '성남시', '분당구', '분당 과학도서관', 4);

-- 테스트 참가자 데이터 (호스트 자동 참여)
INSERT INTO `meeting_participant` (meeting_id, user_id, role, status) VALUES
                                                                          (1, 1, 'HOST', 'APPROVED'),
                                                                          (2, 2, 'HOST', 'APPROVED'),
                                                                          (3, 3, 'HOST', 'APPROVED'),
                                                                          (4, 4, 'HOST', 'APPROVED'),
                                                                          (5, 5, 'HOST', 'APPROVED');

-- 테스트 참가 신청 데이터
INSERT INTO `meeting_participant` (meeting_id, user_id, role, status) VALUES
                                                                          (1, 2, 'PARTICIPANT', 'APPROVED'),
                                                                          (1, 3, 'PARTICIPANT', 'PENDING'),
                                                                          (2, 1, 'PARTICIPANT', 'APPROVED'),
                                                                          (2, 5, 'PARTICIPANT', 'APPROVED'),
                                                                          (3, 1, 'PARTICIPANT', 'PENDING'),
                                                                          (4, 2, 'PARTICIPANT', 'APPROVED'),
                                                                          (5, 1, 'PARTICIPANT', 'REJECTED');

-- 테스트 게시글 데이터
INSERT INTO `post` (meeting_id, user_id, title, content) VALUES
                                                             (1, 1, '모임 준비사항 안내', '안녕하세요! 다음 주 모임 준비사항을 알려드립니다.\n\n1. 책 읽어오기\n2. 간단한 감상문 준비\n3. 개인 컵 지참\n\n많은 참여 부탁드려요!'),
                                                             (1, 2, '책 감상 후기', '정말 재미있게 읽었어요! 특히 마지막 부분이 인상깊었습니다.'),
                                                             (2, 2, '에세이 모임 공지', '이번 주 모임은 예정대로 진행됩니다. 모두 건강히 참석해주세요!'),
                                                             (3, 3, '철학 토론 주제', '이번 모임에서 논의할 주제를 미리 공유합니다.\n\n존재란 무엇인가에 대해 각자의 생각을 정리해와 주세요.'),
                                                             (4, 4, '역사 자료 공유', '조선시대 관련 흥미로운 자료를 찾았습니다. 모임에서 함께 살펴보아요!');

-- 테스트 댓글 데이터
INSERT INTO `comment` (post_id, user_id, content) VALUES
                                                      (1, 2, '네, 알겠습니다! 열심히 준비해올게요.'),
                                                      (1, 3, '감상문은 어느 정도 분량으로 준비하면 될까요?'),
                                                      (2, 1, '저도 같은 부분이 가장 기억에 남아요!'),
                                                      (3, 2, '건강 챙기시고 뵙겠습니다~'),
                                                      (4, 1, '와 정말 궁금하네요! 기대됩니다.'),
                                                      (5, 2, '좋은 자료 감사합니다. 미리 읽어보고 갈게요.');

-- =================================================================
--  5. 데이터베이스 설정 확인 쿼리
-- =================================================================

-- 테이블 목록 확인
SHOW TABLES;

-- 각 테이블의 구조 확인
DESCRIBE `user`;
DESCRIBE `meeting`;
DESCRIBE `meeting_participant`;
DESCRIBE `meeting_review`;
DESCRIBE `post`;
DESCRIBE `comment`;

-- 인덱스 확인
SHOW INDEX FROM `user`;
SHOW INDEX FROM `meeting`;
SHOW INDEX FROM `meeting_participant`;
SHOW INDEX FROM `meeting_review`;
SHOW INDEX FROM `post`;
SHOW INDEX FROM `comment`;

-- 테이블별 데이터 개수 확인
SELECT 'user' as table_name, COUNT(*) as count FROM `user`
UNION ALL
SELECT 'meeting', COUNT(*) FROM `meeting`
UNION ALL
SELECT 'meeting_participant', COUNT(*) FROM `meeting_participant`
UNION ALL
SELECT 'meeting_review', COUNT(*) FROM `meeting_review`
UNION ALL
SELECT 'post', COUNT(*) FROM `post`
UNION ALL
SELECT 'comment', COUNT(*) FROM `comment`;

-- =================================================================
--  6. 주요 쿼리 예시 (성능 테스트용)
-- =================================================================

-- 모임 목록 조회 (지역 + 장르 필터, 최신순)
SELECT m.*, u.username as host_name
FROM meeting m
         JOIN user u ON m.host_id = u.user_id
WHERE m.region = '서울특별시'
  AND m.city = '강남구'
  AND m.genre = '소설'
  AND m.status = 'RECRUITING'
ORDER BY m.created_at DESC
    LIMIT 10;

-- 특정 모임의 승인된 참가자 목록
SELECT u.username, u.profile_image, mp.role, mp.created_at
FROM user u
         JOIN meeting_participant mp ON u.user_id = mp.user_id
WHERE mp.meeting_id = 1
  AND mp.status = 'APPROVED'
ORDER BY mp.created_at;

-- 모임별 게시글 목록 (댓글 수 포함)
SELECT p.*, u.username,
       (SELECT COUNT(*) FROM comment c WHERE c.post_id = p.post_id) as comment_count
FROM post p
         JOIN user u ON p.user_id = u.user_id
WHERE p.meeting_id = 1
ORDER BY p.created_at DESC;

-- 사용자별 받은 좋아요 수
SELECT u.username, COUNT(mr.id) as received_likes
FROM user u
         LEFT JOIN meeting_review mr ON u.user_id = mr.reviewee_id
GROUP BY u.user_id, u.username
ORDER BY received_likes DESC;

-- 인기 모임 TOP 5 (참가자 수 기준)
SELECT m.title, m.genre, COUNT(mp.id) as participant_count
FROM meeting m
         LEFT JOIN meeting_participant mp ON m.meeting_id = mp.meeting_id
    AND mp.status = 'APPROVED'
WHERE m.status = 'RECRUITING'
GROUP BY m.meeting_id, m.title, m.genre
ORDER BY participant_count DESC
    LIMIT 5;

-- =================================================================
--  설치 및 사용 가이드
-- =================================================================
/*
1. 데이터베이스 설치:
   - MariaDB 설치 후 이 스크립트 실행
   - mysql -u root -p < schema.sql

2. 애플리케이션 설정:
   - application.yml에서 데이터베이스 연결 정보 설정
   - spring.datasource.url: jdbc:mariadb://localhost:3306/bookjuk

3. 개발 시 주의사항:
   - FK 제약조건이 없으므로 애플리케이션에서 데이터 무결성 보장 필요
   - 트랜잭션을 활용한 일관성 유지
   - 중복 데이터 방지를 위한 비즈니스 로직 구현

4. 성능 모니터링:
   - 인덱스 사용률 확인: EXPLAIN 활용
   - 슬로우 쿼리 로그 모니터링
   - 정기적인 ANALYZE TABLE 실행
```