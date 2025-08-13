package com.bookjuk.repository.user;

import com.bookjuk.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * 이메일로 사용자를 찾는 메서드
     * @param email 찾을 사용자의 이메일
     * @return 사용자 정보 (Optional로 래핑)
     */
    Optional<User> findByEmail(String email);

}
