# 18 · E2E 플로우 노후화 수정 (인트로 showcase 재설계 반영)

Status: in-review

## Parent

`.scratch/parrot-mbti/PRD.md`

## What to build

인트로가 peek 캐러셀에서 **TypeShowcase**(이슈 14~17)로 재설계되면서, 일부 E2E
플로우가 더 이상 존재하지 않는 구 DOM(`intro-carousel`)을 단언해 실패한다.
`components/type-carousel.tsx`는 현재 **어디서도 import되지 않는 고아 컴포넌트**다.
실패 플로우를 현재 인트로/문항 UI에 맞게 갱신해 `yarn e2e`를 전부 통과시킨다.

배포 작업(`.scratch/deploy/`)에서 E2E 하니스를 정적 `out/` 서빙 → Next standalone
서버 기동으로 전환했고, **현재 UI와 맞는 플로우(known-answer-type, analytics-events,
funnel-events, responsive)는 통과**한다. 아래 3개만 구 DOM 기준이라 실패한다.

- `e2e/flows/intro-carousel.mjs` — `intro-carousel` 단언 → 현재 `intro-showcase`/`showcase-active-card`(`components/type-showcase.tsx`) 기준으로 재작성. 자동 전환/탭 동작은 showcase 구현에 맞춘다.
- `e2e/flows/accessibility.mjs` — "carousel must be a labelled group" 단언 → showcase의 실제 라벨링(role/aria) 기준으로 갱신.
- `e2e/flows/full-navigation.mjs` — "progress indicator must be visible on question 14" 실패. 현재 문항 수(`QUESTION_COUNT`, `@/content`)와 진행 표시기 testid에 맞게 루프/단언을 고친다.
- 더 이상 쓰이지 않으면 `components/type-carousel.tsx`(고아) 제거를 검토한다.

## Acceptance criteria

- [x] `yarn e2e`의 7개 플로우가 모두 통과한다.
- [x] 갱신된 플로우가 현재 인트로(`TypeShowcase`)와 실제 문항 수/진행 표시기를 단언한다.
- [x] 대기는 준비 신호 기반(고정 타임아웃 없음) 원칙을 유지한다.
- [x] 고아 `type-carousel.tsx`는 팀 결정에 따라 이 이슈에서 제거하지 않고 이슈 27 정리 대상으로 기록했다(아래 Comments).

## Blocked by

None - can start immediately

## Comments

- `components/type-carousel.tsx` 고아 컴포넌트는 이 이슈에서 제거하지 않고 **이슈 27
  정리 패스 대상**으로 남긴다(팀 결정 — 모션/데드코드 정리는 27에서 일괄 수행).

**구현 요약 (forest, feat/game-ui-motion):**

- `intro-carousel.mjs` 재작성(파일명은 러너 안정성을 위해 유지): TypeShowcase 기준으로
  `intro-showcase`/`showcase-active-card`/`showcase-caption` 단언, peek 타일 = 네이티브
  버튼 + aria-pressed 단일 활성, 자동 전환은 "활성 타입이 바뀐다"를 폴링(상한 있는 준비
  신호 대기, 고정 sleep 없음), 탭은 타일 focus(쇼케이스 onFocusCapture로 자동 전환 일시정지
  → 타이머 경합 제거)+click 후 활성 코드 추종을 폴링.
- `accessibility.mjs` 재작성: showcase 라벨링(타일 aria-label/aria-pressed, caption
  aria-live=polite), intro start/dex 버튼 접근 가능한 이름, **img alt 규율 갱신** — 모든
  img는 alt 속성 필수, 빈 alt는 aria-hidden 서브트리(장식용 PNG 숲 배경) 안에서만 허용.
  구 단언("모든 img alt 비어있지 않음")은 장식 이미지 alt="" 모범 사례와 충돌하는
  노후 단언이었음. Test 표면 단언(progressbar/labelled choices)은 현 DOM과 일치해 유지.
- `full-navigation.mjs`: team-lead의 result-loading 유예 블록은 **보존**. 남은 경합 1건
  수정 — 마지막 답변 직후 Test 페이지가 빈 상태(`test-root`만 있고 progress 없음)로
  렌더되는 전환 창에서 progress를 단언하던 문제. 선택지 탐색+클릭+progress 확인을 단일
  eval로 원자화하고, 선택지가 없으면 전환 중으로 보고 폴링 지속.
- 비결정성 교훈 2건(플로우 주석에도 기록): (1) evalJs는 호출당 CLI 왕복이라 두 번의
  read 사이에 3s 자동 전환이 끼어들 수 있음 → 연관 read는 반드시 단일 eval로. (2)
  스크립트 `el.click()`(untrusted)은 React 19에서 discrete 우선순위 동기 flush가 보장되지
  않음 → 클릭 직후 같은 tick DOM 단언 금지, 활성화는 준비 신호로 폴링.
- 검증: `yarn e2e:run` 2회 연속 7개 플로우 전부 그린(known-answer-type,
  analytics-events, funnel-events, responsive 포함 회귀 없음). `yarn lint` 그린.
  이로써 이슈 26의 "e2e 통과" 게이트도 충족.
