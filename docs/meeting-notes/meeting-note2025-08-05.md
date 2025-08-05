# 📋 2025년 8월 5일 팀 회의록 - 북적북적 프로젝트

> 프로젝트 기능 분배 확정 및 개발 구조 설정 회의

---

## 🧭 오늘 논의한 주요 내용

* 팀원들이 수집한 자료를 바탕으로 기능 구체화
* 회의 중간 점검: 기능 우선순위 조율 및 MVP 재확인
* DB 테이블 구성 및 ERD 초안 도출
* 주요 기능 기준 팀원별 역할 정비 및 분담
* 스프링 프로젝트 디렉토리 구조 설계

---

## 🧱 팀원별 역할 분배 (2025-08-05 기준)

| 이름  | 역할             | 담당 기능                                |
| --- | -------------- | ------------------------------------ |
| 김경민 | 모임 생성 및 관리자 기능 | 모임 생성, 참여자 승인, 상태 변경, 후기 수신 등 호스트 로직 |
| 강관주 | 모임 탐색 및 참여 기능  | 모임 리스트 및 상세 조회, 참여 신청/취소, 후기 작성 연동   |
| 진도희 | 마이페이지 및 후기 기능  | 내 정보, 참여 이력, 후기 목록, 좋아요 작성/조회 기능     |
| 박현수 | 커뮤니티 기능 (팀장)   | 게시판, 댓글, 모임별 소통 공간 및 전반적 기술 구조 가이드   |
| 신동준 | 사용자 인증 및 회원 관리 | JWT 로그인/회원가입, 보안처리, 사용자 정보 관리        |

---

## 🗂️ ERD 및 테이블 구조 확정

* 최종 테이블 목록:

    * `user`
    * `meeting`
    * `meeting_participant`
    * `meeting_review`
    * `post`
    * `comment`
* 추후 외래 키는 정합성만 보장 (제약조건 없음)

---

## 🗃️ 디렉토리 구조 설계 (Spring Boot 기준)

```bash
bookjuk-backend/
├── docs/                                      # 문서화 디렉토리 (API 명세서, ERD, 설계 문서 등)
│   ├── meeting-notes
│   │    └── meeting-note.md
│   ├── api-spec.md
│   ├── collaboration-rules.md
│   ├── erd.drawio
│   ├── architecture.md
│   └── roadmap.md
│
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/bookjuk/
│   │   │       ├── BookJukApplication.java         # 메인 실행 클래스
│   │   │
│   │   │       ├── config/                         # 전역 설정 클래스
│   │   │       │   └── SecurityConfig.java
│   │   │
│   │   │       ├── domain/                         # JPA Entity, Enum 등 도메인 계층
│   │   │       │   ├── user/
│   │   │       │   │   ├── User.java
│   │   │       │   │   └── Role.java               # 권한 Enum
│   │   │       │   ├── meeting/
│   │   │       │   │   ├── Meeting.java
│   │   │       │   │   └── MeetingStatus.java
│   │   │       │   ├── review/
│   │   │       │   │   └── MeetingReview.java
│   │   │       │   ├── board/
│   │   │       │   │   ├── Post.java
│   │   │       │   │   └── Comment.java
│   │   │       │   └── participant/
│   │   │       │       └── MeetingParticipant.java
│   │   │
│   │   │       ├── repository/                     # Spring Data JPA Repository
│   │   │       │   ├── user/
│   │   │       │   │   └── UserRepository.java
│   │   │       │   ├── meeting/
│   │   │       │   │   └── MeetingRepository.java
│   │   │       │   ├── review/
│   │   │       │   │   └── MeetingReviewRepository.java
│   │   │       │   ├── board/
│   │   │       │   │   └── PostRepository.java
│   │   │       │   └── participant/
│   │   │       │       └── MeetingParticipantRepository.java
│   │   │
│   │   │       ├── dto/                            # Request/Response DTO
│   │   │       │   ├── user/
│   │   │       │   │   ├── UserSignupRequest.java
│   │   │       │   │   ├── UserLoginRequest.java
│   │   │       │   │   └── UserResponse.java
│   │   │       │   ├── meeting/
│   │   │       │   │   └── MeetingCreateRequest.java
│   │   │       │   └── review/
│   │   │       │       └── ReviewRequest.java
│   │   │
│   │   │       ├── service/                        # 비즈니스 로직
│   │   │       │   ├── UserService.java
│   │   │       │   ├── MeetingService.java
│   │   │       │   ├── ReviewService.java
│   │   │       │   ├── PostService.java
│   │   │       │   └── ParticipantService.java
│   │   │
│   │   │       ├── controller/                     # REST API 컨트롤러
│   │   │       │   ├── UserController.java
│   │   │       │   ├── AuthController.java
│   │   │       │   ├── MeetingController.java
│   │   │       │   ├── ReviewController.java
│   │   │       │   ├── PostController.java
│   │   │       │   └── ParticipantController.java
│   │   │
│   │   │       └── exception/                      # 예외 처리
│   │   │           ├── GlobalExceptionHandler.java
│   │   │           ├── ErrorCode.java
│   │   │           └── CustomException.java
│   │   │
│   │   └── resources/
│   │       ├── application.yml                     # 환경 설정
│   │       ├── static/                             # 정적 리소스 (favicon 등)
│   │       └── templates/                          # Thymeleaf 템플릿 (선택)
│   │
│   └── test/
│       └── java/
│            └── .gitkeep
│   
│
├── build.gradle
└── README.md
```
## 🧾 팀원별 오늘의 회고

> 아래 링크를 통해 각자의 회고 문서를 볼 수 있습니다.

* [강관주 - 2025-08-05 회고](https://github.com/Kanggwanju/project-docs/blob/main/meeting-notes)
* [김경민 - 2025-08-05 회고](https://github.com/minee0505/meetings/blob/main)
* [박현수 - 2025-08-05 회고](https://github.com/hsp64/memoir/blob/main/teamNextPage20250805)
* [신동준 - 2025-08-05 회고](https://github.com/sdj3959/my-retrospectives/tree/master/projects/202508BookJuk)
* [진도희 - 2025-08-05 회고](https://github.com/dohee-jin/project/blob/main/bookjuk/docs/meetings)

---

## ⏭️ 내일 작업 계획

* UI/UX 시안 확정 및 기본 레이아웃 구성 논의
* 프로젝트 일정표 세분화 및 중간 점검 마일스톤 설정
* 테스트 방식(TDD 기반, 유닛/통합 테스트 범위) 및 전략 수립
