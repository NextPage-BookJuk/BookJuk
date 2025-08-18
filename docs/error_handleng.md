# 🚨 BookJuk 에러 처리 가이드

| 문서 버전 | 작성일        | 수정일        | 작성자         | 비고                                                  |
|:------| :--------- | :--------- | :---------- | :-------------------------------------------------- |
| v1.1  | 2025-08-18 | 2025-08-18 | hsp64  | 실제 예외 처리 구현 기준으로 작성 |

---

## 📋 목차

1. [개요](#1-개요)
2. [에러 처리 아키텍처](#2-에러-처리-아키텍처)
3. [에러 코드 체계](#3-에러-코드-체계)
4. [에러 응답 형식](#4-에러-응답-형식)
5. [커스텀 예외 처리](#5-커스텀-예외-처리)
6. [글로벌 예외 핸들러](#6-글로벌-예외-핸들러)
7. [에러 처리 전략](#7-에러-처리-전략)
8. [프론트엔드 연동 가이드](#8-프론트엔드-연동-가이드)

---

## 1. 개요

BookJuk 프로젝트는 **일관된 에러 처리**를 위해 Spring의 `@RestControllerAdvice`를 활용한 글로벌 예외 처리 시스템을 구축했습니다.

### 🎯 **에러 처리 목표**
- **일관성**: 모든 API에서 동일한 에러 응답 형식
- **명확성**: 클라이언트가 이해하기 쉬운 에러 메시지
- **추적성**: 로깅을 통한 에러 추적 및 디버깅 지원
- **사용자 경험**: 사용자 친화적인 에러 메시지 제공

---

## 2. 에러 처리 아키텍처

### 2.1 전체 구조

```
┌─────────────────────────────────────────┐
│             Controller Layer            │
│        (예외 발생 지점)                    │
├─────────────────────────────────────────┤
│         GlobalExceptionHandler          │
│      (@RestControllerAdvice)            │
│  ┌─────────────────────────────────────┐ │
│  │  CustomException 처리                │ │
│  │  ValidationException 처리            │ │
│  │  SecurityException 처리              │ │
│  │  일반 Exception 처리                  │ │
│  └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│             ErrorResponse               │
│        (표준화된 에러 응답)                │
└─────────────────────────────────────────┘
```

### 2.2 핵심 컴포넌트

| 컴포넌트 | 역할 | 파일 |
|----------|------|------|
| `ErrorCode` | 에러 코드 및 메시지 정의 | `ErrorCode.java` |
| `CustomException` | 비즈니스 예외 클래스 | `CustomException.java` |
| `ErrorResponse` | 표준 에러 응답 DTO | `ErrorResponse.java` |
| `GlobalExceptionHandler` | 글로벌 예외 처리기 | `GlobalExceptionHandler.java` |

---

## 3. 에러 코드 체계

### 3.1 에러 코드 구조

```java
public enum ErrorCode {
    ERROR_NAME("ERROR_CODE", "사용자 친화적 메시지", HTTP_STATUS_CODE)
}
```

### 3.2 카테고리별 에러 코드

#### 🔐 **인증 및 권한 관련 (401, 403)**
```java
NEED_LOGIN("NEED_LOGIN", "로그인이 필요한 작업입니다.", 401)
UNAUTHORIZED("UNAUTHORIZED", "인증이 필요합니다.", 401)
FORBIDDEN("FORBIDDEN", "접근 권한이 없습니다.", 403)
DUPLICATE_EMAIL("DUPLICATE_EMAIL", "이미 사용 중인 이메일입니다.", 409)
INVALID_EMAIL("INVALID_EMAIL", "이메일이 올바르지 않습니다.", 401)
INVALID_PASSWORD("INVALID_PASSWORD", "비밀번호가 올바르지 않습니다.", 401)
```

#### 👤 **사용자 관련 (404)**
```java
USER_NOT_FOUND("USER_NOT_FOUND", "사용자를 찾을 수 없습니다.", 404)
```

#### 📚 **모임 관련 (400, 403, 404)**
```java
MEETING_NOT_FOUND("MEETING_NOT_FOUND", "해당 모임을 찾을 수 없습니다.", 404)
MEETING_FULL("MEETING_FULL", "모임 정원이 모두 찼습니다.", 400)
ALREADY_APPLIED("ALREADY_APPLIED", "이미 해당 모임에 신청하셨습니다.", 400)
NOT_MEETING_HOST("NOT_MEETING_HOST", "모임의 주최자가 아닙니다.", 403)
CANNOT_MODIFY_FINISHED_MEETING("CANNOT_MODIFY_FINISHED_MEETING", "종료된 모임은 수정할 수 없습니다.", 400)
```

#### 👥 **참가자 관리 (404, 409)**
```java
PARTICIPANT_NOT_FOUND("PARTICIPANT_NOT_FOUND", "참여자 정보를 찾을 수 없습니다.", 404)
DUPLICATE_APPROVAL("DUPLICATE_APPROVAL", "이미 승인된 사용자입니다.", 409)
```

#### 📝 **게시글 관련 (400, 403, 404)**
```java
POST_NOT_FOUND("POST_NOT_FOUND", "게시글을 찾을 수 없습니다.", 404)
NOT_POST_AUTHOR("NOT_POST_AUTHOR", "게시글 작성자만 수정 또는 삭제할 수 있습니다.", 403)
POST_ACCESS_DENIED("POST_ACCESS_DENIED", "게시글 작성 권한이 없습니다.", 403)
FILE_SIZE_EXCEEDED("FILE_SIZE_EXCEEDED", "파일 크기가 제한을 초과했습니다.", 400)
```

#### 💬 **댓글 관련 (403, 404)**
```java
COMMENT_NOT_FOUND("COMMENT_NOT_FOUND", "댓글을 찾을 수 없습니다.", 404)
NOT_COMMENT_AUTHOR("NOT_COMMENT_AUTHOR", "댓글 작성자만 수정 또는 삭제할 수 있습니다.", 403)
COMMENT_ACCESS_DENIED("COMMENT_ACCESS_DENIED", "댓글 작성 권한이 없습니다.", 403)
```

#### 🎯 **게시판 규칙 관련 (400, 403)**
```java
BOARD_ACCESS_DENIED("BOARD_ACCESS_DENIED", "게시판 접근 권한이 없습니다. HOST 또는 승인된 참여자만 이용할 수 있습니다.", 403)
MEETING_BOARD_MISMATCH("MEETING_BOARD_MISMATCH", "해당 모임의 게시글이 아닙니다.", 400)
```

#### ❤️ **리뷰/좋아요 관련 (400)**
```java
MEETING_NOT_COMPLETED("MEETING_NOT_COMPLETED", "미팅이 완료되지 않았습니다.", 400)
DUPLICATE_LIKE("DUPLICATE_LIKE", "좋아요는 최대 한 번만 누를 수 있습니다.", 400)
LIKE_SELF_NOT_ALLOWED("LIKE_SELF_NOT_ALLOWED", "자기 자신을 좋아요할 수 없습니다.", 400)
```

#### ⚠️ **공통/시스템 에러 (400, 404, 500)**
```java
INVALID_INPUT("INVALID_INPUT", "입력값이 올바르지 않습니다.", 400)
VALIDATION_ERROR("VALIDATION_ERROR", "유효성 검사에 실패했습니다.", 400)
RESOURCE_NOT_FOUND("RESOURCE_NOT_FOUND", "요청한 리소스를 찾을 수 없습니다.", 404)
INTERNAL_SERVER_ERROR("INTERNAL_SERVER_ERROR", "서버 내부 오류가 발생했습니다.", 500)
```

---

## 4. 에러 응답 형식

### 4.1 기본 에러 응답

```json
{
  "timestamp": "2025-08-18T14:30:00",
  "status": 404,
  "error": "MEETING_NOT_FOUND",
  "detail": "해당 모임을 찾을 수 없습니다.",
  "path": "/api/meetings/999"
}
```

### 4.2 유효성 검증 에러 응답

```json
{
  "timestamp": "2025-08-18T14:30:00",
  "status": 400,
  "error": "VALIDATION_ERROR",
  "validationErrors": [
    {
      "field": "title",
      "message": "모임 제목을 입력해주세요.",
      "rejectedValue": ""
    },
    {
      "field": "maxParticipants",
      "message": "최대 참여 인원은 최소 2명 이상이어야 합니다.",
      "rejectedValue": 1
    }
  ]
}
```

### 4.3 ErrorResponse 구조

```java
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {
    private LocalDateTime timestamp;    // 에러 발생 시간
    private int status;                 // HTTP 상태 코드
    private String error;               // 에러 코드명
    private String detail;              // 상세 에러 메시지
    private String path;                // 에러 발생 URL
    private List<ValidationError> validationErrors; // 유효성 검증 에러 목록
    
    @Getter @Builder
    public static class ValidationError {
        private String field;           // 에러 필드명
        private String message;         // 에러 메시지
        private Object rejectedValue;   // 거부된 값
    }
}
```

---

## 5. 커스텀 예외 처리

### 5.1 CustomException 사용법

```java
// 서비스 계층에서 예외 발생
public Meeting findMeeting(Long meetingId) {
    return meetingRepository.findById(meetingId)
        .orElseThrow(() -> new CustomException(ErrorCode.MEETING_NOT_FOUND));
}

// 권한 검증 시 예외 발생
public void validateMeetingHost(Long userId, Meeting meeting) {
    if (!meeting.getHost().getId().equals(userId)) {
        throw new CustomException(ErrorCode.NOT_MEETING_HOST);
    }
}
```

### 5.2 CustomException 클래스

```java
@Getter
@NoArgsConstructor
public class CustomException extends RuntimeException {
    private ErrorCode errorCode;

    public CustomException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }
}
```

---

## 6. 글로벌 예외 핸들러

### 6.1 주요 핸들러 메서드

#### **비즈니스 예외 처리**
```java
@ExceptionHandler(CustomException.class)
public ResponseEntity<?> handleBusinessException(CustomException e, HttpServletRequest request) {
    log.warn("비즈니스 예외 발생: {}", e.getMessage());
    
    ErrorResponse errorResponse = ErrorResponse.builder()
        .timestamp(LocalDateTime.now())
        .detail(e.getMessage())
        .path(request.getRequestURI())
        .status(e.getErrorCode().getStatus())
        .error(e.getErrorCode().getCode())
        .build();
    
    return ResponseEntity.status(e.getErrorCode().getStatus()).body(errorResponse);
}
```

#### **유효성 검증 예외 처리**
```java
@ExceptionHandler(MethodArgumentNotValidException.class)
public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException e) {
    List<ErrorResponse.ValidationError> validationErrors = e.getBindingResult()
        .getFieldErrors()
        .stream()
        .map(fieldError -> ErrorResponse.ValidationError.builder()
            .field(fieldError.getField())
            .message(fieldError.getDefaultMessage())
            .rejectedValue(fieldError.getRejectedValue())
            .build())
        .collect(Collectors.toList());
    
    ErrorResponse response = ErrorResponse.builder()
        .validationErrors(validationErrors)
        .timestamp(LocalDateTime.now())
        .error(ErrorCode.VALIDATION_ERROR.getCode())
        .status(ErrorCode.VALIDATION_ERROR.getStatus())
        .build();
    
    return ResponseEntity.badRequest().body(response);
}
```

#### **인증 예외 처리**
```java
@ExceptionHandler(BadCredentialsException.class)
public ResponseEntity<ErrorResponse> handleBadCredentialsException(BadCredentialsException e, HttpServletRequest request) {
    log.warn("로그인 실패: {}", e.getMessage());
    return createErrorResponse(ErrorCode.INVALID_PASSWORD, ErrorCode.INVALID_PASSWORD.getMessage(), request);
}
```

#### **최후의 보루 - 모든 예외 처리**
```java
@ExceptionHandler(Exception.class)
public ResponseEntity<ErrorResponse> handleException(Exception e, HttpServletRequest request) {
    log.error("처리되지 않은 예외 발생", e);
    return createErrorResponse(ErrorCode.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_SERVER_ERROR.getMessage(), request);
}
```

---

## 7. 에러 처리 전략

### 7.1 HTTP 상태 코드 매핑

| HTTP 상태 | 의미 | 사용 케이스 |
|-----------|------|-------------|
| `400 Bad Request` | 잘못된 요청 | 유효성 검증 실패, 비즈니스 규칙 위반 |
| `401 Unauthorized` | 인증 필요 | 로그인 필요, 토큰 없음/만료 |
| `403 Forbidden` | 권한 없음 | 접근 권한 부족, 작성자/호스트 아님 |
| `404 Not Found` | 리소스 없음 | 모임/사용자/게시글 없음 |
| `409 Conflict` | 리소스 충돌 | 중복 이메일, 중복 신청 |
| `500 Internal Server Error` | 서버 오류 | 예상치 못한 시스템 오류 |

### 7.2 로깅 전략

#### **로그 레벨별 구분**
```java
// 비즈니스 예외 - WARN 레벨
log.warn("비즈니스 예외 발생: {}", e.getMessage());

// 유효성 검증 실패 - WARN 레벨  
log.warn("유효성 검증 실패: {}", validationErrors);

// 시스템 오류 - ERROR 레벨
log.error("처리되지 않은 예외 발생", e);
```

#### **민감정보 보호**
- 비밀번호, 토큰 등 민감정보는 로그에 기록하지 않음
- 사용자 ID는 기록하되 개인정보는 마스킹 처리

### 7.3 에러 메시지 다국화

현재는 한국어로 고정되어 있으나, 향후 확장 시 고려사항:

```java
// 향후 MessageSource 활용 예시
private String getMessage(String code, Object... args) {
    return messageSource.getMessage(code, args, LocaleContextHolder.getLocale());
}
```

---

## 8. 프론트엔드 연동 가이드

### 8.1 JavaScript에서의 에러 처리

```javascript
// API 요청 시 에러 처리 예시
async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(endpoint, options);
        
        if (!response.ok) {
            const errorData = await response.json();
            handleApiError(errorData);
            throw new Error(errorData.detail || '요청 처리 중 오류가 발생했습니다.');
        }
        
        return response;
    } catch (error) {
        console.error('API 요청 실패:', error);
        throw error;
    }
}

// 에러 코드별 처리
function handleApiError(errorData) {
    switch (errorData.error) {
        case 'NEED_LOGIN':
            alert('로그인이 필요합니다.');
            window.location.href = '/auth';
            break;
            
        case 'FORBIDDEN':
            alert('접근 권한이 없습니다.');
            break;
            
        case 'VALIDATION_ERROR':
            handleValidationErrors(errorData.validationErrors);
            break;
            
        case 'MEETING_FULL':
            alert('모임 정원이 모두 찼습니다.');
            break;
            
        default:
            alert(errorData.detail || '오류가 발생했습니다.');
    }
}

// 유효성 검증 에러 처리
function handleValidationErrors(validationErrors) {
    validationErrors.forEach(error => {
        const field = document.getElementById(error.field);
        if (field) {
            field.style.borderColor = 'red';
            // 에러 메시지 표시
            showFieldError(error.field, error.message);
        }
    });
}
```

### 8.2 HTTP 상태 코드별 처리

```javascript
// fetch API에서 상태 코드별 처리
const response = await fetch('/api/meetings/1');

switch (response.status) {
    case 200:
        // 성공 처리
        const data = await response.json();
        break;
        
    case 401:
        // 인증 필요
        localStorage.removeItem('authToken');
        window.location.href = '/auth';
        break;
        
    case 403:
        // 권한 없음
        alert('접근 권한이 없습니다.');
        break;
        
    case 404:
        // 리소스 없음
        alert('요청한 리소스를 찾을 수 없습니다.');
        break;
        
    case 500:
        // 서버 오류
        alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        break;
}
```

### 8.3 사용자 친화적 메시지 표시

```javascript
// 에러 코드를 사용자 친화적 메시지로 변환
const ERROR_MESSAGES = {
    'MEETING_NOT_FOUND': '해당 모임을 찾을 수 없습니다.',
    'MEETING_FULL': '모임 정원이 모두 찼습니다.',
    'ALREADY_APPLIED': '이미 신청하신 모임입니다.',
    'NOT_MEETING_HOST': '모임 주최자만 수정할 수 있습니다.',
    'POST_ACCESS_DENIED': '게시글 작성 권한이 없습니다.',
    // ... 기타 에러 코드들
};

function showUserFriendlyError(errorCode, fallbackMessage) {
    const message = ERROR_MESSAGES[errorCode] || fallbackMessage;
    
    // Toast, Modal, Alert 등으로 표시
    showToast(message, 'error');
}
```

---

## 📝 **개발 가이드라인**

### ✅ **새로운 에러 코드 추가 시**

1. **ErrorCode enum에 추가**
   ```java
   NEW_ERROR("NEW_ERROR", "새로운 에러 메시지", HTTP_STATUS_CODE)
   ```

2. **적절한 카테고리로 분류**
    - 인증/권한, 사용자, 모임, 게시판 등

3. **HTTP 상태 코드 적절히 선택**
    - 400: 클라이언트 요청 오류
    - 401: 인증 필요
    - 403: 권한 없음
    - 404: 리소스 없음
    - 409: 충돌
    - 500: 서버 오류

4. **사용자 친화적 메시지 작성**
    - 기술적 용어 지양
    - 명확하고 이해하기 쉬운 표현

### ✅ **예외 발생 시 권장사항**

```java
// ✅ 좋은 예시
if (meeting == null) {
    throw new CustomException(ErrorCode.MEETING_NOT_FOUND);
}

// ❌ 나쁜 예시
if (meeting == null) {
    throw new RuntimeException("Meeting not found");
}
```

### ✅ **로깅 권장사항**

```java
// ✅ 적절한 로깅
log.warn("모임 신청 실패 - 사용자ID: {}, 모임ID: {}, 사유: {}", 
         userId, meetingId, "이미 신청함");

// ❌ 과도한 로깅
log.error("모임 신청 실패", exception); // 비즈니스 예외에 ERROR 레벨 사용
```

---

## 🔧 **확장 계획**

### Phase 2
- **에러 메시지 다국화** (MessageSource 활용)
- **에러 알림 시스템** (Slack, 이메일 연동)
- **에러 대시보드** (모니터링 도구 연동)

### Phase 3
- **사용자별 에러 추적** (Sentry, APM 도구)
- **A/B 테스트용 에러 메시지**
- **자동 에러 복구 메커니즘**