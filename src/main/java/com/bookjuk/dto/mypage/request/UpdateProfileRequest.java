package com.bookjuk.dto.mypage.request;

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

    private String profileImage;
    private String preferredGenre;
    private String introduction;

}
