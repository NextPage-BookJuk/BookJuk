package com.bookjuk.dto.mypage.response;

import com.bookjuk.domain.user.User;
import lombok.*;

@Getter
@ToString
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProfileResponse {

    private String username;
    private String profileImage;
    private String introduction;
    private String preferredGenre;

    public static UpdateProfileResponse from(User user) {
        return UpdateProfileResponse.builder()
                .username(user.getUsername())
                .profileImage(user.getProfileImage())
                .introduction(user.getIntroduction())
                .preferredGenre(user.getPreferredGenre())
                .build();
    }
}
