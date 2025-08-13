package com.bookjuk.repository.meeting;

import com.bookjuk.domain.meeting.Meeting;
import com.bookjuk.repository.meeting.custom.MeetingRepositoryCustom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MeetingRepository extends JpaRepository<Meeting, Long>, MeetingRepositoryCustom {

    // 쿼리 메서드, 전달된 문자열과 제목명이 같은 모임을 찾음
    List<Meeting> findByTitle(String title);
}
