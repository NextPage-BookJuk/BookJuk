package com.bookjuk.dto.meeting.request;

import com.bookjuk.domain.meeting.MeetingStatus;
import com.bookjuk.repository.meeting.custom.MeetingRepositoryCustom;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 모임 목록 조회용 검색 파라미터 DTO
 * GET /api/meetings의 쿼리 파리미터 바인딩에 사용
 */
@Getter
@Setter
@NoArgsConstructor
public class MeetingListSearchRequest {

    // 필터
    private String region;
    private String city;
    private String genre;
    private String status; // 대소문자 무관 입력 허용

    // 정렬
    private String sortBy = "latest"; // latest|deadline|popular

    // 페이징
    private int page = 0;
    private int size = 6;

    /**
     * Repository 검색 조건으로 변환
     * - status는 Enum 변환 시 오류가 나면 무시(null)
     */
    public MeetingRepositoryCustom.MeetingSearchCondition toCondition() {
        MeetingStatus enumStatus = null;
        if (status != null && !status.trim().isEmpty()) {
            try {
                enumStatus = MeetingStatus.valueOf(status.trim().toUpperCase());
            } catch (IllegalArgumentException ignore) {
                // 무시: 잘못된 값은 필터에서 제외
            }
        }

        return MeetingRepositoryCustom.MeetingSearchCondition.builder()
                .status(enumStatus)
                .region(region)
                .city(city)
                .genre(genre)
                .sortBy(sortBy != null ? sortBy : "latest")
                .build();
    }
}