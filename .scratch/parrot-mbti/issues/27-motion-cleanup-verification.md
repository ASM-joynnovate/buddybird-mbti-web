# 27 · 모션 정리 + 전체 검증 패스

Status: ready-for-agent

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

- [ ] 대체된 keyframes/애니메이션 클래스/JS 루프의 잔존 사용처가 0이고 파일에서 제거됐다.
- [ ] 동일 요소에 대한 CSS+Motion 이중 제어가 없다.
- [ ] 캐러셀 setInterval "유지" 결정이 코드 주석으로 기록됐다.
- [ ] 5개 폭 × 4개 화면 스크린샷 + reduced-motion 스크린샷이 아카이브됐다.
- [ ] 랜딩 JS 번들이 150kb gzip 예산 내이고 수치가 기록됐다.
- [ ] `yarn build`·`yarn type-check`·`yarn lint`·e2e 전체 통과.

## Blocked by

- `.scratch/parrot-mbti/issues/22-intro-game-ui-pass.md`
- `.scratch/parrot-mbti/issues/23-test-game-ui-pass.md`
- `.scratch/parrot-mbti/issues/24-result-game-ui-pass.md`
- `.scratch/parrot-mbti/issues/25-modal-dex-game-ui-pass.md`
- `.scratch/parrot-mbti/issues/26-forest-idle-motion-and-tuning.md`
