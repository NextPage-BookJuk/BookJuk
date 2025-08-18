package com.bookjuk.repository.user;

import com.bookjuk.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * 이메일로 사용자를 조회합니다.
     * 로그인 시 또는 JWT 토큰에서 사용자 정보를 조회할 때 사용됩니다.
     * @param email 사용자의 이메일
     * @return Optional<User> - 사용자가 존재하지 않을 수 있으므로 Optional로 감싸서 반환합니다.
     */
    Optional<User> findByEmail(String email);

    /**
     * 해당 이메일이 DB에 존재하는지 확인합니다.
     * 회원가입 시 이메일 중복 체크에 사용됩니다.
     * findByEmail().isPresent() 보다 성능상 이점이 있습니다.
     * @param email 확인할 이메일
     * @return boolean - 존재하면 true, 존재하지 않으면 false
     */
    boolean existsByEmail(String email);

}
