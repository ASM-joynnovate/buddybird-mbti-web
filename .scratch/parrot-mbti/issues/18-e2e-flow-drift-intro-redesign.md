# 18 · E2E 플로우 노후화 수정 (인트로 showcase 재설계 반영)

Status: ready-for-agent

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

- [ ] `yarn e2e`의 7개 플로우가 모두 통과한다.
- [ ] 갱신된 플로우가 현재 인트로(`TypeShowcase`)와 실제 문항 수/진행 표시기를 단언한다.
- [ ] 대기는 준비 신호 기반(고정 타임아웃 없음) 원칙을 유지한다.
- [ ] 고아 `type-carousel.tsx`가 제거되거나, 남긴다면 사용처가 명확하다.

## Blocked by

None - can start immediately
