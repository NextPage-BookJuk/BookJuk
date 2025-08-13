# 📋 2025년 8월 11일 팀 회의록 - 북적북적 프로젝트

> 백엔드 개발 착수 및 DB 구조 변경, API 명세 반영 회의

---

## 🧭 오늘 논의한 주요 내용

* **백엔드 개발 시작**

  * DTO 정의 작업 시작
  * Entity 클래스 정의 시작

* **DDL 구조 변경**

  * `location` 컬럼 삭제
  * `region`, `city`, `detail_address` 컬럼으로 분리
  * 모든 **UNIQUE 인덱스** 및 **외래 키(FK)** 제약 조건 제거

* **API 명세서 수정**

  * 변경된 DB 스키마(`region`, `city`, `detail_address`) 반영
  * FK/UNIQUE 제약 제거에 따른 요청/응답 구조 및 설명 업데이트

---

## 📂 오늘 산출물

1. **Entity & DTO 초안** (`User`, `Meeting` 등 주요 도메인 클래스)
2. **수정된 DDL 파일** (컬럼 구조 변경, 제약 조건 제거)
3. **API 명세서 업데이트본** (DB 변경 사항 반영)

---

## 📌 결정 사항

* FK 및 UNIQUE 제약은 DB 레벨에서 제거하고, 애플리케이션 레벨에서 검증 처리
* 주소 정보는 `region`, `city`, `detail_address` 3개 컬럼으로 관리
* 추후 백엔드 개발은 DTO → Entity → Repository → Service → Controller 순으로 진행

---

## 🗒️ 다음 작업 계획

* Repository, Service 레이어 구현 시작
* API 명세서 최종 검토 및 문서화
* DDL 변경에 따른 테스트 데이터 생성

---

## 🧾 팀원별 오늘의 회고

> 아래 링크를 통해 각자의 회고 문서를 볼 수 있습니다.

* [강관주 - 2025-08-11 회고](https://github.com/Kanggwanju/project-docs/blob/main/meeting-notes)
* [김경민 - 2025-08-11 회고](https://github.com/minee0505/meetings/blob/main)
* [박현수 - 2025-08-11 회고](https://github.com/hsp64/memoir/blob/main/teamNextPage20250805)
* [신동준 - 2025-08-11 회고](https://github.com/sdj3959/my-retrospectives/tree/master/projects/202508BookJuk)
* [진도희 - 2025-08-11 회고](https://github.com/dohee-jin/project/blob/main/bookjuk/docs/meetings)

