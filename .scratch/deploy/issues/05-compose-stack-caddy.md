# 05 · compose 스택 + Caddyfile 스니펫

Status: ready-for-agent

## Parent

`.claude/plans/grill-with-docs-to-issues-cheerful-cook.md`

## What to build

컨테이너를 기존 Caddy 뒤에 올리는 compose 스택과, 기존 Caddy에 추가할 리버스
프록시 스니펫을 만든다. (자동 배포·deploy.sh는 범위에서 제외 — 수동 배포.)

- `docker-compose.yml`: 최상단 `name: buddybird-mbti`(체크아웃 경로 무관 동일성), `container_name: buddybird-mbti-web`, `restart: unless-stopped`, `expose: ["3000"]`(호스트 publish 안 함), `healthcheck`(`http://127.0.0.1:3000/api/healthz/`). 외부 네트워크는 `networks: { proxy: { external: true } }`.
- `docs/deploy.md`에 Caddyfile 스니펫과 reload 절차, 수동 배포(`git pull && docker compose up -d --build`)를 문서화한다. 스니펫 예: `mbti.<도메인> { reverse_proxy buddybird-mbti-web:3000 }`, reload: `docker exec <caddy_container> caddy reload --config /etc/caddy/Caddyfile`.

## Acceptance criteria

- [x] `docker compose up -d --build`로 컨테이너가 `proxy` 네트워크에서 healthy로 뜬다.
- [x] 호스트 포트를 publish하지 않고도 같은 `proxy` 네트워크의 컨테이너에서 `:3000` 도달 가능.
- [x] `docs/deploy.md`에 Caddyfile 스니펫·reload·수동 배포 절차가 기술된다.

## Blocked by

- `.scratch/deploy/issues/04-dockerfile-image.md`
