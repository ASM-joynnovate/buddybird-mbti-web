# 02 · output:'standalone' 전환 + /api/healthz

Status: ready-for-agent

## Parent

`.claude/plans/grill-with-docs-to-issues-cheerful-cook.md`

## What to build

빌드 산출물을 정적 `out/`에서 Node standalone 서버로 전환한다. 이 슬라이스 완료 후
`yarn build`는 `.next/standalone/server.js`를 만들고, 그 서버를 직접 띄워 앱과
헬스 엔드포인트가 동작해야 한다.

- `next.config.ts`의 `output: 'export'`를 `'standalone'`으로 변경한다. `trailingSlash`는 유지 가능하나 라우팅에 부작용이 없는지 확인한다.
- 무상태 헬스 엔드포인트 `app/api/healthz/route.ts`를 추가한다. `GET`이 200과 간단한 JSON(`{ status: 'ok' }`)을 반환한다. 사용자 데이터를 다루지 않는다.
- 새 Next.js(이 저장소 버전 16.x)의 standalone 산출 경로/`server.js` 동작은 학습 데이터와 다를 수 있다 — 구현 전 `node_modules/next/dist/docs/`의 관련 가이드를 먼저 확인한다.

## Acceptance criteria

- [ ] `next.config.ts`가 `output: 'standalone'`이다.
- [ ] `yarn build` 후 `.next/standalone/server.js`가 존재한다.
- [ ] `node .next/standalone/server.js`로 띄운 서버의 `/`, `/test/`, `/result/`, `/dex/`가 정상 렌더된다.
- [ ] `GET /api/healthz/`(trailingSlash로 인해 슬래시 포함이 canonical)가 200을 반환한다. 슬래시 없는 `/api/healthz`는 308→`/api/healthz/`. **모든 헬스체크는 슬래시 포함 URL을 쓴다.**
- [ ] `yarn type-check`가 통과한다.

## Blocked by

- `.scratch/deploy/issues/01-docs-standalone-decision.md`
