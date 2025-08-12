package com.bookjuk.service;

import com.bookjuk.domain.meeting.Meeting;
import com.bookjuk.domain.participant.MeetingParticipant;
import com.bookjuk.domain.participant.ParticipantRole;
import com.bookjuk.domain.participant.ParticipantStatus;
import com.bookjuk.domain.user.User;
import com.bookjuk.dto.meeting.MeetingCreateRequest;
import com.bookjuk.dto.meeting.MeetingDetailResponse;
import com.bookjuk.repository.meeting.MeetingRepository;
import com.bookjuk.repository.participant.MeetingParticipantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

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


}
