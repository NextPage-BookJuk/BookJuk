package com.bookjuk.repository.meeting;

import com.bookjuk.domain.meeting.Meeting;
import com.bookjuk.domain.meeting.MeetingStatus;
import com.bookjuk.domain.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.bookjuk.repository.meeting.custom.MeetingRepositoryCustom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;


@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long>, MeetingRepositoryCustom {

    // 쿼리 메서드, 전달된 문자열과 제목명이 같은 모임을 찾음
    List<Meeting> findByTitle(String title);

    // JpaRepository가 기본으로 제공하는 메서드들:
    // - save(Meeting meeting): 모임 생성 및 수정 (ID가 없으면 생성, 있으면 수정)
    // - findById(Long id): ID로 모임 단건 조회
    // - findAll(): 모든 모임 조회
    // - delete(Meeting meeting): 모임 삭제
    // ... 등등

    /**
     * 특정 상태(status)의 모임 목록을 페이징 처리하여 조회
     * 예: 모집중(RECRUITING)인 모임만 최신순으로 10개씩 조회
     * @param status 조회할 모임 상태 (RECRUITING, COMPLETED, CANCELLED)
     * @param pageable 페이징 정보 (페이지 번호, 페이지 크기, 정렬 순서 등)
     * @return 페이징된 모임 목록
     */
    Page<Meeting> findByMeetingStatus(MeetingStatus status, Pageable pageable);

    /**
     * 특정 지역(region, city)과 상태(status)에 맞는 모임 목록을 페이징 처리하여 조회
     * 예: '서울시 강남구'에서 '모집중'인 모임 목록 조회
     * @param region 시/도
     * @param city 시/구/군
     * @param status 모임 상태
     * @param pageable 페이징 정보
     * @return 페이징된 모임 목록
     */
    Page<Meeting> findByRegionAndCityAndMeetingStatus(String region, String city, MeetingStatus status, Pageable pageable);

    /**
     * 특정 사용자가 주최한(host) 모임 목록을 조회
     * '마이페이지 > 내가 만든 모임' 기능에서 활용할 수 있습니다.
     * @param host 주최자(User 객체)
     * @return 해당 사용자가 주최한 모임 리스트
     */
    List<Meeting> findByHost(User host);

    /**
     * 모임 제목(title)에 특정 키워드가 포함된 모임 목록을 페이징 처리하여 조회
     * 검색 기능에서 활용할 수 있습니다.
     * @param keyword 검색할 키워드
     * @param pageable 페이징 정보
     * @return 페이징된 모임 목록
     */
    Page<Meeting> findByTitleContaining(String keyword, Pageable pageable);

    /**
     * 특정 호스트가 주최한 모임 수를 카운트합니다.
     *
     * @param hostId 호스트 ID
     * @return 주최한 모임 수
     */
    long countByHost_Id(Long hostId);


    /**
     * 특정 사용자가 주최한 모임 수
     */
    int countByHost(User host);
}
