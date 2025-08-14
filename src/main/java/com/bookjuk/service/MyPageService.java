package com.bookjuk.service;

import com.bookjuk.domain.participant.MeetingParticipant;
import com.bookjuk.domain.user.User;
import com.bookjuk.dto.mypage.MeetingInfoDto;
import com.bookjuk.dto.mypage.MyPageResponse;
import com.bookjuk.dto.mypage.StaticsInfoDto;
import com.bookjuk.dto.mypage.UserInfoDto;
import com.bookjuk.exception.CustomException;
import com.bookjuk.exception.ErrorCode;
import com.bookjuk.repository.meeting.MeetingRepository;
import com.bookjuk.repository.participant.MeetingParticipantRepository;
import com.bookjuk.repository.review.MeetingReviewRepository;
import com.bookjuk.repository.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
@Transactional
public class MyPageService {

    // 의존 객체 주입
    private final UserRepository userRepository;
    private final MeetingRepository meetingRepository;
    private final MeetingReviewRepository meetingReviewRepository;
    private final MeetingParticipantRepository meetingParticipantRepository;

    /**
     * 마이페이지 진입 정보 조회(디폴트) 로직입니다.
     * @param email - 로그인한 유저가 제시한 토큰에서 파싱한 이메일 정보
     *
     */
    public MyPageResponse getMyPage(String email) {

        // 1. 사용자 이메일로 유저 정보 가져오기
        User user = getUserByEmail(email);

        // 조회된 유저 정보를 마이페이지 응답에 필요한 dto 로 변경
        UserInfoDto profile = UserInfoDto.from(user);

        // 2. 유저가 참여한 미팅 정보 가져오기
        // meeting_participant 에 유저 id로 참여 미팅 id를 리스트로 반환
        Long userId = user.getId();
        List<MeetingInfoDto> meetings = getMeetingsByUserId(userId);

        // 3. 유저의 모임 참여, 좋아요 통계 정보를 가져오기
        int meetingCount = meetings.size();
        StaticsInfoDto stats = getStatsByUserId(userId, meetingCount);

        return MyPageResponse.of(profile, stats, meetings);

    }

    /**
     * 사용자의 email 정보로 user 객체를 가져올 때 사용하는 메소드입니다.
     * @param email - 로그인한 유저가 제시한 토큰에서 파싱한 이메일 정보
     * @return User - 일치하는 사용자 정보가 있으면 해당 User 객체를 반환, 없으면 커스텀 에러를 반환
     */
    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(
                () -> new CustomException(ErrorCode.USER_NOT_FOUND)
        );
    }

    /**
     * 사용자의 id 정보로 참여한 미팅 정보를 가져오고 필요한 정보만 반환하는 메소드입니다.
     * @param id - 이메일 정보로 찾은 유저의 id
     * @return - 유저의 id 로 참여한 미팅 정보를 리스트로 받은 후 필요한 정보만 dto 로 매핑한 리스트
     */
    private List<MeetingInfoDto> getMeetingsByUserId(Long id) {
        // 사용자 id 정보로 참여한 미팅 정보 반환
        List<MeetingParticipant> meetingParticipants =
                meetingParticipantRepository.findMeetingsByUserId(id);

        // 반환된 리스트를 for 돌려서 dto 로 매핑
        return meetingParticipants
                .stream()
                .map(meeting -> MeetingInfoDto.from(meeting))
                .collect(Collectors.toList());

    }

    /**
     * 사용자의 id 정보로 받은 좋아요 개수를 조회하고 참여한 리스트 개수와 함께 필요한 정보만 반환하는 메소드입니다.
     * @param id - 이메일 정보로 찾은 유저 id
     * @param count - 참여 리스트의 size
     * @return - 유저 id 정보롤 찾은 좋아요 개수와 참여 리스트의 개수를 받아 필요한 정보만 매핑한 dto
     */
    private StaticsInfoDto getStatsByUserId(Long id, int count) {
        Long reviewCount = meetingReviewRepository.countReviewByUserId(id);
        return StaticsInfoDto.of(reviewCount, count);
    }
}
