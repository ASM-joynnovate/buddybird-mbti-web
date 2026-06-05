# 23 · Test 페이지 게임 UI 적용 패스

Status: ready-for-agent

## Parent

`.scratch/parrot-mbti/PRD.md`

## What to build

이슈 20·21 체계를 Test 페이지(`app/test/`)에 적용하고, 문항 전환·선택 피드백·
진행 바 애니메이션을 Motion으로 리팩토링한다.

- 문항 카드 전환: `slideInL`/`slideInR` keyframe → `AnimatePresence` 기반
  enter/exit 전환으로 교체(방향성 유지). 13문항 자동 진행 흐름이 끊기지 않게.
- 자동 진행 타이밍: 현재 선택 후 420ms `setTimeout`(reduced-motion 시 120ms,
  `app/test/page.tsx`)의 의미를 보존. setTimeout 유지 + Motion 전환 병행이냐,
  Motion `onAnimationComplete` 콜백으로 이관이냐는 구현 시 판단·기록.
- 선택지 버튼(`.opt`, `app/test/test.css`): 이슈 20 게임 버튼 톤으로 스킨,
  선택 시 `bounce`·체크 스탬프 `pop` keyframe → Motion variants + `whileTap`.
- 진행 바: width transition → Motion 제어 fill(비연속 1회 애니메이션이므로
  width 또는 scaleX 허용)로 교체.
- 교체된 keyframe/transition 제거(전수 정리는 이슈 27).
- 주의: AGENTS.md — 구현 전 `node_modules/next/dist/docs/` 확인.

## Acceptance criteria

- [ ] 문항 카드 전환이 AnimatePresence로 동작하고 13문항 전체 플로우가 e2e에서 그린이다.
- [ ] 선택 → 자동 진행 타이밍이 기존(420ms / reduced-motion 120ms)과 동등하다.
- [ ] 선택지 버튼이 게임 스타일 + Motion 피드백(`whileTap`, 선택 bounce, 체크 pop)을 사용한다.
- [ ] 진행 바 fill이 Motion으로 애니메이션되고 레이아웃 흔들림이 없다.
- [ ] `slideInL`/`slideInR` 등 대체된 keyframe이 정리됐다.
- [ ] reduced-motion에서 전환·바운스가 강등되어도 테스트 진행이 완전히 가능하다.
- [ ] `yarn build`·`yarn type-check`·`yarn lint` 통과, 360–430px 가독 유지.

## Blocked by

- `.scratch/parrot-mbti/issues/20-game-button-system.md`
- `.scratch/parrot-mbti/issues/21-game-card-panel-chip.md`
