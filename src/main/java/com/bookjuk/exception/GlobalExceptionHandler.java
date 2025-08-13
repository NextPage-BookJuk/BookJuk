package com.bookjuk.exception;

import com.bookjuk.exception.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.nio.file.AccessDeniedException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 전역 예외처리 핸들러
 * 애플리케이션에서 발생하는 모든 예외를 일관된 형식으로 처리
 */
@Slf4j
@RestControllerAdvice // AOP : 관점지향 프로그래밍
public class GlobalExceptionHandler {

    /**
     * 우리 앱에서 발생한 커스텀 예외들을 처리
     * @ExceptionHandler - 우리 앱에서 throw된 에러들을 처리할 예외클래스
     */
    @ExceptionHandler(CustomException.class)
    public ResponseEntity<?> handleBusinessException(
            CustomException e
            , HttpServletRequest request
    ) {
        log.warn("비즈니스 예외 발생: {}", e.getMessage());

        // 에러 응답객체 생성
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .detail(e.getMessage())
                .path(request.getRequestURI())
                .status(e.getErrorCode().getStatus())
                .error(e.getErrorCode().getCode())
                .build();

        return ResponseEntity
                .status(e.getErrorCode().getStatus())
                .body(errorResponse);
    }

    /**
     * 유효성 검증 예외 처리 (@Valid, @Validated)
     */
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

        log.warn("유효성 검증 실패: {}", validationErrors);

        ErrorResponse response = ErrorResponse.builder()
                .validationErrors(validationErrors) // 디테일 대체
                .timestamp(LocalDateTime.now())
                .error(ErrorCode.VALIDATION_ERROR.getCode())
                .status(ErrorCode.VALIDATION_ERROR.getStatus())
                .build();

        return ResponseEntity.badRequest().body(response);
    }

    // 로그인 실패 시 (비밀번호 불일치 등) 처리
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentialsException(BadCredentialsException e, HttpServletRequest request) {
        log.warn("로그인 실패: {}", e.getMessage());
        return createErrorResponse(ErrorCode.INVALID_PASSWORD, ErrorCode.INVALID_PASSWORD.getMessage(), request);
    }

    // 필요한 권한이 없을 때 (인가 실패) 처리
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(AccessDeniedException e, HttpServletRequest request) {
        log.warn("접근 권한 없음: {}", e.getMessage());
        return createErrorResponse(ErrorCode.FORBIDDEN, ErrorCode.FORBIDDEN.getMessage(), request);
    }

    // 그 외 모든 예외를 처리하는 핸들러 (최후의 보루)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception e, HttpServletRequest request) {
        log.error("처리되지 않은 예외 발생", e);
        return createErrorResponse(ErrorCode.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_SERVER_ERROR.getMessage(), request);
    }

    // 공통 응답 생성 메서드
    private ResponseEntity<ErrorResponse> createErrorResponse(ErrorCode errorCode, String message, HttpServletRequest request) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(errorCode.getStatus())
                .error(errorCode.getCode())
                .detail(message)
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.status(errorCode.getStatus()).body(errorResponse);
    }


}
