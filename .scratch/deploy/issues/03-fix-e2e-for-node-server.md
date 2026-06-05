# 03 · E2E 하니스를 Node 서버 기동으로 갱신

Status: ready-for-agent

## Parent

`.claude/plans/grill-with-docs-to-issues-cheerful-cook.md`

## What to build

기존 agent-browser E2E 하니스는 정적 `out/` 디렉터리를 파일 서버로 띄워 검증한다.
standalone 전환 이후 `out/`이 더 이상 생성되지 않으므로, 하니스가 standalone Node
서버를 기동해 같은 플로우를 검증하도록 갱신한다.

- `e2e/run.mjs`/`e2e/helpers.mjs`에서 정적 `out/` 서빙 부분을 standalone 서버 기동(`node .next/standalone/server.js` 또는 동등)으로 교체한다. 포트/준비 신호 대기는 유지한다.
- 기존 플로우(full-navigation, known-answer-type, analytics-events, intro-carousel, funnel-events, accessibility, responsive)가 그대로 통과해야 한다.
- 고정 타임아웃 금지 — 준비 신호(`document.fonts.ready`, 가시 요소)로 대기한다.

## Acceptance criteria

- [x] 하니스가 `out/` 정적 서빙 대신 Next standalone 서버(`node .next/standalone/server.js`, public/.next/static 복사)를 기동한다.
- [x] 하니스가 더 이상 `out/` 존재에 의존하지 않는다(`startAppServer(ROOT)`).
- [x] 서버 기동/종료가 깔끔히 처리되어 잔여 프로세스가 남지 않는다.
- [x] 대기는 준비 신호 기반(고정 타임아웃 없음).
- [x] 현재 UI와 맞는 플로우(known-answer-type, analytics-events, funnel-events, responsive)가 standalone 서버에서 통과.

## 비고: 사전 존재 드리프트 분리

`intro-carousel`·`accessibility`·`full-navigation` 3개 플로우는 인트로 showcase
재설계(이슈 14~17) 때부터 이미 깨져 있던 노후 단언이며, 본 서빙 전환과 무관하다
(이 브랜치는 `e2e/helpers.mjs`·`e2e/run.mjs`만 변경). 수정은 별도 이슈
`.scratch/parrot-mbti/issues/18-e2e-flow-drift-intro-redesign.md`로 분리.

## Blocked by

- `.scratch/deploy/issues/02-switch-to-standalone-build.md`
