package com.bookjuk.exception;

import com.bookjuk.support.DummyController;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.springframework.test.web.servlet.ResultActions;

import java.util.Map;

@WebMvcTest(controllers = DummyController.class)
@Import(GlobalExceptionHandler.class) // 전역 예외 처리기 등록
class GlobalExceptionHandlerTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @Test
    @DisplayName("CustomException의 DUPLICATE_EMAIL 응답 포맷을 검증한다.")
    void customExceptionTest() throws Exception {
        // given
        final String url = "/test/custom-ex"; // DummyController에서 CustomException 던지는 엔드포인트

        // when + then
        mockMvc.perform(get(url))
                // then: 상태코드
                .andExpect(status().isConflict())   // 409
                // then: 에러 바디 스키마 & 값
                .andExpect(jsonPath("$.error").value("DUPLICATE_EMAIL"))
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.detail").value("이미 사용 중인 이메일입니다."))
                .andExpect(jsonPath("$.path").value("/test/custom-ex"))
                .andExpect(jsonPath("$.timestamp").exists());// 값 비교 X, 존재만 확인
    }

    @Test
    @DisplayName("유효성 검증 실패가 되면 VALIDATION_ERROR & validationErrors를 반환한다.")
    void validationFailTest() throws Exception {
        // given
        // 빈 바디 전송 → name 누락으로 @NotBlank 실패 가정
        String body = objectMapper.writeValueAsString(Map.of());

        // when + then
        mockMvc.perform(
                        post("/test/validate")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body)
                )
                // then
                .andExpect(status().isBadRequest())               // 400
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.validationErrors").isArray())
                .andExpect(jsonPath("$.validationErrors[0].field").value("name"))
                .andExpect(jsonPath("$.validationErrors[0].message").value("name은 필수입니다."))
                // ✔ ResultMatcher에 or()가 없으므로 조건부 검증 제거: 존재만 체크
                .andExpect(jsonPath("$.validationErrors[0].rejectedValue").value(nullValue()));
    }

    @Test
    @DisplayName("유효성 검증이 성공하면 200 OK와 'OK' 바디를 반환한다.")
    void validationSuccessTest() throws Exception {
        // given
        String body = objectMapper.writeValueAsString(Map.of("name", "abc"));

        // when + then
        ResultActions ok = mockMvc.perform(
                        post("/test/validate")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body)
                )
                // then
                .andExpect(status().isOk())
                .andExpect(content().string("OK"));
    }
}
