package com.bookjuk.service;

import com.bookjuk.domain.user.User;
import com.bookjuk.dto.mypage.UserInfoDto;
import com.bookjuk.exception.CustomException;
import com.bookjuk.repository.meeting.MeetingRepository;
import com.bookjuk.repository.participant.MeetingParticipantRepository;
import com.bookjuk.repository.review.MeetingReviewRepository;
import com.bookjuk.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class MyPageService {

    // 의존 객체 주입
    private final UserRepository userRepository;
    private final MeetingRepository meetingRepository;
    private final MeetingReviewRepository meetingReviewRepository;
    private final MeetingParticipantRepository meetingParticipantRepository;

    /**
     * 마이페이지 진입 정보 조회(디폴트) 로직입니다.
     * @param //username - 로그인한 유저가 제시한 토큰에서 파싱한 이름
     * 일단 테스트 하기 위해 받는 파라미터는 id로 설정 추후 username 파싱 완료
     * 사용자 정보조회 구현이 완료되면 username 으로 변경할 예정
     */
    public void viewMyPage(String username) {

        // 1. 유저네임으로 유저 정보 가져오기
        User user = userRepository.findByUsername(username).orElseThrow(
                () -> new CustomException()
        );

        // 2. 조회된 유저 정보를 마이페이지 응답에 필요한 dto로 변경
        UserInfoDto userInfoDto = UserInfoDto.from(user);

        // 3. 유저가 참여한 미팅 정보 가져오기
        // meeting_participant 에 유저 id로 참여 미팅 id를 리스트로 반환
        Long userId = user.getId();
        meetingParticipantRepository.findMeetingsByUserId(userId);

        // 반환된 리스트를 for 돌려서 dto로 매핑
        // 매핑된 dto를 다시 리스트로 합치기

        // 4. 유저의 모임 참여, 좋아요 통계 정보를 가져오기




    }
}
