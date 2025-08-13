# 📋 2025년 8월 10일 팀 회의록 - 북적북적(BookJuk)

> 테스트 환경 DB 자동연결 방지 설정, 템플릿/정적자원 분리, 테스트 페이지 점검, DDL 최종 확인

---

## 🧭 오늘 논의한 주요 내용

- 테스트 환경에서 DB 자동 연결 방지:
  - `@SpringBootApplication(exclude = { DataSourceAutoConfiguration.class, HibernateJpaAutoConfiguration.class })` 적용 검토 및 영향 범위 확인
- 프론트 리소스 구조 개선:
  - `templates`에 단일 HTML로 묶여 있던 페이지를 `static/js`, `static/css`로 파일 분리 및 경로 연결 방식 점검
- 테스트 페이지 및 커뮤니케이션 게시판 확인:
  - `PageTestController` 동작 확인
  - 호스트/참여자 전용 소통 게시판 분리 정책 및 라우팅/권한 재설계 필요사항 정리
- 스키마 마무리:
  - DDL 최종 검토 및 오타 수정 내역 확정
- yml ` thymeleaf` 설정 추가 및 공유 완료

---

## ✅ 오늘의 결정 사항 요약

| 항목 | 결정 내용                                                                                                                                           |
|---|-------------------------------------------------------------------------------------------------------------------------------------------------|
| 테스트 환경 DB 연결 | 테스트 프로파일에서 `DataSourceAutoConfiguration`, `HibernateJpaAutoConfiguration` 제외 적용. 통합테스트에서는 `@AutoConfigureTestDatabase` 또는 Testcontainers 도입 후보로 유지 |
| 리소스 분리 | 템플릿의 inline JS/CSS를 `static/js`, `static/css`로 분리. Thymeleaf `th:src`, `th:href` 및 정적 경로(`/js/**`, `/css/**`) 표준화                               |
| 게시판 정책 | 호스트 전용 게시판과 참여자 전용 게시판을 URL/권한으로 분리. 메뉴/네비게이션, 접근 제어(Interceptor/Security) 설계 반영 예정                                                             |
| DDL | 컬럼/제약명 오타 수정 반영                                                                                                                                 |

---

## ⏭️ 내일 작업 계획

* 각 역할별 백앤드 개발 및 각 페이지 수정
* DDL 버전 관리

---

## 🧾 팀원별 오늘의 회고

> 아래 링크를 통해 각자의 회고 문서를 볼 수 있습니다.

* [강관주 - 2025-08-10 회고](https://github.com/Kanggwanju/project-docs/blob/main/meeting-notes)
* [김경민 - 2025-08-10 회고](https://github.com/minee0505/meetings/blob/main)
* [박현수 - 2025-08-10 회고](https://github.com/hsp64/memoir/blob/main/teamNextPage20250805)
* [신동준 - 2025-08-10 회고](https://github.com/sdj3959/my-retrospectives/tree/master/projects/202508BookJuk)
* [진도희 - 2025-08-10 회고](https://github.com/dohee-jin/project/blob/main/bookjuk/docs/meetings)
