package com.bookjuk.dto.mypage;

import com.bookjuk.domain.user.User;
import lombok.*;

@Getter @ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
/**
 * 마이페이지 API 응답을 위한 사용자 프로필 정보 DTO 클래스
 *
 * 사용자의 이름, 이메일, 프로필이미지, 선호장르, 자기소개 목록을 포함합니다.
 *
 */
public class UserInfoDto {

    // 유저 정보
    private String username;
    private String email;
    private String profileImage;
    private String preferredGenre;
    private String introduction;

    // 유저 객체를 MyPage 최상위 응답 dto로 보내기 위한 중간 정적 팩토리 메소드
    public static UserInfoDto from(User user) {
        return UserInfoDto.builder()
                .username(user.getUsername())
                .email(user.getEmail())
                .profileImage(user.getProfileImage())
                .preferredGenre(user.getPreferredGenre())
                .introduction(user.getIntroduction())
                .build();
    }
}
