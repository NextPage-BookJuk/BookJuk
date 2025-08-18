package com.bookjuk.service;

import com.bookjuk.domain.meeting.Meeting;
import com.bookjuk.domain.meeting.MeetingStatus;
import com.bookjuk.domain.participant.MeetingParticipant;
import com.bookjuk.domain.participant.ParticipantRole;
import com.bookjuk.domain.participant.ParticipantStatus;
import com.bookjuk.domain.user.User;
import com.bookjuk.dto.meeting.MeetingCreateRequest;
import com.bookjuk.dto.meeting.MeetingDetailResponse;
import com.bookjuk.exception.CustomException;
import com.bookjuk.exception.ErrorCode;
import com.bookjuk.dto.meeting.request.MeetingListItemDto;
import com.bookjuk.dto.meeting.response.MeetingListResponse;
import com.bookjuk.repository.meeting.MeetingRepository;
import com.bookjuk.repository.meeting.custom.MeetingRepositoryCustom;
import com.bookjuk.repository.participant.MeetingParticipantRepository;
import com.bookjuk.repository.review.MeetingReviewRepository;
import com.bookjuk.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class MeetingService {

    private final UserRepository userRepository;
    private final MeetingRepository meetingRepository;
    private final MeetingParticipantRepository meetingParticipantRepository;
    private final FileService fileService;
    private final MeetingReviewRepository meetingReviewRepository;

    /**
     * 모임을 생성합니다.
     * @param request 모임 생성 요청 데이터
     * @param host 모임 주최자
     * @param imageFile 모임 대표 이미지 파일 (선택적)
     * @return 생성된 모임의 상세 정보
     * @throws CustomException 모임 생성 실패 시
     */
    public MeetingDetailResponse createMeeting(MeetingCreateRequest request, User host, MultipartFile imageFile) {
        // 입력값 검증
        validateCreateMeetingRequest(request, host);

        try {
            // 1. 이미지 파일 업로드 처리
            String imageUrl = null;
            if (imageFile != null && !imageFile.isEmpty()) {
                try {
                    imageUrl = fileService.uploadFile(imageFile);
                    log.info("이미지 업로드 성공: {}", imageUrl);
                } catch (IOException e) {
                    log.error("이미지 업로드 실패: {}", e.getMessage());
                    throw new CustomException(ErrorCode.FILE_SIZE_EXCEEDED);
                }
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

        } catch (CustomException e) {
            // CustomException은 그대로 재던지기
            throw e;
        } catch (Exception e) {
            log.error("모임 생성 중 예상치 못한 오류 발생", e);
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 모임 생성 요청 데이터를 검증합니다.
     * @param request 모임 생성 요청 데이터
     * @param host 모임 주최자
     * @throws CustomException 검증 실패 시
     */
    private void validateCreateMeetingRequest(MeetingCreateRequest request, User host) {
        if (request == null) {
            throw new CustomException(ErrorCode.INVALID_INPUT);
        }

        if (host == null) {
            throw new CustomException(ErrorCode.USER_NOT_FOUND);
        }

        // 제목 검증
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new CustomException(ErrorCode.INVALID_INPUT);
        }

        // 도서 제목 검증
        if (request.getBookTitle() == null || request.getBookTitle().trim().isEmpty()) {
            throw new CustomException(ErrorCode.INVALID_INPUT);
        }

        // 최대 참여자 수 검증
        if (request.getMaxParticipants() <= 0) {
            throw new CustomException(ErrorCode.INVALID_INPUT);
        }

        log.debug("모임 생성 요청 검증 완료: title={}, host={}", request.getTitle(), host.getEmail());
    }


    /**
     * 모임 상세 정보를 조회합니다.
     *
     * @param meetingId 모임 ID
     * @return 모임 상세 정보
     * @throws CustomException 모임을 찾을 수 없는 경우
     */
    public MeetingDetailResponse getMeetingDetail(Long meetingId) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new CustomException(ErrorCode.MEETING_NOT_FOUND));

        // 현재 참가자 수 계산 (APPROVED 상태인 참가자만)
        Integer currentParticipants = meetingParticipantRepository
                .countByMeeting_IdAndStatus(meetingId, ParticipantStatus.APPROVED);

        // 호스트 관련 통계 조회 (실제로는 User 엔티티에서 가져와야 함)
        // 임시로 0으로 설정, 추후 User 서비스와 연동 필요
        Integer hostLikesCount = 0;
        Integer hostedMeetingsCount = (int) meetingRepository.countByHost_Id(meeting.getHost().getId());

        return MeetingDetailResponse.from(meeting, currentParticipants);
    }

    /**
     * 특정 모임의 참가자 목록을 조회합니다.
     *
     * @param meetingId 모임 ID
     * @param status 참가자 상태 필터 (nullable)
     * @return 참가자 목록
     */
    public List<com.bookjuk.dto.participant.ParticipantResponse> getParticipants(Long meetingId, String status) {
        List<MeetingParticipant> participants;

        if (status != null && !status.isEmpty()) {
            try {
                ParticipantStatus participantStatus = ParticipantStatus.valueOf(status.toUpperCase());
                participants = meetingParticipantRepository
                        .findByMeeting_IdAndStatus(meetingId, participantStatus);
            } catch (IllegalArgumentException e) {
                throw new CustomException(ErrorCode.INVALID_INPUT);
            }
        } else {
            // 상태 필터가 없으면 APPROVED와 HOST만 조회 (일반적인 참가자 목록)
            participants = meetingParticipantRepository
                    .findByMeeting_IdAndStatusIn(meetingId,
                            Arrays.asList(ParticipantStatus.APPROVED, ParticipantStatus.PENDING));
        }

        return participants.stream()
                .map(com.bookjuk.dto.participant.ParticipantResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 모임에 참가 신청을 처리합니다.
     *
     * @param meetingId 모임 ID
     * @param userId 신청자 ID
     * @throws CustomException 이미 신청한 경우, 모집 완료된 경우 등
     */
    @Transactional
    public void applyToMeeting(Long meetingId, Long userId) {
        // 모임 존재 확인
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new CustomException(ErrorCode.MEETING_NOT_FOUND));

        // 사용자 존재 확인
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        // 이미 신청했는지 확인
        boolean alreadyApplied = meetingParticipantRepository
                .existsByMeeting_IdAndParticipant_Id(meetingId, userId);
        if (alreadyApplied) {
            throw new CustomException(ErrorCode.ALREADY_APPLIED);
        }

        // 모집 상태 확인
        if (meeting.getMeetingStatus() != MeetingStatus.RECRUITING) {
            throw new CustomException(ErrorCode.MEETING_BOARD_MISMATCH);
        }

        // 참가자 수 확인
        Integer currentParticipants = meetingParticipantRepository
                .countByMeeting_IdAndStatus(meetingId, ParticipantStatus.APPROVED);
        if (currentParticipants >= meeting.getMaxParticipants()) {
            throw new CustomException(ErrorCode.MEETING_FULL);
        }

        // 참가신청 생성
        MeetingParticipant participant = MeetingParticipant.builder()
                .meeting(meeting)
                .participant(user)
                .role(ParticipantRole.PARTICIPANT)
                .status(ParticipantStatus.PENDING)
                .build();

        meetingParticipantRepository.save(participant);
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
                    Long countHostReview = meetingReviewRepository.countReviewByUserId(m.getHost().getId());
                    return MeetingListItemDto.from(m, curr, countHostReview);
                })
                .toList();

        return MeetingListResponse.builder()
                .content(items)
                .page(pageable.getPageNumber())
                .size(pageable.getPageSize())
                .totalElements(meetingPage.getTotalElements())
                .build();
    }

}
