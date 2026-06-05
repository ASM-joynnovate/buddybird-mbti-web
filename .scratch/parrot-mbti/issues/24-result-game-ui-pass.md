# 24 · Result 페이지 게임 UI 적용 패스

Status: ready-for-agent

## Parent

`.scratch/parrot-mbti/PRD.md`

## What to build

이슈 20·21 체계를 Result 페이지(`app/result/`)에 적용하고, 결과 공개(reveal)·
축 그래프·콘페티 애니메이션을 Motion으로 리팩토링한다.

- 결과 패널·궁합 칩·사진/공유 영역·앱 CTA를 게임 패널/버튼 체계로 스킨.
  결과 reveal에 `popIn`/`fadeUp` + stagger(중요 정보 1회성 — 연속 루프 금지).
- `AxisBars`(`components/axis-bars.tsx`): 첫 페인트 후 rAF로 transition을 arming하는
  현재 패턴 → Motion mount 애니메이션(initial→animate)으로 교체. 스프링 느낌 보존.
- `Confetti`(`components/confetti.tsx`): `setTimeout(1800ms)` 언마운트 →
  `AnimatePresence` 수명 관리로 교체. 파티클 다수의 성능을 고려해
  개별 파티클을 Motion 컴포넌트화할지, CSS `confetti-fall` keyframe을 유지하고
  수명만 Motion으로 관리할지는 구현 시 결정·기록(후자 허용 — 장식 다수 요소의
  저비용 원칙).
- reduced-motion 시 콘페티 기존 동작(미표시/축소)을 확인 후 보존.
- 주의: AGENTS.md — 구현 전 `node_modules/next/dist/docs/` 확인.

## Acceptance criteria

- [ ] 결과 패널/칩/CTA가 이슈 20·21 체계를 사용하고 reveal 모션이 절제되어 1회 동작한다.
- [ ] AxisBars가 rAF arming 없이 Motion mount 애니메이션으로 동등 이상의 시각을 낸다.
- [ ] Confetti 수명이 AnimatePresence로 관리되고 채택한 파티클 전략(Motion vs CSS 유지)이 기록됐다.
- [ ] reduced-motion에서 콘페티·reveal이 강등되어도 결과 확인이 완전히 가능하다.
- [ ] `?t=` 딥링크/공유/사진 등 기존 결과 페이지 동작이 보존된다.
- [ ] `yarn build`·`yarn type-check`·`yarn lint`·e2e 통과, 360–430px 가독 유지.

## Blocked by

- `.scratch/parrot-mbti/issues/20-game-button-system.md`
- `.scratch/parrot-mbti/issues/21-game-card-panel-chip.md`
