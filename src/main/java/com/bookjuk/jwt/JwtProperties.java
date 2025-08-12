package com.bookjuk.jwt;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * JWT 설정을 application.yml에서 읽어오는 클래스
 */
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "jwt") // "jwt"로 시작하는 설정을 매핑
public class JwtProperties {

    private String secret;
    private Long expiration;
}