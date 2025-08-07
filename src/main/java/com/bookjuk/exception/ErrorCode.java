package com.bookjuk.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 애플리케이션에서 발생하는 에러 코드들을 정의 하는 열거체
 * 에러상태코드, 에러메시지, 에러이름을 함께 관리
 */
@Getter
@AllArgsConstructor
public enum ErrorCode {

    // =========================
    // 🔐 인증 및 권한 관련
    // =========================
    NEED_LOGIN("NEED_LOGIN", "로그인이 필요한 작업입니다.", 401),
    UNAUTHORIZED("UNAUTHORIZED", "인증이 필요합니다.", 401),
    FORBIDDEN("FORBIDDEN", "접근 권한이 없습니다.", 403),
    DUPLICATE_EMAIL("DUPLICATE_EMAIL", "이미 사용 중인 이메일입니다.", 409),
    INVALID_EMAIL("INVALID_EMAIL", "이메일이 올바르지 않습니다.", 401),
    INVALID_PASSWORD("INVALID_PASSWORD", "비밀번호가 올바르지 않습니다.", 401),

    // =========================
    // 🙍 사용자 관련
    // =========================
    USER_NOT_FOUND("USER_NOT_FOUND", "사용자를 찾을 수 없습니다.", 404),

    // =========================
    // 📚 모임 관련
    // =========================
    MEETING_NOT_FOUND("MEETING_NOT_FOUND", "해당 모임을 찾을 수 없습니다.", 404),
    MEETING_FULL("MEETING_FULL", "모임 정원이 모두 찼습니다.", 400),
    ALREADY_APPLIED("ALREADY_APPLIED", "이미 해당 모임에 신청하셨습니다.", 400),
    REAPPLY_NOT_ALLOWED("REAPPLY_NOT_ALLOWED", "해당 모임은 재신청이 허용되지 않습니다.", 403),
    NOT_MEETING_HOST("NOT_MEETING_HOST", "모임의 주최자가 아닙니다.", 403),
    CANNOT_MODIFY_FINISHED_MEETING("CANNOT_MODIFY_FINISHED_MEETING", "종료된 모임은 수정할 수 없습니다.", 400),

    // =========================
    // 👥 모임 참여 관련
    // =========================
    PARTICIPANT_NOT_FOUND("PARTICIPANT_NOT_FOUND", "참여자 정보를 찾을 수 없습니다.", 404),
    DUPLICATE_APPROVAL("DUPLICATE_APPROVAL", "이미 승인된 사용자입니다.", 409),

    // =========================
    // 📝 게시글 관련
    // =========================
    POST_NOT_FOUND("POST_NOT_FOUND", "게시글을 찾을 수 없습니다.", 404),
    NOT_POST_AUTHOR("NOT_POST_AUTHOR", "게시글 작성자만 수정 또는 삭제할 수 있습니다.", 403),
    FILE_SIZE_EXCEEDED("FILE_SIZE_EXCEEDED", "파일 크기가 제한을 초과했습니다.", 400),

    // =========================
    // 💬 댓글 관련
    // =========================
    COMMENT_NOT_FOUND("COMMENT_NOT_FOUND", "댓글을 찾을 수 없습니다.", 404),
    NOT_COMMENT_AUTHOR("NOT_COMMENT_AUTHOR", "댓글 작성자만 수정 또는 삭제할 수 있습니다.", 403),

    // =========================
    // ❤️ 좋아요 / 후기 관련
    // =========================
    DUPLICATE_LIKE("DUPLICATE_LIKE", "좋아요는 최대 한 번만 누를 수 있습니다.", 400),
    LIKE_SELF_NOT_ALLOWED("LIKE_SELF_NOT_ALLOWED", "자기 자신을 좋아요할 수 없습니다.", 400),

    // =========================
    // ⚠️ 공통 유효성 / 시스템 에러
    // =========================
    INVALID_INPUT("INVALID_INPUT", "입력값이 올바르지 않습니다.", 400),
    ENTITY_NOT_FOUND("ENTITY_NOT_FOUND", "엔티티를 찾을 수 없습니다.", 404),
    RESOURCE_NOT_FOUND("RESOURCE_NOT_FOUND", "요청한 리소스를 찾을 수 없습니다.", 404),
    INTERNAL_SERVER_ERROR("INTERNAL_SERVER_ERROR", "서버 내부 오류가 발생했습니다.", 500),
    VALIDATION_ERROR("VALIDATION_ERROR", "유효성 검사에 실패했습니다.", 400),

    // 비즈니스 에러 코드
    BUSINESS_ERROR("BUSINESS_ERROR", "비즈니스 로직 오류가 발생했습니다.", 400),
    DUPLICATE_RESOURCE("DUPLICATE_RESOURCE", "이미 존재하는 리소스입니다.", 409),

    // 데이터베이스 관련 에러 코드
    DATA_INTEGRITY_VIOLATION("DATA_INTEGRITY_VIOLATION", "데이터 무결성 제약 조건을 위반했습니다.", 400);


    private final String code;
    private final String message;
    private final int status;

}