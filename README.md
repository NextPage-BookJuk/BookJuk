📖 BookJuk - 북적북적

> 책을 통해 사람을 만나고, 이야기를 나누는 온라인 독서 모임 플랫폼

---

### ✅ 프로젝트 소개

**BookJuk**은 사람들이 관심 있는 책을 중심으로 오프라인 또는 온라인 독서 모임을 만들고, 참여하고, 함께 성장할 수 있도록 돕는 플랫폼입니다.
누구나 쉽게 독서 모임을 생성하고, 관심 있는 모임에 참여할 수 있어요.

---

### 🛠️ 사용 기술
| 구분                | 기술                      | 버전                          | 사용 목적 및 설명                        |
| ----------------- | ----------------------- | --------------------------- | --------------------------------- |
| **Language**      | Java                    | 17.0.15                     | 백엔드 애플리케이션 개발 주 언어                |
| **Framework**     | Spring Boot             | 3.5.4                       | 서버 구성, 의존성 주입, 설정 자동화             |
|                   | Spring MVC              | 포함                          | REST API 및 MVC 패턴 기반 웹 애플리케이션 개발  |
|                   | Spring Data JPA         | 포함                          | 객체와 관계형 DB 매핑, CRUD 간소화           |
| **View Template** | Thymeleaf               | 3.x                         | HTML 템플릿 렌더링, 서버사이드 렌더링           |
| **Frontend**      | HTML/CSS                | 최신                          | 기본 구조 및 스타일링                      |
|                   | JavaScript (Vanilla JS) | ES6+                        | 동적 인터랙션 처리, 클라이언트 유효성 검사 등        |
| **Database**      | MariaDB                 | 11.x                        | 사용자, 모임 정보 등 관계형 데이터 저장           |
| **Build Tool**    | Gradle                  | 8.x                         | 프로젝트 의존성 관리, 빌드 자동화               |
| **Test**          | JUnit5                  | 5.x                         | 단위 테스트, TDD 기반 개발 지원              |
|                   | Spring Test             | 포함                          | 통합 테스트, ApplicationContext 기반 테스트 |
| **Collaboration** | Git                     | 최신                          | 버전 관리                             |
|                   | GitHub                  | 팀 조직, 협업, 이슈 관리 및 코드 리뷰 플랫폼 |                                   |
| **IDE**           | IntelliJ IDEA           | Ultimate or Community       | Java 및 Spring 개발을 위한 주요 IDE       |
| **문서**            | Markdown                | -                           | 기능 명세서, API 문서 등 작성               |

jdbc, querydsl + 
---

### 📂 프로젝트 구조 (기본틀 구체화 예정)

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

---

### 📌 주요 기능 (임시)

- 독서 모임 등록 (책 제목, 소개, 장소, 시간 등)
- 모임 고유 코드 생성 및 공유
- 모임 리스트 조회 및 필터링 (지역, 날짜, 책 제목 등)
- 모임 상세 보기 (책 정보, 모집 현황 등)
- 참여 신청 (이름/닉네임만 입력)
- [선택] 후기 작성 기능
- [선택] 책 제목 자동 완성 (외부 API 연동)

---

### 🧪 실행 방법

```bash
# 1. Git 클론
예정

# 2. MariaDB 생성
create database bookjuk default character set utf8mb4;

# 3. 프로젝트 실행 (IntelliJ 또는 터미널에서)
./gradlew bootRun
```

---

### 🙌 팀 소개 

| 이름  | 역할                |
|-----|---------------------|
| 강관주 |사용자가 모임을 탐색하고 신청하는 기능을 구현합니다. |
| 김경민 |모임 생성, 관리, 종료 등 호스트 기능 전반을 구현합니다.|
| 박현수 |모임별 게시판과 커뮤니케이션 기능 구현을 담당합니다.|
| 신동준 |회원가입, 로그인, 보안 기능, 사용자 정보 관리 전반을 담당합니다.|
| 진도희 |사용자 개인 정보 관리 및 후기 기능 구현을 담당합니다.|


---

### 🗂️ 문서

- 📄 [기능 명세서](docs/requirements.md)
- 🧪 [API 명세서](docs/api-spec.md)
- 🗓️ [개발 일정표](docs/roadmap.md)
