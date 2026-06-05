# 04 · Dockerfile + .dockerignore

Status: ready-for-agent

## Parent

`.claude/plans/grill-with-docs-to-issues-cheerful-cook.md`

## What to build

standalone 빌드를 담는 컨테이너 이미지를 만든다. 공식 `node:24-alpine` 멀티스테이지
(deps → builder → runner)로, 런타임 스테이지는 standalone 산출물만 담아 비루트로
실행한다.

- `Dockerfile`: `WORKDIR /app`, `corepack enable`(Yarn 4.16.0), `yarn install --immutable`, `yarn build`. 런타임 스테이지는 `.next/standalone`, `.next/static`, `public`만 복사하고 비루트 유저로 실행.
- **`ENV HOSTNAME=0.0.0.0` 필수** — 미설정 시 standalone 서버가 localhost에만 바인딩되어 컨테이너 밖/`proxy` 네트워크에서 도달 불가. `ENV PORT=3000`.
- `HEALTHCHECK`는 `wget -qO- http://localhost:3000/api/healthz`(올바른 `-qO-` 형식).
- `.dockerignore`: `node_modules`, `.next`, `out`, `.git` 등 제외. **`.yarn/releases`는 포함**(빌드에 필요).
- `.yarn/cache`는 미커밋이므로 빌드 시 `yarn install`이 네트워크를 사용한다.

## Acceptance criteria

- [ ] `docker build -t buddybird-mbti-web .`가 성공한다(arm64 네이티브 빌드 가능).
- [ ] `docker run --rm -p 3000:3000 buddybird-mbti-web` 후 `/`, `/test/`, `/result/`, `/dex/`, `/api/healthz`가 정상.
- [x] 컨테이너가 `HEALTHY` 상태가 된다(HEALTHCHECK 통과). **헬스체크는 `127.0.0.1`을 쓴다** — `localhost`는 컨테이너에서 IPv6 `::1`로 풀려 0.0.0.0(IPv4) 바인딩 서버에 connection refused.
- [x] 런타임이 비루트 유저(uid 1001 nextjs)로 실행되고 호스트 포트를 임의 publish하지 않는다.

## Blocked by

- `.scratch/deploy/issues/02-switch-to-standalone-build.md`
