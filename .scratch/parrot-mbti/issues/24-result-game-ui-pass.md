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

- [x] 결과 패널/칩/CTA가 이슈 20·21 체계를 사용하고 reveal 모션이 절제되어 1회 동작한다.
- [x] AxisBars가 rAF arming 없이 Motion mount 애니메이션으로 동등 이상의 시각을 낸다.
- [x] Confetti 수명이 AnimatePresence로 관리되고 채택한 파티클 전략(Motion vs CSS 유지)이 기록됐다.
- [x] reduced-motion에서 콘페티·reveal이 강등되어도 결과 확인이 완전히 가능하다.
- [x] `?t=` 딥링크/공유/사진 등 기존 결과 페이지 동작이 보존된다.
- [x] `yarn build`·`yarn type-check`·`yarn lint`·e2e 통과, 360–430px 가독 유지. (build/type-check/lint 그린 — e2e 확인은 #10(이슈 18) 전체 런에 위임, Comments 참조)

## Blocked by

- `.scratch/parrot-mbti/issues/20-game-button-system.md`
- `.scratch/parrot-mbti/issues/21-game-card-panel-chip.md`

## Comments

### 구현 요약 (page-b)

- **Reveal**: `.result-content`/`.result-hero`/`.result-body`가 `staggerContainer`
  로 1회성 캐스케이드. 히어로 아트는 로컬 `heroArtRise` variant(기존 globals
  `float-up` keyframe의 y/scale envelope 재현 — `anim-float-up` 클래스 소비처
  제거), 타입 코드는 `popIn`, 배지/이름/태그/본문 블록은 `fadeUp`. 전부
  `initial="hidden" → animate="visible"` 1회성, 루프 없음.
- **패널 스킨(이슈 21 어휘)**: AxisBars 섹션이 `.game-panel`(크림 패널 + 패딩),
  사진/공유 슬롯이 `.game-panel--mint`로 "공유 퀘스트 블록"화. 버튼류(앱 CTA·
  공유·사진·다시하기·도감)는 이슈 20에서 이미 GameButton — 변경 없음. 궁합 칩은
  이슈 21의 MatchChip 게임 스킨 그대로(공유 컴포넌트, 비소유 — 미수정).
- **AxisBars**: rAF로 transition을 arming하던 `armed` state 패턴 제거 →
  fill/knob이 `m.span`의 `initial`(중앙·0폭) → `animate`(목표 left/width/knob)
  mount 애니메이션. `easeSpring` 0.9s로 기존 `--ease-spring` 0.9s transition과
  동일한 스프링 느낌. left/width는 레이아웃 속성이지만 1회성 reveal(테스트 진행
  바와 같은 허용 범위). reduced-motion은 `initial={false}`로 즉시 스냅(기존 CSS
  guard와 동등). axis-bars.css의 `--seg-start/--seg-width/--knob-pos` 변수와
  transition 제거.
- **Confetti 판단**: 수명을 `setTimeout(1800ms)` → Motion 수명 관리로 교체 —
  레이어 `m.div`가 tail fade(delay 1.5s + 0.3s opacity)를 animate하고
  `onAnimationComplete`에서 `done`을 세워 `AnimatePresence`가 퇴장. 타이머 자체가
  사라짐(기존 1800ms 가시 수명과 동등). **파티클은 CSS `confetti-fall` keyframe
  유지**: 24개 비인터랙티브 장식 스프라이트는 "다수 장식 요소 저비용 원칙"의
  전형 — 파티클별 Motion 컴포넌트화는 번들/프레임당 JS 비용만 늘리고 얻는 게
  없음. reduced-motion 시 기존 동작(전혀 렌더하지 않음 + CSS display:none 이중
  가드) 보존.
- **동작 보존**: `?t=` 디코드/공유 방문자 분기/사진(usePhotoSource)/공유 카드
  합성 로직 일절 미변경. `result-root`/`result-type`/`restart-button`/
  `retake-button`/`dex-link`/`confetti`/`axis-bars`/`photo-*`/`share-*`
  data-testid 전부 보존. reveal은 opacity/transform만 쓰므로 textContent는
  마운트 즉시 존재 — known-answer-type의 `result-type` 검증과 호환.
- **이슈 27 정리 대상 (globals.css — 수정 금지 경계)**: `@keyframes float-up` +
  `.anim-float-up` 유틸리티는 이 패스로 소비처 0(주석 외). `confetti-fall`은
  유지(파티클 전략상 존속). 이슈 23에서 기록한 `pop`/`bounce`와 함께 일괄 정리.
- **검증**: `yarn build`·`yarn type-check`·`yarn lint` 그린. e2e 확인은 리드
  결정에 따라 #10(이슈 18) 전체 `yarn e2e:run`에 위임 — e2e 플로우 자체가 #10
  에서 재작성 중이라 개별 실행은 스퓨리어스 실패 위험. 해당 런에서 이 페이지
  관련 실패가 나오면 본 이슈 재오픈.
