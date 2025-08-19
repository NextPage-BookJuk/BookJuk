# 📋 2025년 8월 14일 팀 회의록 - 북적북적 프로젝트

### 1. 개요

* 데이터 레이어 설계, 사용자 인증 및 보안, 게시판 기능, 모임 기능 구현 등 백엔드 주요 기능 개발 진행 상황 공유 및 통합.
* 개발 완료된 기능과 진행 중인 기능, 테스트 현황을 점검.

---

### 2. 주요 변경사항

#### 2.1 데이터 레이어 설계 (#20)

* **Post, Comment 엔터티 및 레포지토리 작성**
* `CommentRepository`, `PostRepository` 생성
* API 명세서, DDL 참고하여 구조 설계

**테스트 현황**

* 엔티티 매핑 기본 동작 로컬 확인, Repository 단위 기본 CRUD 점검(샘플 데이터)

---

#### 2.2 모임 수정/상세 DTO 및 엔터티 메서드 추가 (#29)

* `MeetingUpdateRequestDto`, `MeetingDetailResponseDto` 생성
* `Meeting` 엔터티에 `update()` 비즈니스 메서드 추가

**테스트 현황**

* `update()` 메서드 단위 테스트(제목/시간/장소 변경) 및 유효성 경계값 검증 준비

---

#### 2.3 사용자 인증 로직 구현 (#36, #44, #45, #49, #50)

* **회원가입/로그인 로직**: 비밀번호 암호화, 이메일 중복 검사, JWT 발급
* **JWT 인증 필터**: `JwtAuthenticationFilter` 구현, 토큰 검증 및 인증 컨텍스트 설정
* **Spring Security 설정**: 세션 Stateless, 인증/비인증 URL 권한 설정, 필터 등록
* **GlobalExceptionHandler**: 인증 관련 예외 처리 로직 추가
* **UserRepository**: `findByEmail`, `existsByEmail` 메서드 추가 및 테스트 작성

**테스트 현황**

* `UserRepositoryTest`로 저장/조회/존재 여부 검증
* 로그인 실패/토큰 누락 시 예외 응답 포맷 확인(401/403)

---

#### 2.4 UserController 구현 및 API 테스트

* 회원가입, 로그인, 이메일 중복 확인 API 구현
* Postman을 통한 API 테스트 (성공/실패 케이스 포함)

**테스트 현황**

* 정상/에러 플로우 수동 테스트 완료, 응답 스키마 점검

---

#### 2.5 게시판 기능 구현 (#52, #53, #54)

* **DTO 구현**: 게시글/댓글 작성·수정·조회 요청/응답 DTO 작성, Validation 적용
* **서비스 로직**: 게시글·댓글 CRUD, 권한 검증, 댓글 작성 규칙 변경(하나 → 여러 개 가능)
* **컨트롤러 구현**: API 엔드포인트 작성, JWT 인증 적용, 페이징 처리

**성능/품질**

* 작성자 닉네임 조회 시 **N+1 문제 해결**을 위한 fetch join/전용 조회 쿼리 도입

**테스트 현황**

* 목록 페이징/정렬 경계값 수동 점검, 권한별 접근 제어 확인

---

#### 2.6 게시글/댓글 작성자 닉네임 표시 (#56)

* UserRepository 의존성 추가
* 작성자 닉네임 조회 및 Response DTO 반영
* N+1 문제 해결로 성능 최적화

**테스트 현황**

* 단일/다건 조회 시 닉네임 매핑 정확성 확인

---

#### 2.7 모임 리스트 조회 API 구현 (#58)

* `MeetingListSearchRequest`, `MeetingListItemDto`, `MeetingListResponse` 작성
* `MeetingController`, `MeetingService` 구현
* DB 조회 결과를 DTO 변환 후 `ApiResponse`로 반환

**테스트 현황**

* Postman으로 필터(region/city/genre/status), 정렬(latest/deadline/popular), 페이징(page/size) 조합 테스트

---

#### 2.8 통합 기능 구현 및 수정 (#59)

* JWT 인증 필터, 예외 처리, UserRepository, UserService, UserController 기능 통합
* `JwtProvider` 키 초기화 문제 수정 (`getSigningKey` 활용)
* `UserRepository` 테스트, Postman API 테스트 완료

**테스트 현황**

* 인증 성공/실패/만료 토큰 케이스 수동 검증

---

#### 2.9 모임 생성 기능 구현 (#60)

* `LocalFileService`: 이미지 업로드 보안 강화(확장자/용량/MIME 검증)
* `MeetingCreateRequest` DTO: 유효성 검사 추가
* 프런트엔드 `create-meeting.js`: 동적 지역 선택, 폼 전송 구현
* `meeting` 테이블 3단계 지역 구조 생성
* 테스트: `/meeting/create-meeting.html` 페이지에서 API 호출 검증

**테스트 현황**

* 필수값 누락/과거 일시/파일 용량 초과/허용되지 않은 확장자 케이스 수동 검증

---

## ✅ 오늘의 주요 결정 사항

* PR 3개 오류 수정 후 **dev 최신화** 진행
* **Spring Boot Scheduler** 도입(모임 자동 종료 등 운영 태스크 준비)
* **지역 세분화(구 추가)** DDL 반영 예정
* 각 기능별 오류 **enum `ErrorCode`** 파일에 추가(표준화)

---

### 4. 향후 계획

* 모임 상세 페이지 구현 및 UI 연동
* 게시판 기능 프론트엔드 연동
* JWT 인증 로직과 예외 처리 **통합 테스트** 강화(MockMvc/RestAssured)

---

## 🧾 팀원별 오늘의 회고

> 아래 링크를 통해 각자의 회고 문서를 볼 수 있습니다.

* [강관주 - 2025-08-14 회고](https://github.com/Kanggwanju/project-docs/blob/main/meeting-notes)
* [김경민 - 2025-08-14 회고](https://github.com/minee0505/meetings/blob/main)
* [박현수 - 2025-08-14 회고](https://github.com/hsp64/memoir/blob/main/teamNextPage20250805)
* [신동준 - 2025-08-14 회고](https://github.com/sdj3959/my-retrospectives/tree/master/projects/202508BookJuk)
* [진도희 - 2025-08-14 회고](https://github.com/dohee-jin/project/blob/main/bookjuk/docs/meetings)
