package com.bookjuk.dto.user.response;

import com.bookjuk.domain.user.User;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 회원가입 직후 또는 마이페이지에서 렌더링에 사용할 JSON 응답 객체
 */
@Getter
@Builder
@ToString
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private Long userId;
    private String nickname;
    private String email;
    private String profileImage;
    private String preferredGenre;
    private String introduction;
    private LocalDateTime createdAt;

    /**
     * User 엔티티를 UserResponse DTO로 변환합니다.
     */
    public static UserResponse from(User user) {
        return UserResponse.builder()
                .userId(user.getId())
                .nickname(user.getNickname())
                .email(user.getEmail())
                .profileImage(user.getProfileImage())
                .preferredGenre(user.getPreferredGenre())
                .introduction(user.getIntroduction())
                .createdAt(user.getCreatedAt())
                .build();
    }
}