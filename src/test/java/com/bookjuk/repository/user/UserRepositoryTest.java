package com.bookjuk.repository.user;

import com.bookjuk.domain.user.User;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EntityManager em; // 테스트용 엔티티 매니저

    private User testUser;

    // 각 테스트가 실행되기 전에 테스트용 User 객체를 생성
    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .username("테스트유저")
                .email("test@bookjuk.com")
                .password("password123")
                .preferredGenre("소설")
                .build();
    }

    @Test
    @DisplayName("회원 저장 및 ID로 조회 테스트")
    void saveAndFindByIdTest() {
        // given: testUser가 준비됨

        // when: 사용자를 저장
        User savedUser = userRepository.save(testUser);

        // then: 저장된 사용자의 ID로 다시 조회했을 때, 데이터가 일치해야 함
        Optional<User> foundUserOptional = userRepository.findById(savedUser.getId());

        assertThat(foundUserOptional).isPresent(); // 조회 결과가 존재해야 함
        User foundUser = foundUserOptional.get();
        assertThat(foundUser.getEmail()).isEqualTo(testUser.getEmail());
        assertThat(foundUser.getUsername()).isEqualTo(testUser.getUsername());
    }

    @Test
    @DisplayName("이메일로 회원 조회 테스트")
    void findByEmailTest() {
        // given: 사용자를 미리 저장
        userRepository.save(testUser);
        // 영속성 컨텍스트를 초기화하여 findByEmail이 DB에서 조회하도록 강제
        em.flush();
        em.clear();

        // when: 저장된 이메일로 사용자를 조회
        Optional<User> foundUserOptional = userRepository.findByEmail("test@bookjuk.com");

        // then: 조회된 사용자가 존재하고, 이메일이 일치해야 함
        assertThat(foundUserOptional).isPresent();
        assertThat(foundUserOptional.get().getEmail()).isEqualTo("test@bookjuk.com");
    }

    @Test
    @DisplayName("존재하지 않는 이메일로 조회 시 비어있는 Optional을 반환한다")
    void findByNonExistentEmailTest() {
        // given: 아무 데이터도 저장되지 않음

        // when: 존재하지 않는 이메일로 조회
        Optional<User> foundUserOptional = userRepository.findByEmail("nonexistent@bookjuk.com");

        // then: 결과는 비어있어야 함
        assertThat(foundUserOptional).isEmpty();
    }

    @Test
    @DisplayName("이메일 존재 여부 확인 테스트")
    void existsByEmailTest() {
        // given: 사용자를 미리 저장
        userRepository.save(testUser);
        em.flush();
        em.clear();

        // when & then
        // 1. 존재하는 이메일 확인
        assertThat(userRepository.existsByEmail("test@bookjuk.com")).isTrue();
        // 2. 존재하지 않는 이메일 확인
        assertThat(userRepository.existsByEmail("nonexistent@bookjuk.com")).isFalse();
    }

}