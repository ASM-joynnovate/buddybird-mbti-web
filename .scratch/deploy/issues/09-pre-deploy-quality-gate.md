# 09 · PR 품질 게이트 CI (lint/type-check/build)

Status: wontfix

> GitHub Actions 전부 제거 결정으로 폐기. 품질 검증은 로컬에서 `yarn lint && yarn type-check && yarn build`로 수행.

## Parent

`.claude/plans/grill-with-docs-to-issues-cheerful-cook.md`

## What to build

깨진 변경이 `main`에 머지되어 배포로 흘러가지 않도록, PR 단계에서 도는 품질 게이트
워크플로를 추가한다. 배포 파이프라인과 독립적으로 진행 가능하다.

- `.github/workflows/ci.yml`: `on: pull_request`, `runs-on: ubuntu-latest`. Yarn 4(corepack) 셋업 → `yarn install --immutable` → `yarn lint` + `yarn type-check` + `yarn build`.
- E2E(agent-browser)는 무겁고 브라우저가 필요하므로 이 게이트에서는 제외한다(선택적 후속).

## Acceptance criteria

- [ ] `.github/workflows/ci.yml`이 PR에서 트리거된다.
- [ ] lint·type-check·build 중 하나라도 실패하면 체크가 실패한다.
- [ ] 타입 오류가 있는 PR이 머지 전 차단된다.
- [ ] 정상 PR에서는 게이트가 통과한다.

## Blocked by

None - can start immediately
