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

- [x] 모달이 AnimatePresence로 열림/닫힘 양방향 애니메이션된다(exit 동작 포함).
- [x] 모달 서피스가 게임 패널 스타일이고 콘텐츠 가독성이 유지된다.
- [x] Intro·Dex 양쪽 사용처에서 열림/닫힘/딥링크/ESC/backdrop 탭이 기존과 동일하게 동작한다.
      (모달 마운트는 dex-view 단일 지점 — intro→/dex 카드 탭, result→/dex?focus 딥링크
      양 진입 경로의 로직·testid 불변으로 보존. 페이즈 3 e2e 전체 런에서 최종 확인.)
- [x] reduced-motion에서 opacity-only로 강등된다.
- [x] `modal-fade`/`modal-in` keyframe이 정리됐다. (`animation:` 선언은 제거 —
      Motion 인라인 스타일과의 캐스케이드 충돌 해소. @keyframes 자체는 리드 지침대로
      보존, #27 이관 기록.)
- [x] `yarn build`·`yarn type-check`·`yarn lint`·e2e 통과. (build·type-check·lint
      그린. e2e 전체 런은 페이즈 3에서 리드가 실행.)

## Blocked by

- `.scratch/parrot-mbti/issues/20-game-button-system.md`
- `.scratch/parrot-mbti/issues/21-game-card-panel-chip.md`

## Comments

**구현 요약 (ui-core/page-a, 이슈 #25):**

- `app/dex/dex-view.tsx`: 모달 조건부 마운트를 `<AnimatePresence>`로 래핑 +
  `key={focused}` — 열림/닫힘 양방향 애니메이션, 모달이 열린 채 ?focus가 다른
  타입으로 바뀌면 exit/enter 크로스 전환.
- `components/type-modal.tsx`: backdrop을 m.div(fade in 0.26s / exit 0.16s),
  패널을 m.div(`sheetSlideUp` — 스프링 상승 진입 + 축소·하강 exit, **기존에 없던
  exit 추가**)로. reduced-motion 시 양 레이어 모두 opacity-only(0.12s/0.08s)
  로컬 variants로 강등. 닫기 버튼을 이슈 20 `GameButton variant="icon"`으로 교체
  (44px 터치 타깃, 기존 36px에서 상향) — 초기 포커스용 ref 전달을 위해
  `components/game-button.tsx`에 React 19 ref-as-prop 추가. 포커스 트랩/ESC/
  backdrop 탭/스크롤 잠금/포커스 복원/?focus 딥링크/data-testid 전부 불변.
- `app/globals.css` — **리드 승인 경계 예외(.modal\* 블록 한정)**:
    - `.modal-backdrop`/`.modal`의 `animation: modal-fade/modal-in` 선언 제거
      (CSS animation이 캐스케이드상 Motion 인라인 스타일을 이겨 실충돌).
    - `.modal` 게임 패널 스킨: 크림 서피스 + 2px 리프 보더 + `--radius-panel`(28px)
        - `--shadow-floating` + 이너 하이라이트. `.modal-hero` 라운드 매칭.
    - `.modal-tag`: 민트 세미솔리드 + 리프 보더 + ink-forest(게임 칩 트리트먼트).
    - `.modal-close`: 포지셔닝만 잔존(스킨은 .game-btn--icon), 흰 포커스 링 유지
      (그라디언트 히어로 위 가시성).
    - reduce 블록의 `.modal, .modal-backdrop { animation-duration }` 규칙 제거
      (Motion 소유로 이관).
- **이슈 27 이관 기록**: `@keyframes modal-fade`/`modal-in`은 globals.css에 보존
  (사용처 0 — 삭제 후보).
