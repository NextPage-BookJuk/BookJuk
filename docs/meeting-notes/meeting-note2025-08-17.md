# 📋 2025년 8월 17일 팀 회의록 - 북적북적 프로젝트

### 1. 개요

* 모임 **생성 플로우의 인증/보안 강화**, **이미지 업로드 정책**, **생성 후 라우팅/상세 조회**, **모임 목록 페이지 UI** 구현 현황 공유.
* 완료 기능 점검 및 후속 테스트/문서화 범위 확정.

---

### 2. 주요 변경사항

#### 2.1 feat: 로그인 필요 메시지 및 이미지 업로드 제한사항 추가, 모임 생성 시 모임 상세 조회 기능 구현 (#77)

* **변경 사항**

  * **\[Auth]** 비로그인 사용자가 모임 생성 페이지 접근 시 **`/auth`로 리다이렉트**
  * **\[Image]** 모임 생성 시 **이미지 1장만 허용**, 두 번째 업로드 시 **첫 번째 이미지를 대체**
  * **\[Routing]** 생성 성공 시 **`/meetings/{id}` 상세 페이지로 이동**
  * **\[Page]** 상세 페이지에서 **`/api/meetings/{id}`** 호출로 데이터 조회 후 렌더
  * **\[Security]** 임시로 공개/인증 필요 등 **접근 정책을 명시**
* **테스트 방법**

  * Postman으로 회원가입→로그인→**토큰 확보 후 모임 생성 성공** 확인
  * 이미지 업로드: 첫 업로드 → 두 번째 업로드 시 **첫 이미지 제거·대체** 확인
  * 상세 페이지에서 **서버 저장 이미지 URL 렌더링** 확인
* **관련 이슈**

  * Resolves **#76** (로그인 필요 메시지/업로드 제한/상세 조회 동시 반영)

---

#### 2.2 Feat: 모임 생성 기능 JWT 인증 및 보안 강화 (#66)

* **설명**

  * 모임 생성에 **JWT 인증 적용** 및 보안 강화. **로그인 사용자만 생성 가능**하도록 개선
* **작업 범위**

  * 비로그인 상태로 생성 페이지 접근 → **로그인 페이지로 리다이렉트**
  * 로그인 상태에서 생성 → **정상 작동**
  * **잘못된 이미지 파일** 업로드 → **적절한 에러 메시지**
  * **파일 크기 초과** → 에러 메시지 및 업로드 차단
  * **필수 필드 누락** → **클라이언트 검증 및 에러 표시**
* **참고 파일**

  * `src/main/java/com/bookjuk/controller/MeetingController.java`
  * `src/main/java/com/bookjuk/service/MeetingService.java`
  * `src/main/resources/static/js/create-meeting.js`
  * `src/main/java/com/bookjuk/repository/participant/MeetingParticipantRepository.java`

---

#### 2.3 feat: #61 모임 목록 페이지 UI 구현 (#78)

* **개요**

  * 디스코드 html 파일 중 \*\*`main-page.html`\*\*을 모임 목록 페이지로 사용하도록 **`main-page.html / main-page.css / main-page.js`** 작성
* **변경 사항**

  * **6개/페이지 카드 형태**로 목록 표시, **필터/정렬 조건**에 따라 동작
  * 방장 프로필 이미지가 없으면 **`/images/defaultProfile.png`** 적용
  * 각 카드에 **`data-id`에 모임 id** 삽입, `main-page.js`의 \*\*`buildDetailUrl`\*\*로 상세로 이동

    * 예) 8번 클릭 시 → `http://localhost:9000/meetings/8`
  * **ApiResponse 미사용** 결정: **\[#30] GET /meetings** 응답을 **그대로 사용**
* **테스트 현황**

  * 필터/정렬/페이징 수동 테스트, 상세 이동 URL 동작 확인

---

## ✅ 오늘의 주요 결정 사항

* **모임 생성은 로그인 필수**, 비로그인 접근은 `/auth` 리다이렉트(+안내 메시지)
* **이미지 1장 정책** 확정(두 번째 업로드 시 대체)
* 생성 성공 후 \*\*상세 페이지로 이동하고, 상세는 `/api/meetings/{id}`\*\*로 데이터 조회 후 렌더
* 모임 목록은 **6개/페이지 카드 UI**, 방장 이미지 **기본값** 제공
* 목록 API는 **\[#30] GET /meetings 원형 유지**(ApiResponse 래핑 없음)
* 임시 접근 정책(공개/인증 필요) **문서에 명시**

---

### 4. 향후 계획

* **E2E 테스트 보강**: 리다이렉트, 토큰 만료/부재, 이미지 대체, 필수 필드 누락 케이스 추가
* **서버단 검증 강화**: 이미지 **MIME/용량** 2중 검증, 파일명 정상화, 위험 확장자 차단
* **스토리지 전환 검토**: 로컬 → **S3 전환**(서명 URL, CORS, 만료 정책) 설계 초안
* **UX 개선**: 목록 **스켈레톤 로딩/에러 메시지** 일관화, 상세 페이지 404/401 처리
* **정책 문서화**: 접근 정책/에러 코드 → `error_handling.md`, `security.md` 반영

---

## 🧾 팀원별 오늘의 회고

> 아래 링크를 통해 각자의 회고 문서를 볼 수 있습니다.

* [강관주 - 2025-08-17 회고](https://github.com/Kanggwanju/project-docs/blob/main/meeting-notes)
* [김경민 - 2025-08-17 회고](https://github.com/minee0505/meetings/blob/main)
* [박현수 - 2025-08-17 회고](https://github.com/hsp64/memoir/blob/main/teamNextPage20250805)
* [신동준 - 2025-08-17 회고](https://github.com/sdj3959/my-retrospectives/tree/master/projects/202508BookJuk)
* [진도희 - 2025-08-17 회고](https://github.com/dohee-jin/project/blob/main/bookjuk/docs/meetings)
