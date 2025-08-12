package com.bookjuk.dto.meeting;
import com.bookjuk.domain.meeting.Meeting;
import com.bookjuk.domain.meeting.MeetingStatus;
import com.bookjuk.domain.user.User;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@EqualsAndHashCode
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class MeetingCreateRequest {

    @NotEmpty(message = "모임 제목을 입력해주세요.")
    @Size(max = 255, message = "모임 제목은 255자를 넘을 수 없습니다.")
    private String title;

    @Size(max = 2000, message = "모임 상세 설명은 2000자를 넘을 수 없습니다.")
    private String description;

    @NotEmpty(message = "선정 도서 제목을 입력해주세요.")
    @Size(max = 255, message = "도서 제목은 255자를 넘을 수 없습니다.")
    private String bookTitle;

    @NotEmpty(message = "선정 도서 저자를 입력해주세요.")
    @Size(max = 100, message = "저자 이름은 100자를 넘을 수 없습니다.")
    private String bookAuthor;

    @Size(max = 100, message = "장르 이름은 100자를 넘을 수 없습니다.")
    private String genre;

    @NotNull(message = "모임 시간을 입력해주세요.")
    @Future(message = "모임 시간은 현재 시간 이후로 설정해야 합니다.")
    private LocalDateTime meetingTime;

    // 주소 정규화
    @NotEmpty(message = "시/도를 입력해주세요.")
    @Size(max = 20, message = "시/도는 20자를 넘을 수 없습니다.")
    private String region;

    @NotEmpty(message = "시/군/구를 입력해주세요.")
    @Size(max = 30, message = "시/군/구는 30자를 넘을 수 없습니다.")
    private String city;

    @Size(max = 255, message = "상세 주소는 255자를 넘을 수 없습니다.")
    private String detailAddress;

    @NotNull(message = "최대 참여 인원을 입력해주세요.")
    @Min(value = 2, message = "최대 참여 인원은 최소 2명 이상이어야 합니다.")
    @Max(value = 10, message = "최대 참여 인원은 10명을 넘을 수 없습니다.")
    private int maxParticipants;

    /**
     * 이 DTO를 Meeting 엔티티로 변환하는 메서드
     * @param req MeetingCreateRequest DTO
     * @param host 호스트 사용자
     * @param imageUrl 업로드된 이미지 URL
     * @return Meeting 엔티티
     */
    public static Meeting toEntity(MeetingCreateRequest req, User host, String imageUrl) {
        return Meeting.builder()
                .host(host)
                .title(req.getTitle())
                .description(req.getDescription())
                .bookTitle(req.getBookTitle())
                .bookAuthor(req.getBookAuthor())
                .genre(req.getGenre())
                .meetingTime(req.getMeetingTime())
                .region(req.getRegion())
                .city(req.getCity())
                .detailAddress(req.getDetailAddress())
                .maxParticipants(req.getMaxParticipants())
                .imageUrl(imageUrl)
                .meetingStatus(MeetingStatus.RECRUITING)
                .build();
    }

}
