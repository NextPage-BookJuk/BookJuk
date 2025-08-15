package com.bookjuk.service;

import com.bookjuk.domain.user.User;
import com.bookjuk.dto.user.request.UserLoginRequest;
import com.bookjuk.dto.user.request.UserSignupRequest;
import com.bookjuk.dto.user.response.AuthResponse;
import com.bookjuk.dto.user.response.UserResponse;
import com.bookjuk.exception.CustomException;
import com.bookjuk.exception.ErrorCode;
import com.bookjuk.jwt.JwtProvider;
import com.bookjuk.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true) // 클래스 레벨에 읽기 전용 트랜잭션을 설정하여 성능 최적화
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    /**
     * 회원가입 로직 (API 명세서 1-1)
     * @param request 회원가입 요청 DTO
     * @return 생성된 사용자 정보 DTO
     */
    @Transactional // 쓰기 작업이므로 별도의 read-write 트랜잭션 설정
    public UserResponse registerUser(UserSignupRequest request) {
        // 1. 이메일 중복 확인
        if (userRepository.existsByEmail(request.getEmail())) {
            // ErrorCode를 사용하여 명확한 예외 발생
            throw new CustomException(ErrorCode.DUPLICATE_EMAIL);
        }

        // 2. 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        // 3. User 엔티티 생성 (빌더 패턴 사용)
        User newUser = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(encodedPassword)
                .preferredGenre(request.getPreferredGenre())
                .introduction(request.getIntroduction())
                .build();

        // 4. 데이터베이스에 저장
        User savedUser = userRepository.save(newUser);
        log.info("새로운 사용자가 등록되었습니다: email={}", savedUser.getEmail());

        // 5. UserResponse DTO로 변환하여 반환
        return UserResponse.from(savedUser);
    }

    /**
     * 로그인 로직 (API 명세서 1-3)
     * @param request 로그인 요청 DTO
     * @return 인증 정보(토큰, 사용자 정보) DTO
     */
    public AuthResponse loginUser(UserLoginRequest request) {
        // 1. 이메일로 사용자 조회
        User user = userRepository.findByEmail(request.getEmail())
                // 사용자를 찾을 수 없을 때, 보안을 위해 "사용자 없음" 대신 포괄적인 예외 메시지 사용
                .orElseThrow(() -> new BadCredentialsException("이메일 또는 비밀번호가 일치하지 않습니다."));

        // 2. 비밀번호 일치 여부 확인
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            // 비밀번호가 틀렸을 때도 동일한 예외를 발생시켜 정보 노출 방지
            throw new BadCredentialsException("이메일 또는 비밀번호가 일치하지 않습니다.");
        }

        // 3. JWT 토큰 생성
        String token = jwtProvider.generateToken(user.getEmail());
        log.info("로그인 성공 및 토큰 발급: email={}", user.getEmail());

        // 4. AuthResponse DTO로 변환하여 반환
        return AuthResponse.of(token, UserResponse.from(user));
    }

    /**
     * 이메일 사용 가능 여부 확인 로직 (API 명세서 1-2)
     * @param email 확인할 이메일
     * @return 사용 가능하면 true, 아니면 false
     */
    public boolean isEmailAvailable(String email) {
        // existsByEmail의 결과를 반전시켜 "사용 가능 여부"를 반환
        return !userRepository.existsByEmail(email);
    }

    /**
     * jwt 인증 정보로 가져온 사용자 이메일로 사용자 객체 반환
     * @param email 확인할 이메일
     * @return 유저 정보가 있으면 해당 유저 객체 반환, 없으면 커스텀 에러 발생
     */
    public User findUser(String email) {
        return userRepository.findByEmail(email).orElseThrow(
                () -> new CustomException(ErrorCode.USER_NOT_FOUND)
        );
    }
}