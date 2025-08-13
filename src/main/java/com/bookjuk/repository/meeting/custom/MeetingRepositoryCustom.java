package com.bookjuk.repository.meeting.custom;

import com.bookjuk.domain.meeting.Meeting;
import com.bookjuk.domain.meeting.MeetingStatus;
import com.bookjuk.domain.user.User;
import lombok.Builder;
import lombok.Getter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * QueryDSL과 Native Query등을 사용하는 메서드를 명세하는 인터페이스
 */
public interface MeetingRepositoryCustom {

    // 동적 쿼리로 검색 조건별 여행 목록 조회 메서드 (페이징 포함)
    Page<Meeting> getTripList(MeetingSearchCondition condition, Pageable pageable);

    /**
     * 모임 검색 조건들을 담는 클래스
     */
    @Getter
    @Builder
    class MeetingSearchCondition {

        private String region; // 시/도로 검색
        private String city;   // 시/군으로 검색
        private String genre;  // 모임 장르로 검색

        // 상태값 ( RECRUITING(모집), COMPLETED(종료), CANCELLED(취소) )
        @Builder.Default
        private MeetingStatus status = MeetingStatus.RECRUITING; // 모집 상태로 검색

        // 정렬 조건 ( latest / deadline / popular )
        @Builder.Default
        private String sortBy = "latest";
    }
}
