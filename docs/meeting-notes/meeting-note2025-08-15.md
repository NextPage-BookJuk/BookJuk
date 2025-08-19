# 📋 2025년 8월 16일 팀 회의록 - 북적북적 프로젝트

### 1. 개요

* 로그인/회원가입 UI 및 인증 스크립트, 리뷰(좋아요) API 등 프런트·백엔드 연동 개발 진행 상황 공유.
* 완료된 기능과 테스트 현황 확인, 후속 문서화·검증 범위 확정.

---

### 2. 주요 변경사항

#### 2.1 \[feat] 로그인/회원가입 UI 및 인증 스크립트 구현 / \[test] E2E 테스트 (#73)

* **주요 변경사항**

    * **Thymeleaf**를 이용한 로그인/회원가입 **UI** 구현
    * 페이지 렌더링을 위한 **routes 패키지 내 `PageController`** 구현
    * 프런트엔드 **인증 스크립트(`auth.js`)** 구현 및 공용 모듈화
    * **회원가입·로그인 End-to-End 테스트** 수행
    * **인증 모듈(`auth.js`) 사용 가이드 문서** 초안 작성
* **테스트**

    * 로컬 환경(MariaDB)에서 애플리케이션 실행 및 **로그인/회원가입 시나리오 검증** 완료
* **관련 이슈 번호**

    * \#21 (Thymeleaf 로그인/회원가입 UI)
    * \#63 (프런트 인증 스크립트 `auth.js`)
    * \#65 (routes `PageController` 렌더링)
    * \#71 (회원가입/로그인 E2E 테스트)
    * \#72 (`auth.js` 사용 가이드 문서)

---

#### 2.2 \[feat] review(좋아요) 기능 API Controller 구현, 테스트 완료 (#75)

* **개요**

    * review(좋아요) 기능 구현에 필요한 **`ReviewController`** 작성 및 **테스트 완료**
* **변경 사항**

    * `ReviewController` 클래스 생성
    * `ReviewService` 내부 좋아요 메서드 **입력 파라미터 변경**(요구 사항 정합성 반영)
    * `ReviewRequest` DTO에 **`@NotNull` 검증** 추가
* **테스트 방법/현황**

    * **Postman + JUnit**으로 시나리오 기반 테스트 수행
    * **인증 토큰 발급 사용자**: userId=5 / **더미 사용자**: userId=6
    * **모임 데이터**: 종료된 모임 id=7, 진행중 모임 id=4
    * 흐름: 회원가입 → 로그인 → 토큰 발급 확인 → 더미 모임 참여 데이터 생성(JUnit) → 토큰+참여정보로 비즈니스 로직 테스트 → **성공**

---

## ✅ 오늘의 주요 결정 사항

* **인증 UI/흐름 표준화**: 로그인/회원가입 화면은 Thymeleaf 기준으로 유지, 클라이언트 측 인증 로직은 `auth.js` 모듈 공용 사용.
* **문서화 강화**: `auth.js` 사용 가이드는 개발자 온보딩 문서에 포함하여 관리(버전 표기).
* **검증 일관성**: 리뷰 요청 DTO의 `@NotNull` 등 Bean Validation을 컨트롤러 단에서 우선 검증, 실패 시 표준 에러 응답 포맷으로 반환.
* **테스트 픽스처 표준화**: 인증 사용자/더미 사용자/모임(진행/종료) **테스트 데이터 셋**을 공통 픽스처로 정해 재사용.

---

### 4. 향후 계획

* `auth.js` 가이드 보완(토큰 저장 위치/만료 처리/재발급 전략, 보안 유의점) 및 샘플 코드 추가.
* 로그인/회원가입 UI의 **에러 메시지/필드 검증 UX** 개선.
* 리뷰 API에 대한 **예외 케이스**(중복 좋아요, 권한 부족, 종료 모임) 테스트 보강 및 문서화.
* GitHub Action 기반 **E2E 스모크 테스트** 워크플로우 초안 작성.

---

## 🧾 팀원별 오늘의 회고

> 아래 링크를 통해 각자의 회고 문서를 볼 수 있습니다.

* [강관주 - 2025-08-16 회고](https://github.com/Kanggwanju/project-docs/blob/main/meeting-notes)
* [김경민 - 2025-08-16 회고](https://github.com/minee0505/meetings/blob/main)
* [박현수 - 2025-08-16 회고](https://github.com/hsp64/memoir/blob/main/teamNextPage20250805)
* [신동준 - 2025-08-16 회고](https://github.com/sdj3959/my-retrospectives/tree/master/projects/202508BookJuk)
* [진도희 - 2025-08-16 회고](https://github.com/dohee-jin/project/blob/main/bookjuk/docs/meetings)
