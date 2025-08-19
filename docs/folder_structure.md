# 📁 BookJuk 프로젝트 폴더 구조

| 문서 버전 | 작성일        | 수정일        | 작성자         | 비고                                                  |
|:------| :--------- | :--------- | :---------- | :-------------------------------------------------- |
| v1.5  | 2025-08-18 | 2025-08-18 | hsp64  | 실제 프로젝트 구조 기준으로 작성 |

---

## 📋 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [루트 디렉토리](#2-루트-디렉토리)
3. [소스 코드 구조](#3-소스-코드-구조)
4. [리소스 구조](#4-리소스-구조)
5. [아키텍처 설명](#5-아키텍처-설명)

---

## 1. 프로젝트 개요

BookJuk은 **Spring Boot 기반 오프라인 독서모임 플랫폼**으로, 계층형 아키텍처와 도메인 중심 설계를 따릅니다.

### 기술 스택
- **Backend**: Spring Boot 3.x, Spring Data JPA, QueryDSL
- **Frontend**: Thymeleaf, HTML5, CSS3, JavaScript ES6+
- **Database**: MariaDB
- **Build Tool**: Gradle
- **Authentication**: JWT

---

## 2. 루트 디렉토리

```
BookJuk/
├── .git/                          # Git 버전 관리
├── .gradle/                       # Gradle 캐시
├── .idea/                         # IntelliJ IDEA 설정
├── build/                         # 빌드 결과물
├── docs/                          # 프로젝트 문서
├── gradle/                        # Gradle Wrapper
├── src/                           # 소스 코드
├── .gitattributes                 # Git 속성 설정
├── .gitignore                     # Git 무시 파일 목록
├── README.md                      # 프로젝트 소개
├── build.gradle                   # Gradle 빌드 스크립트
├── gradlew                        # Gradle Wrapper (Unix)
├── gradlew.bat                    # Gradle Wrapper (Windows)
└── settings.gradle                # Gradle 설정
```

---

## 3. 소스 코드 구조

### 3.1 메인 소스 구조

```
src/main/java/com/bookjuk/
├── BookJukApplication.java        # Spring Boot 애플리케이션 엔트리 포인트
├── config/                        # 설정 클래스
│   ├── QueryDslConfig.java        # QueryDSL 설정
│   ├── SecurityConfig.java        # Spring Security 설정
│   └── WebConfig.java             # 웹 설정 (CORS, 인터셉터 등)
├── controller/                    # 웹 컨트롤러 계층
│   ├── AuthController.java        # 인증 관련 API
│   ├── BoardController.java       # 게시판 API
│   ├── MeetingController.java     # 모임 관리 API
│   ├── MyPageController.java      # 마이페이지 API
│   ├── PageTestController.java    # 테스트용 페이지 컨트롤러
│   ├── ParticipantController.java # 참가자 관리 API
│   ├── PostController.java        # 게시글 단건 처리 API
│   ├── ReviewController.java      # 리뷰 API
│   └── UserController.java        # 회원 관리 API
├── domain/                        # 도메인 엔티티 계층
│   ├── board/                     # 게시판 도메인
│   │   ├── Comment.java           # 댓글 엔티티
│   │   └── Post.java              # 게시글 엔티티
│   ├── meeting/                   # 모임 도메인
│   │   ├── Meeting.java           # 모임 엔티티
│   │   └── MeetingStatus.java     # 모임 상태 열거형
│   ├── participant/               # 참가자 도메인
│   │   ├── MeetingParticipant.java # 모임 참가자 엔티티
│   │   ├── ParticipantRole.java   # 참가자 역할 열거형
│   │   └── ParticipantStatus.java # 참가자 상태 열거형
│   ├── review/                    # 리뷰 도메인
│   │   └── MeetingReview.java     # 모임 리뷰 엔티티
│   └── user/                      # 사용자 도메인
│       ├── Role.java              # 사용자 역할 열거형
│       └── User.java              # 사용자 엔티티
├── dto/                           # 데이터 전송 객체 계층
│   ├── board/                     # 게시판 DTO
│   │   ├── request/               # 요청 DTO
│   │   │   ├── CommentCreateRequest.java
│   │   │   ├── CommentUpdateRequest.java
│   │   │   ├── PostCreateRequest.java
│   │   │   └── PostUpdateRequest.java
│   │   ├── response/              # 응답 DTO
│   │   ├── ParticipantDecisionRequest.java
│   │   ├── ParticipantDecisionResponse.java
│   │   └── ParticipantResponse.java
│   ├── common/                    # 공통 DTO
│   │   └── ApiResponse.java       # 공통 API 응답 래퍼
│   ├── meeting/                   # 모임 DTO
│   │   ├── request/               # 요청 DTO
│   │   │   ├── MeetingListItemDto.java
│   │   │   └── MeetingListSearchRequest.java
│   │   ├── response/              # 응답 DTO
│   │   ├── MeetingCreateRequest.java
│   │   ├── MeetingDetailResponse.java
│   │   └── MeetingUpdateRequest.java
│   ├── mypage/                    # 마이페이지 DTO
│   │   ├── request/
│   │   │   └── UpdateProfileRequest.java
│   │   ├── response/
│   │   ├── MeetingInfoDto.java
│   │   ├── MyPageResponse.java
│   │   ├── StaticsInfoDto.java
│   │   └── UserInfoDto.java
│   ├── participant/               # 참가자 DTO
│   ├── review/                    # 리뷰 DTO
│   │   ├── ReviewRequest.java
│   │   └── ReviewResponse.java
│   └── user/                      # 사용자 DTO
│       ├── request/
│       │   ├── UserLoginRequest.java
│       │   └── UserSignupRequest.java
│       └── response/
│           ├── AuthResponse.java
│           ├── EmailCheckResponse.java
│           └── UserResponse.java
├── exception/                     # 예외 처리 계층
│   └── dto/                       # 예외 관련 DTO
├── jwt/                           # JWT 인증 계층
├── repository/                    # 데이터 접근 계층
│   ├── board/                     # 게시판 리포지토리
│   ├── meeting/                   # 모임 리포지토리
│   │   ├── custom/                # 커스텀 리포지토리 인터페이스
│   │   └── impl/                  # 커스텀 리포지토리 구현체
│   ├── participant/               # 참가자 리포지토리
│   ├── review/                    # 리뷰 리포지토리
│   └── user/                      # 사용자 리포지토리
├── routes/                        # 라우팅 설정
├── service/                       # 비즈니스 로직 계층
│   ├── BoardService.java          # 게시판 서비스
│   ├── FileService.java           # 파일 처리 인터페이스
│   ├── LocalFileService.java      # 로컬 파일 처리 구현체
│   ├── MeetingService.java        # 모임 서비스
│   ├── MyPageService.java         # 마이페이지 서비스
│   ├── ParticipantService.java    # 참가자 서비스
│   ├── PostService.java           # 게시글 서비스
│   ├── ReviewService.java         # 리뷰 서비스
│   └── UserService.java           # 사용자 서비스
└── support/                       # 지원 기능
```

---

## 4. 리소스 구조

### 4.1 메인 리소스

```
src/main/resources/
├── application.yml                # 애플리케이션 설정
├── static/                        # 정적 리소스
│   ├── css/                       # 스타일시트
│   │   ├── auth.css               # 인증 페이지 스타일
│   │   ├── board-detail.css       # 게시판 상세 스타일
│   │   ├── create-meeting.css     # 모임 생성 스타일
│   │   ├── edit-profile.css       # 프로필 편집 스타일
│   │   ├── main-page.css          # 메인 페이지 스타일
│   │   ├── meeting-detail.css     # 모임 상세 스타일
│   │   └── mypage.css             # 마이페이지 스타일
│   ├── images/                    # 이미지 파일
│   └── js/                        # JavaScript 파일
│       ├── auth.js                # 인증 페이지 스크립트
│       ├── board-detail.js        # 게시판 상세 스크립트
│       ├── create-meeting.js      # 모임 생성 스크립트
│       ├── edit-profile.js        # 프로필 편집 스크립트
│       ├── main-page.js           # 메인 페이지 스크립트
│       ├── meeting-detail.js      # 모임 상세 스크립트
│       └── mypage.js              # 마이페이지 스크립트
└── templates/                     # Thymeleaf 템플릿
    ├── auth.html                  # 로그인/회원가입 페이지
    ├── board-detail.html          # 게시판 상세 페이지
    ├── create-meeting.html        # 모임 생성 페이지
    ├── edit-profile.html          # 프로필 편집 페이지
    ├── main-page.html             # 메인 페이지
    ├── meeting-detail.html        # 모임 상세 페이지
    └── mypage.html                # 마이페이지
```


---

## 5. 아키텍처 설명

### 5.1 계층형 아키텍처

```
┌─────────────────────────────────────────┐
│              프레젠테이션 계층              │
│  Controller (REST API + 페이지 라우팅)   │
├─────────────────────────────────────────┤
│               비즈니스 계층                │
│         Service (비즈니스 로직)          │
├─────────────────────────────────────────┤
│              데이터 접근 계층              │
│    Repository (JPA + QueryDSL)         │
├─────────────────────────────────────────┤
│               도메인 계층                 │
│      Entity (JPA 엔티티 + 도메인 로직)    │
└─────────────────────────────────────────┘
```

### 5.2 패키지별 역할

| 패키지 | 역할 | 주요 책임 |
|--------|------|-----------|
| `controller` | 프레젠테이션 계층 | HTTP 요청/응답 처리, 입력값 검증 |
| `service` | 비즈니스 계층 | 비즈니스 로직, 트랜잭션 관리 |
| `repository` | 데이터 접근 계층 | 데이터베이스 CRUD, 복잡한 쿼리 |
| `domain` | 도메인 계층 | 핵심 비즈니스 규칙, 엔티티 |
| `dto` | 데이터 전송 계층 | 계층 간 데이터 전송, API 명세 |
| `config` | 설정 계층 | 스프링 설정, 외부 라이브러리 설정 |

### 5.3 도메인 구조

```
📚 BookJuk 도메인 모델
├── 👤 User (사용자)
│   ├── 🏠 Meeting (1:N 호스팅)
│   ├── 🤝 MeetingParticipant (1:N 참여)
│   └── ⭐ MeetingReview (1:N 리뷰)
├── 🏠 Meeting (모임)
│   ├── 🤝 MeetingParticipant (1:N)
│   ├── 📝 Post (1:N)
│   └── ⭐ MeetingReview (1:N)
├── 📝 Post (게시글)
│   └── 💬 Comment (1:N)
└── 💬 Comment (댓글)
```

### 5.4 주요 설계 원칙

#### **1. 계층 분리**
- 각 계층은 명확한 책임을 가지며 상위 계층만 의존
- 순환 의존성 없음

#### **2. 도메인 중심 설계**
- 도메인별로 패키지 구성 (user, meeting, board 등)
- 풍부한 도메인 모델 지향

#### **3. API 우선 설계**
- RESTful API 설계
- 명확한 DTO 분리 (Request/Response)

#### **4. 테스트 용이성**
- 각 계층별 단위 테스트 가능한 구조
- 의존성 주입을 통한 모킹 지원

#### **5. 확장성 고려**
- 인터페이스 기반 설계 (FileService 등)
- 커스텀 리포지토리를 통한 복잡한 쿼리 분리

---

## 📝 참고사항

### 네이밍 컨벤션
- **패키지**: 소문자, 카멜케이스 금지
- **클래스**: 파스칼케이스 (UserService, MeetingController)
- **메서드/변수**: 카멜케이스 (createMeeting, userId)

### 파일 구성 원칙
- **DTO 분리**: Request/Response 명확히 구분
- **도메인별 패키징**: 관련 기능을 도메인별로 그룹화
- **테스트 미러링**: 메인 소스와 동일한 패키지 구조

### 빌드 도구
- **Gradle**: 의존성 관리 및 빌드 자동화
- **Spring Boot DevTools**: 개발 시 핫 리로드 지원