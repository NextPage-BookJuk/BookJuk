package com.bookjuk.controller;

import com.bookjuk.dto.board.request.ParticipantDecisionRequest;
import com.bookjuk.dto.board.response.ParticipantDecisionResponse;
import com.bookjuk.service.ParticipantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

/**
 * 모임 참가자 관리 REST API 컨트롤러
 *
 * 방장 승인/거절 기능 제공
 */
@Slf4j
@Controller
@RequestMapping("/api/meetings/{meetingId}/participants")
@RequiredArgsConstructor
public class ParticipantController {

    private final ParticipantService participantService;

    /**
     * 방장이 특정 사용자의 참가 신청을 승인 또는 거절한다.
     *
     * @param meetingId  모임 ID
     * @param userId     승인/거절 대상 사용자 ID
     * @param request    승인/거절 요청(Action: APPROVE | REJECT)
     * @param requesterId JWT에서 추출한 호출자 ID(방장)
     * @return 처리 결과(최종 상태 포함) (200 OK)
     * @throws com.bookjuk.exception.CustomException 방장 아님(403), 신청건 없음(404), 잘못된 상태 전이(400)
     */
    @PatchMapping("/{userId}")
    @ResponseBody
    public ResponseEntity<ParticipantDecisionResponse> decide(
            @PathVariable Long meetingId,
            @PathVariable Long userId,
            @Valid @RequestBody ParticipantDecisionRequest request,
            @RequestAttribute("userId") Long requesterId
    ) {
        log.info("참가자 승인/거절 요청 - meetingId: {}, targetUserId: {}, requesterId: {}, action: {}",
                meetingId, userId, requesterId, request.getAction());

        ParticipantDecisionResponse resp =
                participantService.decideParticipant(meetingId, userId, request, requesterId);

        log.info("참가자 승인/거절 완료 - meetingId: {}, targetUserId: {}, status: {}",
                meetingId, userId, resp.getStatus());

        return ResponseEntity.ok(resp);
    }
}
