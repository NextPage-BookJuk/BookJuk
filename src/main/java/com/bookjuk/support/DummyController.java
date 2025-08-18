package com.bookjuk.support;

import com.bookjuk.exception.CustomException;
import com.bookjuk.exception.ErrorCode;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/test")
public class DummyController {

    @GetMapping("/custom-ex")
    public String throwCustom() {
        // 임의의 에러코드 사용: 프로젝트의 ErrorCode 중 하나로 바꿔주세요
        throw new CustomException(ErrorCode.DUPLICATE_EMAIL);
    }

    @PostMapping("/validate")
    @ResponseStatus(HttpStatus.OK)
    public String validate(@Valid @RequestBody CreateDto dto) {
        return "OK";
    }

    public record CreateDto(
            @NotBlank(message = "name은 필수입니다.")
            String name
    ) {}
}
