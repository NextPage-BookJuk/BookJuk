package com.bookjuk.dto.meeting;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Arrays;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MeetingUpdateRequest {

    @NotBlank(message = "모임 제목은 필수입니다")
    @Size(max = 255, message = "모임 제목은 255자 이하여야 합니다")
    private String title;

    @Size(max = 1000, message = "모임 설명은 1000자 이하여야 합니다")
    private String description;

    @NotBlank(message = "책 제목은 필수입니다")
    @Size(max = 255, message = "책 제목은 255자 이하여야 합니다")
    private String bookTitle;

    @NotBlank(message = "저자명은 필수입니다")
    @Size(max = 100, message = "저자명은 100자 이하여야 합니다")
    private String bookAuthor;

    @NotBlank(message = "장르는 필수입니다")
    @Size(max = 100, message = "장르는 100자 이하여야 합니다")
    private String genre;

    @NotNull(message = "최대 참여자 수는 필수입니다")
    @Min(value = 2, message = "최대 참여자 수는 2명 이상이어야 합니다")
    @Max(value = 20, message = "최대 참여자 수는 20명 이하여야 합니다")
    private Integer maxParticipants;

    @NotNull(message = "모임 시간은 필수입니다")
    private LocalDateTime meetingTime;

    // 테이블 구조에 맞는 개별 주소 필드들
    @Size(max = 20, message = "지역은 20자 이하여야 합니다")
    private String region;

    @Size(max = 30, message = "도시는 30자 이하여야 합니다")
    private String city;

    @Size(max = 30, message = "구/군은 30자 이하여야 합니다")
    private String district;

    @Size(max = 255, message = "상세주소는 255자 이하여야 합니다")
    private String detailAddress;

    // 프론트엔드 호환성을 위한 location 필드
    private String location;

    /*
     * location 필드를 파싱해서 새로운 객체를 생성하는 메서드 (불변성 유지)
     */
    public MeetingUpdateRequest withParsedLocation() {
        // location 필드가 있으면 우선적으로 파싱
        if (location != null && !location.trim().isEmpty()) {
            String[] parts = location.trim().split("\\s+"); // 공백으로 분할

            String parsedRegion = parts.length >= 1 ? parts[0] : this.region;
            String parsedCity = parts.length >= 2 ? parts[1] : this.city;
            String parsedDistrict = parts.length >= 3 ? parts[2] : this.district;

            String parsedDetailAddress;
            if (parts.length >= 4) {
                // 4번째 이후의 모든 부분을 상세주소로 결합
                parsedDetailAddress = String.join(" ", Arrays.copyOfRange(parts, 3, parts.length));
            } else {
                // location에 상세주소가 없으면 기존 값 유지
                parsedDetailAddress = this.detailAddress;
            }

            return MeetingUpdateRequest.builder()
                    .title(this.title)
                    .description(this.description)
                    .bookTitle(this.bookTitle)
                    .bookAuthor(this.bookAuthor)
                    .genre(this.genre)
                    .maxParticipants(this.maxParticipants)
                    .meetingTime(this.meetingTime)
                    .region(parsedRegion)
                    .city(parsedCity)
                    .district(parsedDistrict)
                    .detailAddress(parsedDetailAddress)
                    .location(this.location)
                    .build();
        }

        return this;
    }

    /**
     * 각 주소 필드가 설정되어 있는지 확인하는 메서드
     */
    public boolean hasLocationData() {
        return (region != null && !region.isEmpty()) ||
                (city != null && !city.isEmpty()) ||
                (district != null && !district.isEmpty()) ||
                (detailAddress != null && !detailAddress.isEmpty());
    }
}