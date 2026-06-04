# 17 · 인트로 쇼케이스 도메인 문서 갱신

Status: done

## Parent

`.scratch/parrot-mbti/issues/06-intro-page-carousel.md`

## What to build

인트로 쇼케이스(활성 유형 카드 + 중앙 고정 자동전환 peek 캐러셀) 도입에 따른 **도메인
문서를 갱신**한다.

- `CONTEXT.md`: 인트로 surface 설명의 "auto-advancing type carousel / peek-row" 용어를
  **"활성 유형 카드(3:2) + 중앙 고정 자동전환 peek 캐러셀(탭 가능·무한루프)"** 로 명확화한다.
- `docs/adr/0005-intro-active-type-showcase.md` 신규 — 결정·대안·근거·접근성을 기록한다.
    - 결정: 중앙 고정 무한 캐러셀 + 활성 유형 상세 카드 채택.
    - 대안: 단일 슬라이드 캐러셀 / 정적 peek 줄.
    - 근거: 앵무새 16유형 어필 강화로 앱 유입 동기 증대.
    - 접근성: reduced-motion·키보드·라이브 캡션 준수.
    - ADR-0001(인트로 비주얼 방향)의 연장선임을 명시한다.

코드 변경은 없다(문서 전용). 결정은 이미 확정됐으므로 기록만 수행한다.

## Comments

- `CONTEXT.md` 인트로 surface 설명을 "auto-advancing carousel of per-type parrot
  images" → "활성 유형 카드(콤팩트 밴드, 좌 1:1 그라데이션 타일 · 우 코드·이름·한줄설명)
    - 중앙 고정 자동전환 peek 캐러셀(16유형·중앙 강조·탭 활성화·무한루프)"로 갱신.
      단일 활성 인덱스 공유와 ADR-0005 참조를 명시. `_Avoid_`에 옛 "peek-row" 추가.
- `docs/adr/0005-intro-active-type-showcase.md` 신규(0004와 동일 포맷): 결정(활성 카드 +
  중앙 고정 무한 캐러셀·탭·단일 인덱스), 대안(단일 슬라이드 / 정적 peek), 근거(16유형
  어필로 앱 유입), 접근성(reduced-motion·키보드·hover 일시정지·aria-pressed·라이브 캡션),
  ADR-0001(인트로 비주얼) 연장 및 ADR-0004(PNG 숲) 위에 놓임을 명시.
- **프로토타입 3:2 → 콤팩트 변경**을 ADR Consequences에 기록(검수에서 세로 과다로 외곽
  3:2 폐기, 높이는 콘텐츠 추종, 5:9 컬럼·좌타일/우텍스트 구성은 유지).
- 버블링 transitionend 가드(15에서 수정) 재발 방지 주의도 ADR에 함께 기록.

## Acceptance criteria

- [ ] `CONTEXT.md` 인트로 용어가 활성 유형 카드 + 중앙 고정 자동전환 peek 캐러셀로 갱신된다.
- [ ] `docs/adr/0005-intro-active-type-showcase.md`에 결정·대안·근거·접근성이 기록된다.
- [ ] ADR-0005가 ADR-0001과의 관계를 명시한다.

## Blocked by

None - can start immediately
