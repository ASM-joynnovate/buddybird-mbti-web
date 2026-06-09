---
status: accepted
---

# Deployment: Next standalone Node container behind the existing Caddy

The 앵BTI web is deployed as a **Next.js `output: 'standalone'` Node server
container** (port 3000), reverse-proxied by the **Caddy container that already runs
on the server's external `proxy` bridge network**. This replaces the earlier
"static `output: 'export'`, client-only static hosting" assumption recorded in the
PRD and AGENTS.md. We chose the Node container because the operator wants a single
uniform "container behind Caddy" model with one reverse-proxy target, a real
`/api/healthz` endpoint for healthchecks, and no second web server (an earlier
nginx-for-static idea was rejected as redundant given Caddy is already present).

The deployment target is an Oracle Cloud ARM (Ampere) instance running Docker /
Docker Compose. Deployment is **manual**: on the server, `git pull` then
`docker compose up -d --build` (build and run happen on the server, native arm64).
See `docs/deploy.md`.

## Considered Options

- **Next standalone Node container behind Caddy (chosen)** — one tool/topology
  (everything is a container Caddy proxies to), clean `reverse_proxy` target, real
  healthz endpoint; cost is a long-lived Node process vs. pure file serving.
- **Keep `output: 'export'`, existing Caddy serves files via `file_server`** —
  lightest runtime, honors the original static intent; rejected because it requires
  adding a shared-volume mount to the already-running Caddy container (more intrusive
  to existing infra) and a less uniform deploy ("replace files in a volume").
- **`output: 'export'`, separate nginx container serves the static files** —
  rejected as a redundant second web server when Caddy is already the proxy.

## Consequences

- **Runtime model change only — data guarantees are unchanged.** Photos are still
  processed 100% client-side, there is still **no server storage / backend database**
  and **no analytics backend** (client event emission only; ADR-0011 later wires
  that client emission to Firebase GA4 without changing this guarantee). What
  changes is _how the app is served_ (static hosting → Node standalone container),
  not how user data flows. `/api/healthz` is a stateless endpoint that returns 200 and handles no user
  data.
- **`next.config.ts` switches** `output: 'export'` → `'standalone'`; `yarn build`
  now emits `.next/standalone/server.js` instead of `out/`.
- **E2E harness must change.** `e2e/run.mjs`/`helpers.mjs` served the static `out/`
  directory; they move to launching the standalone Node server.
- **A new `/api/healthz` route** is introduced for container/Caddy healthchecks.
- **Caddy stays manually configured** — a `reverse_proxy buddybird-mbti-web:3000`
  block is added to the existing Caddyfile and reloaded; the Caddy container itself
  is not modified.
- **Container reachability** depends on `ENV HOSTNAME=0.0.0.0` (the standalone server
  otherwise binds localhost and is unreachable from the `proxy` network).
- This record supersedes the "정적 배포" wording in `AGENTS.md` and `PRD.md`
  (non-functional section); the data-privacy / out-of-scope items there remain valid.
