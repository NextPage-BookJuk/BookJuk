package com.bookjuk.service;

import com.bookjuk.domain.meeting.Meeting;
import com.bookjuk.domain.participant.MeetingParticipant;
import com.bookjuk.domain.participant.ParticipantRole;
import com.bookjuk.domain.participant.ParticipantStatus;
import com.bookjuk.domain.user.User;
import com.bookjuk.dto.meeting.MeetingCreateRequest;
import com.bookjuk.dto.meeting.MeetingDetailResponse;
import com.bookjuk.dto.meeting.request.MeetingListItemDto;
import com.bookjuk.dto.meeting.response.MeetingListResponse;
import com.bookjuk.repository.meeting.MeetingRepository;
import com.bookjuk.repository.meeting.custom.MeetingRepositoryCustom;
import com.bookjuk.repository.participant.MeetingParticipantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final MeetingParticipantRepository meetingParticipantRepository;
    private final FileService fileService;

    public MeetingDetailResponse createMeeting(MeetingCreateRequest request, User host, MultipartFile imageFile) {
        try {
            // 1. 이미지 파일 업로드 처리
            String imageUrl = null;
            if (imageFile != null && !imageFile.isEmpty()) {
                imageUrl = fileService.uploadFile(imageFile);
                log.info("이미지 업로드 성공: {}", imageUrl);
            }

            // 2. Meeting 엔티티 생성 및 저장
            Meeting meeting = MeetingCreateRequest.toEntity(request, host, imageUrl);
            Meeting savedMeeting = meetingRepository.save(meeting);
            log.info("모임 생성 완료: meetingId={}, title={}", savedMeeting.getId(), savedMeeting.getTitle());

            // 3. 주최자를 참여자로 자동 등록 (HOST 역할, APPROVED 상태)
            MeetingParticipant hostParticipant = MeetingParticipant.builder()
                    .meeting(savedMeeting)
                    .participant(host)
                    .role(ParticipantRole.HOST)
                    .status(ParticipantStatus.APPROVED)
                    .build();
            meetingParticipantRepository.save(hostParticipant);
            log.info("주최자 참여자 등록 완료: meetingId={}, hostId={}", savedMeeting.getId(), host.getId());

            // 4. 현재 참여자 수 계산 (주최자 포함 1명)
            int currentParticipants = 1;

            // 5. 응답 DTO 생성 및 반환
            return MeetingDetailResponse.from(savedMeeting, currentParticipants);

        } catch (IOException e) {
            log.error("이미지 업로드 실패", e);
            throw new RuntimeException("이미지 업로드에 실패했습니다.", e);
        } catch (Exception e) {
            log.error("모임 생성 실패", e);
            throw new RuntimeException("모임 생성에 실패했습니다.", e);
        }
    }


    /**
     * 모임 목록 조회 서비스 메서드
     * @param condition 동적 쿼리용 검색 조건 (지역, 장르, 상태, 정렬 등)
     * @param pageable  페이지 번호, 페이지 크기, 정렬 조건을 담은 페이징 객체
     * @return 모임 목록 + 페이징 정보가 담긴 MeetingListResponse
     */
    public MeetingListResponse getMeetingList(
            MeetingRepositoryCustom.MeetingSearchCondition condition,
            Pageable pageable
    ) {
        log.info("모임 목록 조회 - 페이징: {}", pageable);

        // 검색 조건과 페이징 정보로 모임 목록을 조회 (Repository 계층)
        // - QueryDSL로 동적 조건(where, orderBy 등) 적용
        Page<Meeting> meetingPage = meetingRepository.getMeetingList(condition, pageable);

        // Meeting 엔티티 리스트(+ 참가자 수)를 MeetingListItemDto 리스트로 변환
        List<MeetingListItemDto> items = meetingPage.getContent().stream()
                .map(m -> {
                    int curr = meetingParticipantRepository.countByMeetingId(m.getId());
                    return MeetingListItemDto.from(m, curr);
                })
                .toList();

        return MeetingListResponse.<MeetingListItemDto>builder()
                .content(items)
                .page(pageable.getPageNumber())
                .size(pageable.getPageSize())
                .totalElements(meetingPage.getTotalElements())
                .build();
    }

}
