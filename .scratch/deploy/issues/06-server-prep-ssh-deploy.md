# 06 · 서버 준비 (수동 배포)

Status: ready-for-human

## Parent

`.claude/plans/grill-with-docs-to-issues-cheerful-cook.md`

## What to build

서버에서 컨테이너를 수동 배포할 수 있도록 준비한다. 사람이 서버 셸에서 수행하므로
**HITL**. (자동 배포/SSH 키/GitHub 시크릿은 제거됨 — 범위 외.)

- 서버: Docker / Docker Compose v2 설치 확인, 배포 사용자 `docker` 그룹 추가.
- `proxy` 네트워크 존재 확인(기존 Caddy가 사용 중): `docker network inspect proxy`.
- 배포용 디렉터리에 repo clone(예: `/opt/buddybird-mbti`).
- 절차는 `docs/deploy.md` §1에 문서화되어 있다.

## Acceptance criteria

- [ ] 서버에 repo가 clone되어 있고 배포 사용자가 docker를 sudo 없이 실행 가능.
- [ ] `proxy` 네트워크가 존재한다.
- [ ] 서버에서 `git pull && docker compose up -d --build`로 컨테이너가 healthy로 뜬다.

## Blocked by

- `.scratch/deploy/issues/05-compose-stack-caddy.md`
