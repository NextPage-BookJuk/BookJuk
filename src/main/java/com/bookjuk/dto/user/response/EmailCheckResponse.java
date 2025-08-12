package com.bookjuk.dto.user.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 이메일 중복 확인 결과를 담는 DTO
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailCheckResponse {

    private boolean available; // true: 사용 가능, false: 사용 불가 (중복)

    /**
     * 정적 팩토리 메서드: 사용 가능 여부를 받아 EmailCheckResponse 객체를 생성합니다.
     */
    public static EmailCheckResponse of(boolean available) {
        return EmailCheckResponse.builder()
                .available(available)
                .build();
    }
}