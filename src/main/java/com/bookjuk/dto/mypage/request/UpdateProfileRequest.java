package com.bookjuk.dto.mypage.request;

import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProfileRequest {

    @Size(max = 50, message = "닉네임은 50자를 초과할 수 없습니다.")
    private String username;

    @Nullable
    private String profileImage;

    @Nullable
    private String preferredGenre;

    @Nullable
    private String introduction;

}
