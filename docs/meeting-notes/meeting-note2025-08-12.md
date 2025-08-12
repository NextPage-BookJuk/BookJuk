# 📋 2025년 8월 12일 팀 회의록 - 북적북적 프로젝트

> 오늘은 리뷰(좋아요) 기능, 데이터 레이어 설계, 모임 생성 및 리스트 조회 API 구현, 그리고 공통 응답 DTO 설계에 대한 백엔드 중심 개발이 진행되었습니다.

---

## 🧭 오늘 논의 및 작업 내용

### 1. 리뷰(좋아요) 기능 구현

* **Entity/DTO/Repository 작성**

  * `MeetingReview` 엔티티, DTO, `ReviewRepository` 구현
  * 연관관계 정의

    * User : MeetingReview = 1 : N
    * Meeting : MeetingReview = 1 : N
* **비즈니스 로직(Service) 및 테스트**

  * 좋아요 기능 서비스 로직 작성 및 기본 테스트 완료
  * 예외처리 `ErrorCode` 추가
  * QueryDSL 기반 레포지토리 구조 분리

    * `MeetingParticipantRepository`, `MeetingReviewRepository` 각각 JPA 기본 인터페이스 / Custom 인터페이스 / 구현체로 구성
  * TDD(given-when-then) 스타일 CRUD 테스트 수행

---

### 2. API 응답 DTO 구현

* `ApiResponse.java` 생성
* 클라이언트 요청에 일관된 응답 형식을 제공
* 별도의 테스트는 진행하지 않음

---

### 3. 데이터 레이어 설계

* `Post`, `Comment` 엔티티 및 레포지토리 추가
* 참여자 체크용 `MeetingParticipantRepository.java` 추가
* `MeetingReview` 엔티티 오타 수정 (`@ToString` exclude 대상 수정)
* `User` 엔티티의 `@Builder` 위치 변경
* Gradle에 QueryDSL 의존성 추가
* `.ignore`에서 `yml` 파일 제거

---

### 4. 모임 생성 기능 구현

* **백엔드**

  * 모임 생성 컨트롤러, 서비스 로직, 이미지 업로드 서비스 구현
  * 최신화된 User 엔티티 필드명 반영
* **프론트엔드**

  * `create-meeting.html` Thymeleaf 문법 적용
  * 누락된 설명 필드, 닫힌 태그 추가
  * 최대 인원 12명 → 10명으로 제한
  * `create-meeting.js`에 설명 필드 처리 및 제한 로직 추가
  * `create-meeting.css`에 에러 스타일 추가
* **기타**

  * `feat/createMeeting` 브랜치 → dev 병합(충돌 해결 포함)

---

### 5. 모임 리스트 조회 API 구현

* QueryDSL 기반 `MeetingRepositoryCustom` 및 구현체 생성
* 필터링 및 정렬 조건:

  * 지역(region, city), 장르(genre), 상태(status), 정렬 기준(sortBy)
  * 기본 상태값을 모집으로 설정
* 테스트:

  * `MeetingListTest.java` 작성, BDD 스타일 테스트
  * 정렬 및 필터링 로직 검증 완료

---

### 6. 접근 권한 확인, 중복 방지용 ddl 수정

* 보조 인덱스 추가  
 * INDEX `idx_user_email`, `idx_meeting_host`, `idx_mp_meeting_user_status`, `idx_post_meeting_created`, `idx_comment_post_created ` 
 * ON `user(email)`, `meeting(host_id)`, `meeting_participant(meeting_id, user_id, status)`, `post(meeting_id, created_at)`, `comment(post_id, created_at)`

---

## ✅ 오늘의 주요 결정 사항

* 리뷰(좋아요) 기능은 QueryDSL 기반 구조로 확정
* 모임 리스트 조회 시 불필요한 상태 혼합 방지(모집만 기본 노출)
* 공통 응답 DTO를 모든 API에 점진적으로 적용하기로 함
* 프로젝트에만 사용되기 때문에 `.yml` 파일은 Git에서 관리하도록 결정 (.gitignore 파일내 제거)

---

## 📌 관련 이슈

* \#14 신규 모임 생성 API
* \#15 review(좋아요) 기능 구현
* \#17 모임 생성 UI 구현
* \#20 데이터 레이어 설계(엔티티/레포지토리)
* \#23 User 엔티티/Repository 및 테스트 코드
* \#24 API 명세 기반 DTO 클래스 생성
* \#29 모임 수정 메서드/DTO
* \#30 모임 리스트 조회 API
* \#33 API 응답 DTO 구현
* \#35 JWT 토큰 관리 유틸리티 클래스 구현 

---

---

## 🗒️ 다음 작업 계획

* Repository, Service 레이어 구현 시작
* API 명세서 최종 검토 및 문서화
* DDL 변경에 따른 테스트 데이터 생성

---

## 🧾 팀원별 오늘의 회고

> 아래 링크를 통해 각자의 회고 문서를 볼 수 있습니다.

* [강관주 - 2025-08-08 회고](https://github.com/Kanggwanju/project-docs/blob/main/meeting-notes)
* [김경민 - 2025-08-08 회고](https://github.com/minee0505/meetings/blob/main)
* [박현수 - 2025-08-08 회고](https://github.com/hsp64/memoir/blob/main/teamNextPage20250805)
* [신동준 - 2025-08-08 회고](https://github.com/sdj3959/my-retrospectives/tree/master/projects/202508BookJuk)
* [진도희 - 2025-08-08 회고](https://github.com/dohee-jin/project/blob/main/bookjuk/docs/meetings)



## 📅 다음 작업 계획

* 리뷰(좋아요) 기능의 Controller 계층 구현 및 통합 테스트
* 모임 리스트 조회 API에 Pagination 기능 추가
* ApiResponse DTO 적용 범위 확대
* 프론트엔드와 API 연동 테스트
