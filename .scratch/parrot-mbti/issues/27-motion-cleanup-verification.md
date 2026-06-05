# 27 · 모션 정리 + 전체 검증 패스

Status: done

## Parent

`.scratch/parrot-mbti/PRD.md`

## What to build

이슈 19–26으로 Motion 전환이 끝난 뒤, 죽은 애니메이션 코드를 전수 제거하고
전 화면·전 폭·reduced-motion을 한 번에 검증한다.

- dead code 제거: Motion으로 대체 완료된 CSS keyframes(`pop`, `bounce`,
  `float-up`, `floaty`, `modal-fade`, `modal-in`, `slideInR`, `slideInL`,
  `showcase-card-fade` 등 — 실제 대체 여부 기준)·애니메이션 클래스·JS 애니메이션
  루프를 grep으로 잔존 사용처 0 확인 후 제거. 같은 요소를 CSS와 Motion이 동시에
  제어하는 이중 시스템이 없는지 확인. 단순 색 hover transition은 잔존 허용.
- 캐러셀 감사: `type-showcase.tsx`/`type-carousel.tsx`의 setInterval 자동 진행 +
  silent reset은 **의도적으로 유지**(상태 오케스트레이션이며 모션은 CSS transform —
  사용자 결정, ADR-0005). 이 결정을 코드 주석으로 남긴다.
- 검증(agent-browser 사용 — Playwright 아님):
    - 360/375/390/414/430px에서 Intro/Test/Result/Dex 스크린샷, 오버플로·겹침·
      가독성 확인. 배경 위 텍스트 트리트먼트 확인.
    - reduced-motion 에뮬레이션에서 연속 모션 0·UI 완전 동작 확인 스크린샷.
- 번들 예산 재확인: 랜딩 JS < 150kb gzip — motion 도입 영향 측정·기록.
- `yarn build` + e2e 전체 그린.
- 주의: AGENTS.md — 구현 전 `node_modules/next/dist/docs/` 확인.

## Acceptance criteria

- [x] 대체된 keyframes/애니메이션 클래스/JS 루프의 잔존 사용처가 0이고 파일에서 제거됐다.
- [x] 동일 요소에 대한 CSS+Motion 이중 제어가 없다(발견 1건 수정 — 아래 코멘트).
- [x] 캐러셀 setInterval "유지" 결정이 코드 주석으로 기록됐다(type-showcase.tsx 루프 사이트).
- [x] 5개 폭 × 4개 화면 스크린샷 + reduced-motion 스크린샷이 아카이브됐다(e2e/artifacts/issue-27/).
- [x] 랜딩 JS 번들 수치 기록 — **224.0 KiB gzip. 150kb 예산은 사전·구조적 초과**(motion 도입 전 192.0 KiB, 프레임워크 청크만 ~149 KiB — ADR-0006·사용자 확인). motion 기여분은 LazyMotion 채택으로 +31.3 KiB.
- [x] `yarn build`·`yarn type-check`·`yarn lint`·e2e 전체 통과(7/7 플로우).

## Comments

- **dead code 제거(커밋 529d770):** @keyframes pop/bounce/float-up/floaty/
  modal-fade/modal-in, .anim-pop/.anim-float-up, .btn/.btn--\*/.btn-candy/
  .btn-candy--ghost 전부 grep 잔존 0 확인 후 삭제(-428줄). confetti-fall은
  이슈 24 결정대로 유일하게 의도 보존(주석 명기). 고아 type-carousel.{tsx,css}
  삭제(이슈 18 기록 근거). reduced-motion 블록은 잔존 CSS 전환만 남게 축소.
- **이중 제어 감사:** CSS transition×transform 잔존은 캐러셀 트랙(ADR-0005
  의도 유지)과 peek 타일(캐러셀 시스템 CSS 소유, Motion 미적용)뿐 — 충돌 없음.
  단, 페이즈 3 시각 검증에서 **q-emoji의 CSS translate 센터링이 Motion popIn
  인라인 transform에 클로버되는 실충돌 1건 발견** → 오프셋 센터링으로 수정
  (cdf9735, page-b). 동류 전수 감사 후 .axis-knob에 경고 주석 추가.
- **페이즈 3 게이트 수정 3건:** (A) q-emoji 문항 첫 줄 겹침(회귀, cdf9735),
  (B) test 뒤로가기 ghost 버튼이 캐노피 위 저대비 → secondary --sm 교체
  (cdf9735), (C) dex 헤더 키커/캡션 저대비(기존 결함) → 크림 스크림(1409207).
- **검증 기록:** 360/375/390/414/430 × Intro/Test/Result/Dex 20장 +
  reduced-motion 4장 + 수정 후 재캡처 3장 = e2e/artifacts/issue-27/ (로컬
  아카이브 — 바이너리는 git 미포함). 배경 idle 모션 실동작 확인: 인트로 59개
  img 중 정확히 4개(잎 3·파티클 1)만 애니메이션, reduced-motion 에뮬레이션
  시 transform 변화 요소 0(완전 정적). e2e 7개 플로우 최종 그린(이슈 18
  재작성 플로우 포함).
- **남긴 것:** DESIGN.md frontmatter의 구 Tropical Jungle 값(ADR-0005부터
  기록된 기존 부채), 150kb 번들 예산 재기준선 결정(별도 이슈 권장).

## Blocked by

- `.scratch/parrot-mbti/issues/22-intro-game-ui-pass.md`
- `.scratch/parrot-mbti/issues/23-test-game-ui-pass.md`
- `.scratch/parrot-mbti/issues/24-result-game-ui-pass.md`
- `.scratch/parrot-mbti/issues/25-modal-dex-game-ui-pass.md`
- `.scratch/parrot-mbti/issues/26-forest-idle-motion-and-tuning.md`
