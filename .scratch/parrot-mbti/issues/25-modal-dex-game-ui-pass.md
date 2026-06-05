# 25 · TypeModal AnimatePresence + 게임 스킨 (Dex 포함)

Status: ready-for-agent

## Parent

`.scratch/parrot-mbti/PRD.md`

## What to build

`TypeModal`(`components/type-modal.tsx`)의 열림/닫힘을 `AnimatePresence`로
리팩토링하고 모달 서피스를 게임 패널 스타일로 스킨한다. Intro와 Dex 양쪽
사용처에서 검증한다.

- `modal-fade`(backdrop)/`modal-in`(본문) keyframe → `AnimatePresence` + variants.
  **현재 없는 exit 애니메이션 추가**: backdrop 페이드아웃 + 모달 축소/하강.
  (mount/unmount 애니메이션이므로 AnimatePresence 필수.)
- 모달 서피스를 이슈 21 게임 패널 체계로(크림/민트 서피스, 라운드 28px급,
  페이퍼컷 섀도). 닫기 버튼은 이슈 20 icon 버튼 변형.
- 기존 동작 보존: 포커스 처리, ESC 닫기, backdrop 탭 닫기, 스크롤 잠금,
  Dex `?focus` 딥링크 열림.
- 교체된 `modal-*` keyframe 제거(전수 정리는 이슈 27).
- "use client" 최소 범위. 주의: AGENTS.md — 구현 전 `node_modules/next/dist/docs/` 확인.

## Acceptance criteria

- [ ] 모달이 AnimatePresence로 열림/닫힘 양방향 애니메이션된다(exit 동작 포함).
- [ ] 모달 서피스가 게임 패널 스타일이고 콘텐츠 가독성이 유지된다.
- [ ] Intro·Dex 양쪽 사용처에서 열림/닫힘/딥링크/ESC/backdrop 탭이 기존과 동일하게 동작한다.
- [ ] reduced-motion에서 opacity-only로 강등된다.
- [ ] `modal-fade`/`modal-in` keyframe이 정리됐다.
- [ ] `yarn build`·`yarn type-check`·`yarn lint`·e2e 통과.

## Blocked by

- `.scratch/parrot-mbti/issues/20-game-button-system.md`
- `.scratch/parrot-mbti/issues/21-game-card-panel-chip.md`
