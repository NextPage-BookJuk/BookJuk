# 📑 BookJuk API 명세서 v2.1 (실제 구현 기준)

| 문서 버전 | 작성일        | 수정일        | 작성자        | 비고                                                  |
|:------| :--------- |:-----------|:-----------|:----------------------------------------------------|
| v2.1  | 2025-08-18 | 2025-09-03 | hsp64, 강관주 | DB 제약 조건(UNIQUE, FK, ON DELETE)을 추가하여 데이터 무결성을 강화 |

---

## 📋 목차

1. [개요](#1-개요)
2. [공통 응답 형식](#2-공통-응답-형식)
3. [인증 API](#3-인증-api)
4. [회원 API](#4-회원-api)
5. [모임 API](#5-모임-api)
6. [참가자 관리 API](#6-참가자-관리-api)
7. [게시판 API](#7-게시판-api)
8. [리뷰 API](#8-리뷰-api)
9. [마이페이지 API](#9-마이페이지-api)
10. [에러 코드](#10-에러-코드)

---

## 1. 개요

BookJuk은 오프라인 독서모임을 위한 웹 플랫폼의 REST API입니다.

### 1.1 Base URL
```
https://api.bookjuk.com/api
```

### 1.2 인증 방식
- **JWT Bearer Token** 인증
- Authorization 헤더: `Bearer {token}`

### 1.3 데이터 포맷
- **Request**: JSON, Multipart/form-data (파일 업로드)
- **Response**: JSON
- **Encoding**: UTF-8
- **Date Format**: ISO 8601 (yyyy-MM-ddTHH:mm:ss)

---

## 2. 공통 응답 형식

### 2.1 성공 응답 (마이페이지 전용)
```
{
  "success": true,
  "message": "성공 메시지",
  "timestamp": "2025-08-18T12:34:56",
  "data": { /* 실제 데이터 */ }
}
```

### 2.2 일반 성공 응답
```
{
  /* 직접 데이터 반환 */
}
```

### 2.3 에러 응답
```json
{
  "error": "ERROR_CODE",
  "message": "에러 메시지",
  "details": ["세부 에러 내용"]
}
```

---

## 3. 인증 API

### 3.1 현재 사용자 정보 조회

**요청**
```http
GET /auth/me
Authorization: Bearer {token}
```

**응답 (200)**
```json
{
  "userId": 1,
  "username": "책읽는호랑이",
  "email": "book@user.com",
  "profileImage": "https://example.com/profile.jpg",
  "preferredGenre": "소설",
  "introduction": "책을 사랑합니다.",
  "createdAt": "2025-08-07T16:42:00"
}
```

**에러**
- `401 Unauthorized`: 토큰 없음 또는 무효
- `500 Internal Server Error`: 서버 오류

### 3.2 로그아웃

**요청**
```http
POST /auth/logout
Authorization: Bearer {token}
```

**응답 (200)**
```
Empty Response
```

---

## 4. 회원 API

### 4.1 회원가입

**요청**
```http
POST /users/signup
Content-Type: application/json

{
  "username": "책읽는호랑이",
  "email": "book@user.com",
  "password": "password123",
  "preferredGenre": "소설",
  "introduction": "책을 사랑합니다."
}
```

**Validation**
- `username`: 필수, 최대 50자
- `email`: 필수, 이메일 형식, 최대 100자
- `password`: 필수, 6-20자
- `preferredGenre`: 선택, 최대 100자
- `introduction`: 선택

**응답 (201)**
```json
{
  "userId": 1,
  "username": "책읽는호랑이",
  "email": "book@user.com",
  "profileImage": "default_profile.jpg",
  "preferredGenre": "소설",
  "introduction": "책을 사랑합니다.",
  "createdAt": "2025-08-18T12:34:56"
}
```

### 4.2 이메일 중복 확인

**요청**
```http
GET /users/check-email?email=book@user.com
```

**응답 (200)**
```json
{
  "available": true
}
```

### 4.3 로그인

**요청**
```http
POST /users/login
Content-Type: application/json

{
  "email": "book@user.com",
  "password": "password123"
}
```

**응답 (200)**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "user": {
    "userId": 1,
    "username": "책읽는호랑이",
    "email": "book@user.com",
    "profileImage": "https://example.com/profile.jpg",
    "preferredGenre": "소설",
    "introduction": "책을 사랑합니다.",
    "createdAt": "2025-08-18T12:34:56"
  }
}
```

---

## 5. 모임 API

### 5.1 모임 목록 조회

**요청**
```http
GET /meetings?region=서울특별시&city=강남구&genre=소설&status=RECRUITING&sortBy=latest&page=0&size=6
```

**Query Parameters**
- `region`: 시/도 (선택)
- `city`: 시/군 (선택)
- `genre`: 장르 (선택)
- `status`: 상태 (RECRUITING/FULL/COMPLETED/CANCELLED, 기본값: RECRUITING)
- `sortBy`: 정렬 (latest/deadline/popular, 기본값: latest)
- `page`: 페이지 번호 (기본값: 0)
- `size`: 페이지 크기 (기본값: 6)

**응답 (200)**
```json
{
  "content": [
    {
      "meetingId": 1,
      "host": {
        "userId": 1,
        "username": "책읽는호랑이",
        "profileImage": "https://example.com/profile.jpg",
        "introduction": "책을 사랑합니다.",
        "hostLikeCount": 15
      },
      "title": "8월 미드나잇 독서모임",
      "description": "밤에 모여 책 읽어요.",
      "imageUrl": "https://example.com/meeting.jpg",
      "bookTitle": "달까지 가자",
      "bookAuthor": "장류진",
      "genre": "소설",
      "meetingTime": "2025-08-15T19:30:00",
      "region": "서울특별시",
      "city": "강남구",
      "district": "삼성동",
      "detailAddress": "독서카페 2층",
      "maxParticipants": 8,
      "currentParticipants": 6,
      "status": "RECRUITING",
      "createdAt": "2025-08-14T19:30:00",
      "updatedAt": "2025-08-14T20:30:00"
    }
  ],
  "totalElements": 32,
  "totalPages": 6,
  "size": 6,
  "number": 0
}
```

### 5.2 모임 상세 조회

**요청**
```http
GET /meetings/{id}
```

**응답 (200)**
```json
{
  "meetingId": 1,
  "title": "8월 미드나잇 독서모임",
  "description": "밤에 모여 책 읽어요.",
  "imageUrl": "https://example.com/meeting.jpg",
  "bookTitle": "달까지 가자",
  "bookAuthor": "장류진",
  "genre": "소설",
  "meetingTime": "2025-08-15T19:30:00",
  "location": "서울특별시 강남구 독서카페 2층",
  "maxParticipants": 8,
  "currentParticipants": 6,
  "meetingStatus": "RECRUITING",
  "host": {
    "id": 1,
    "username": "책읽는호랑이",
    "likesCount": 15,
    "hostedMeetingsCount": 5
  }
}
```

### 5.3 모임 생성

**요청**
```http
POST /meetings
Content-Type: multipart/form-data
Authorization: Bearer {token}

meeting: {
  "title": "8월 미드나잇 독서모임",
  "description": "밤에 모여 책 읽어요.",
  "bookTitle": "달까지 가자",
  "bookAuthor": "장류진",
  "genre": "소설",
  "meetingTime": "2025-08-15T19:30:00",
  "region": "서울특별시",
  "city": "강남구",
  "district": "삼성동",
  "detailAddress": "독서카페 2층",
  "maxParticipants": 8
}
imageFile: (파일, 선택사항)
```

**Validation**
- `title`: 필수, 최대 255자
- `description`: 선택, 최대 2000자
- `bookTitle`: 필수, 최대 255자
- `bookAuthor`: 필수, 최대 100자
- `genre`: 필수, 최대 100자
- `meetingTime`: 필수, 미래 시간
- `region`: 필수, 최대 20자
- `city`: 필수, 최대 30자
- `district`: 필수, 최대 30자
- `detailAddress`: 선택, 최대 255자
- `maxParticipants`: 필수, 2-10명
- `imageFile`: 선택, 이미지 파일 (JPG, PNG 등), 최대 10MB

**응답 (200)**
```json
{
  "meetingId": 1,
  "title": "8월 미드나잇 독서모임",
  "description": "밤에 모여 책 읽어요.",
  "imageUrl": "https://example.com/uploaded-image.jpg",
  "bookTitle": "달까지 가자",
  "bookAuthor": "장류진",
  "genre": "소설",
  "meetingTime": "2025-08-15T19:30:00",
  "location": "서울특별시 강남구 독서카페 2층",
  "maxParticipants": 8,
  "currentParticipants": 1,
  "meetingStatus": "RECRUITING",
  "host": {
    "id": 1,
    "username": "책읽는호랑이",
    "likesCount": 15,
    "hostedMeetingsCount": 5
  }
}
```

### 5.4 참가자 목록 조회

**요청**
```http
GET /meetings/{meetingId}/participants?status=APPROVED
Authorization: Bearer {token}
```

**Query Parameters**
- `status`: 상태 필터 (PENDING/APPROVED/REJECTED, 선택)

**응답 (200)**
```json
[
  {
    "id": 1,
    "username": "책읽는호랑이",
    "role": "HOST",
    "status": "APPROVED",
    "createdAt": "2025-08-14T19:30:00",
    "likesCount": 15
  },
  {
    "id": 2,
    "username": "책벌레",
    "role": "PARTICIPANT",
    "status": "APPROVED",
    "createdAt": "2025-08-14T20:30:00",
    "likesCount": 8
  }
]
```

### 5.5 모임 신청

**요청**
```http
POST /meetings/{meetingId}/apply
Authorization: Bearer {token}
```

**응답 (200)**
```
Empty Response
```

**에러**
- `400 Bad Request`: 중복 신청, 정원 초과 등
- `401 Unauthorized`: 로그인 필요
- `404 Not Found`: 모임 없음

---

## 6. 참가자 관리 API

### 6.1 참가자 승인/거절

**요청**
```http
PATCH /meetings/{meetingId}/participants/{userId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "action": "APPROVE"
}
```

**Request Body**
- `action`: "APPROVE" | "REJECT"

**권한**: 모임 호스트만 가능

**응답 (200)**
```json
{
  "meetingId": 1,
  "userId": 2,
  "status": "APPROVED"
}
```

---

## 7. 게시판 API

### 7.1 게시글 목록 조회

**요청**
```http
GET /meetings/{meetingId}/posts?page=1&size=10
```

**Query Parameters**
- `page`: 페이지 번호 (기본값: 1)
- `size`: 페이지 크기 (기본값: 10)

**응답 (200)**
```json
{
  "content": [
    {
      "postId": 1,
      "title": "모임 준비사항",
      "content": "물, 책, 간식 준비해주세요.",
      "imageUrl": "https://example.com/post-image.jpg",
      "username": "책읽는호랑이",
      "createdAt": "2025-08-15T10:30:00",
      "commentCount": 3
    }
  ],
  "totalElements": 15,
  "totalPages": 2,
  "size": 10,
  "number": 1
}
```

### 7.2 게시글 상세 조회

**요청**
```http
GET /meetings/{meetingId}/posts/{postId}
```

**응답 (200)**
```json
{
  "postId": 1,
  "title": "모임 준비사항",
  "content": "물, 책, 간식 준비해주세요.",
  "imageUrl": "https://example.com/post-image.jpg",
  "username": "책읽는호랑이",
  "createdAt": "2025-08-15T10:30:00",
  "updatedAt": "2025-08-15T10:30:00",
  "comments": [
    {
      "commentId": 1,
      "content": "네, 알겠습니다!",
      "username": "책벌레",
      "createdAt": "2025-08-15T11:00:00"
    }
  ]
}
```

### 7.3 게시글 작성

**요청**
```http
POST /meetings/{meetingId}/posts
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "모임 준비사항",
  "content": "물, 책, 간식 준비해주세요.",
  "imageUrl": "https://example.com/post-image.jpg"
}
```

**Validation**
- `title`: 필수, 최대 200자
- `content`: 필수
- `imageUrl`: 선택

**권한**: 호스트 또는 승인된 참가자만

**응답 (200)**
```json
{
  "postId": 1
}
```

### 7.4 게시글 수정

**요청**
```http
PUT /meetings/{meetingId}/posts/{postId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "수정된 제목",
  "content": "수정된 내용",
  "imageUrl": "https://example.com/new-image.jpg"
}
```

**권한**: 작성자 또는 호스트만

**응답 (200)**
```
Empty Response
```

### 7.5 게시글 삭제

**요청**
```http
DELETE /meetings/{meetingId}/posts/{postId}
Authorization: Bearer {token}
```

**권한**: 작성자 또는 호스트만

**응답 (200)**
```
Empty Response
```

### 7.6 댓글 작성

**요청**
```http
POST /meetings/{meetingId}/posts/{postId}/comments
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "네, 알겠습니다!"
}
```

**Validation**
- `content`: 필수

**권한**: 호스트 또는 승인된 참가자만

**응답 (200)**
```json
{
  "commentId": 1
}
```

### 7.7 댓글 수정

**요청**
```http
PUT /meetings/{meetingId}/posts/{postId}/comments/{commentId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "수정된 댓글 내용"
}
```

**권한**: 작성자 또는 호스트만

**응답 (200)**
```
Empty Response
```

### 7.8 댓글 삭제

**요청**
```http
DELETE /meetings/{meetingId}/posts/{postId}/comments/{commentId}
Authorization: Bearer {token}
```

**권한**: 작성자 또는 호스트만

**응답 (200)**
```
Empty Response
```

---

## 8. 리뷰 API

### 8.1 리뷰(좋아요) 남기기

**요청**
```http
POST /meetings/{meetingId}/reviews
Authorization: Bearer {token}
Content-Type: application/json

{
  "toUserId": 2
}
```

**Validation**
- `toUserId`: 필수, 리뷰 받을 사용자 ID

**제약사항**
- 종료된 모임에서만 가능
- 본인 제외 다른 참가자에게만
- 1회만 가능, 취소 불가

**응답 (200)**
```json
{
  "reviewId": 1,
  "fromUserId": 1,
  "toUserId": 2,
  "createdAt": "2025-08-20T21:00:00"
}
```

---

## 9. 마이페이지 API

### 9.1 마이페이지 정보 조회

**요청**
```http
GET /mypage
Authorization: Bearer {token}
```

**응답 (200)**
```json
{
  "success": true,
  "message": "마이페이지 정보 조회를 성공했습니다.",
  "timestamp": "2025-08-18T12:34:56",
  "data": {
    "profile": {
      "username": "책벌레123",
      "email": "user@example.com",
      "profileImage": "https://example.com/profile.jpg",
      "introduction": "안녕하세요! 추리소설을 좋아합니다.",
      "preferredGenre": "추리"
    },
    "statistics": {
      "receivedLikes": 15,
      "participatedMeeting": 8
    },
    "meetings": [
      {
        "meetingTitle": "추리소설 읽기 모임",
        "meetingTime": "2025-08-15T19:00:00",
        "meetingStatus": "COMPLETED",
        "role": "PARTICIPANT",
        "book": {
          "title": "셜록 홈즈",
          "author": "아서 코난 도일"
        }
      }
    ]
  }
}
```

### 9.2 프로필 수정

**요청**
```http
PUT /mypage/profile
Authorization: Bearer {token}
Content-Type: multipart/form-data

profile: {
  "username": "새로운닉네임",
  "introduction": "새로운 자기소개입니다.",
  "preferredGenre": "추리"
}
imageFile: (파일, 선택사항)
```

**Validation**
- `username`: 선택, 최대 50자
- `introduction`: 선택
- `preferredGenre`: 선택
- `imageFile`: 선택, 이미지 파일

**응답 (200)**
```json
{
  "success": true,
  "message": "프로필이 수정되었습니다",
  "timestamp": "2025-08-18T12:34:56",
  "data": {
    "username": "새로운닉네임",
    "profileImage": "https://example.com/new-profile.jpg",
    "introduction": "새로운 자기소개입니다.",
    "preferredGenre": "추리"
  }
}
```

---

## 10. 에러 코드

### 10.1 HTTP 상태 코드

| 코드 | 의미 | 설명 |
|------|------|------|
| 200 | OK | 성공 |
| 201 | Created | 생성 성공 |
| 400 | Bad Request | 잘못된 요청 |
| 401 | Unauthorized | 인증 필요 |
| 403 | Forbidden | 권한 없음 |
| 404 | Not Found | 리소스 없음 |
| 500 | Internal Server Error | 서버 오류 |

### 10.2 비즈니스 에러 코드

| 코드 | 메시지 | 설명 |
|------|--------|------|
| NEED_LOGIN | 로그인이 필요합니다 | 인증되지 않은 요청 |
| INVALID_INPUT | 입력값이 올바르지 않습니다 | 유효성 검증 실패 |
| FILE_SIZE_EXCEEDED | 파일 크기가 너무 큽니다 | 파일 크기 제한 초과 |
| DUPLICATE_APPLICATION | 이미 신청한 모임입니다 | 중복 신청 |
| MEETING_FULL | 모임 정원이 가득 찼습니다 | 정원 초과 |
| ACCESS_DENIED | 접근 권한이 없습니다 | 권한 부족 |

---

## 📝 참고사항

### 인증
- JWT 토큰은 `@RequestAttribute("userId")`로 미들웨어에서 추출됨
- 토큰 유효기간: 24시간
- 로그아웃 시 클라이언트에서 토큰 삭제 필요

### 파일 업로드
- 지원 형식: JPG, JPEG, PNG, GIF, BMP, WEBP
- 최대 크기: 10MB
- 이미지 검증: MIME 타입 및 확장자 검사

### 데이터베이스
- DB 제약 조건 (`FK`, `UNIQUE`, `CHECK`)을 추가하여 데이터 무결성 보장
- DB 제약 조건 위반에 대한 적절한 예외 처리는 애플리케이션 레벨에서 담당
- 트랜잭션을 통한 동시성 제어

### 주소 체계
- `region`: 시/도 (서울특별시, 경기도 등)
- `city`: 시/군 (강남구, 수원시 등)
- `district`: 구/군 (삼성동, 영통구 등)
- `detailAddress`: 상세 주소 (건물명, 층수 등)