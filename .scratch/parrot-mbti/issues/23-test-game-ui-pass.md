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

- [x] 문항 카드 전환이 AnimatePresence로 동작하고 13문항 전체 플로우가 e2e에서 그린이다. (구현 완료 — e2e 확인은 #10(이슈 18) 전체 런에 위임, Comments 참조)
- [x] 선택 → 자동 진행 타이밍이 기존(420ms / reduced-motion 120ms)과 동등하다.
- [x] 선택지 버튼이 게임 스타일 + Motion 피드백(`whileTap`, 선택 bounce, 체크 pop)을 사용한다.
- [x] 진행 바 fill이 Motion으로 애니메이션되고 레이아웃 흔들림이 없다.
- [x] `slideInL`/`slideInR` 등 대체된 keyframe이 정리됐다.
- [x] reduced-motion에서 전환·바운스가 강등되어도 테스트 진행이 완전히 가능하다.
- [x] `yarn build`·`yarn type-check`·`yarn lint` 통과, 360–430px 가독 유지.

## Blocked by

- `.scratch/parrot-mbti/issues/20-game-button-system.md`
- `.scratch/parrot-mbti/issues/21-game-card-panel-chip.md`

## Comments

### 구현 요약 (page-b)

- **카드 전환**: `slideInL`/`slideInR` keyframe → `AnimatePresence mode="wait"` +
  `custom={direction}` 방향성 variants(enter/center/exit). `mode="wait"`를 택해
  flex 컬럼에 카드 2장이 겹치는 레이아웃 점프를 회피(popLayout은 domMax 번들이
  필요해 ADR-0006 LazyMotion 결정과 충돌). exit는 0.16s 단축 + exit variant에
  `pointerEvents: 'none'`을 넣어 퇴장 중 카드가 탭을 삼키지 못하게 함.
- **자동 진행 타이밍 판단**: **setTimeout(420ms / reduced-motion 120ms) 유지**,
  `onAnimationComplete` 이관은 기각. 근거: 타이머는 엔진의 페이싱 계약이고,
  애니메이션 완료에 결합하면 전환이 중단/강등(reduced-motion)될 때 진행이
  멈추거나 타이밍 의미가 변형됨. Motion 전환은 타이머와 병행.
- **선택지**: `.opt`가 `.game-card .game-card--selectable`(이슈 21 어휘)을 소비
  — surface(크림 배경·leaf 보더·papercut 그림자·hover 리프트)는 globals, 퀴즈
  레이아웃 + `--ax` 액센트만 test.css. transform은 Motion 단독 소유(whileHover
  1.015/-3px, whileTap 0.98, 선택 bounce는 CSS `bounce`와 동일한 0/40/70/100%
  scale envelope의 keyframe variant). 체크 스탬프는 `popIn`. 선택 후 440ms 창의
  `:disabled`에 globals `.game-card:disabled` dim(saturate/opacity)이 묻는 문제는
  `.opts .opt:disabled` 특이도 우위로 무효화(흐름 페이싱이지 불능 상태가 아님).
- **진행 바**: CSS width transition → `m.i` `animate={{ width }}` 1회성 tween
  (`initial={false}`로 세션 복원 시 전체 재생 방지). 배경색 전환은 기존처럼 즉시.
- **reduced-motion**: 카드 전환은 opacity-only 크로스페이드(0.12s/0.08s),
  bounce·whileTap·whileHover 전부 드롭, 체크/이모지는 `fadeOnly`. 진행 바 0.08s.
  진행 자체(클릭→120ms 자동 진행)는 완전 동작.
- **e2e 호환**: `data-testid`(test-root/progress/back-button/choice-_/opt-_ 스왑)
  전부 보존. 진행 바는 AnimatePresence 바깥이라 full-navigation의 progress 단언이
  전환 중에도 성립. 퇴장 카드는 picked 상태로 동결되어 `opt-*` testid만 노출 →
  poller가 다음 문항을 기다리는 기존 의미 유지.
- **이슈 27 정리 대상 (globals.css — 수정 금지 경계)**: `@keyframes pop`,
  `@keyframes bounce`는 test.css 소비처가 사라짐. 다른 표면의 잔존 사용 여부
  확인 후 이슈 27에서 일괄 정리할 것.
- **검증**: `yarn build`·`yarn type-check`·`yarn lint` 그린. e2e 확인은 리드
  결정에 따라 #10(이슈 18) 전체 `yarn e2e:run`에 위임 — e2e 플로우 자체가 #10
  에서 재작성 중이라 개별 실행은 스퓨리어스 실패 위험. 해당 런에서 이 페이지
  관련 실패가 나오면 본 이슈 재오픈.
