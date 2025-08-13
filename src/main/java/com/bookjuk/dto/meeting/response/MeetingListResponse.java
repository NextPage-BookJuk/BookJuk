package com.bookjuk.dto.meeting.response;

import com.bookjuk.dto.meeting.request.MeetingListItemDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * MeetingListResponse 클래스는 모임 목록 응답 데이터를 나타낸다.
 * 페이징 처리된 형태로 모임의 목록과 메타 정보를 포함한다.
 *
 * 필드 설명:
 * - content: 모임 목록 데이터를 담고 있으며, 각 항목은 MeetingListItemDto 객체로 구성된다.
 * - page: 현재 페이지 번호를 나타낸다.
 * - size: 페이지당 아이템 개수를 나타낸다.
 * - totalElements: 전체 데이터의 총 개수를 나타낸다.
 */
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MeetingListResponse {
    private List<MeetingListItemDto> content;
    private int page;
    private int size;
    private long totalElements;
}
