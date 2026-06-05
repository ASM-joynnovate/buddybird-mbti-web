# 07 · deploy.yml — SSH 트리거 워크플로

Status: wontfix

> 자동 배포(GitHub Actions) 제거 결정으로 폐기. 배포는 서버에서 수동(`git pull && docker compose up -d --build`). `docs/deploy.md` 참조.

## Parent

`.claude/plans/grill-with-docs-to-issues-cheerful-cook.md`

## What to build

`main` 머지 시 서버 배포를 트리거하는 GitHub Actions 워크플로. 호스트 러너는
SSH로 서버에 접속해 스크립트를 실행하는 얇은 오케스트레이터다(빌드·배포는 서버에서).

- `.github/workflows/deploy.yml`: `on: push: branches: [main]`, `concurrency: { group: deploy-main, cancel-in-progress: false }`, `runs-on: ubuntu-latest`.
- SSH 액션(`appleboy/ssh-action@v1` 등)으로 서버 접속 → `cd $DEPLOY_DIR && git pull origin main && ./scripts/deploy.sh`. `git pull`은 SSH 명령에 두어 항상 최신 `deploy.sh`를 받은 뒤 실행한다.
- 시크릿/변수는 06에서 등록한 것을 사용한다. Slack 알림 스텝은 08에서 추가한다.
- SSH 스텝의 종료코드가 곧 배포 성공/실패다(실패 전파).

## Acceptance criteria

- [ ] `.github/workflows/deploy.yml`이 유효하며 `push: main`에서 트리거된다.
- [ ] 워크플로가 SSH로 서버에 접속해 `git pull && ./scripts/deploy.sh`를 실행한다.
- [ ] 배포 실패 시 워크플로가 실패로 종료된다(종료코드 전파).
- [ ] 동시 배포가 직렬화된다(concurrency).

## Blocked by

- `.scratch/deploy/issues/05-compose-stack-caddy.md`
- `.scratch/deploy/issues/06-server-prep-ssh-deploy.md`
