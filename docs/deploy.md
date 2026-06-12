# Deployment

앵BTI ships as a **Next standalone Node container** behind the **Caddy
reverse proxy that already runs on the server** (see `docs/adr/0002`). Deployment
is **manual**: build and run the container on the server with Docker Compose; the
existing Caddy reverse-proxies the domain to it.

```
existing Caddy (proxy network) ── reverse_proxy ──▶ buddybird-mbti-web:3000
```

The app serves nothing user-private from the server: photos are processed 100%
client-side and there is no database (ADR-0002). `/api/healthz/` is a stateless
200 endpoint used only for healthchecks.

---

## 1. Server prerequisites (one-time)

On the Oracle Cloud ARM (Ampere) instance:

1.  **Docker + Compose v2** installed; the deploy user can run docker without sudo:
    ```bash
    sudo usermod -aG docker "$USER"   # then re-login
    docker compose version
    ```
2.  **The `proxy` network exists** (the Caddy container already uses it):
    ```bash
    docker network inspect proxy >/dev/null 2>&1 || docker network create proxy
    ```
3.  **Clone the repo** at a stable path:
    ```bash
    git clone https://github.com/ASM-joynnovate/buddybird-mbti-web.git /opt/buddybird-mbti
    ```
4.  **Analytics web config** (Firebase ADR-0011, Clarity ADR-0015): create a
    `.env` file next to `docker-compose.yml` (compose loads it automatically and
    passes the values as build args). Copy the keys from `.env.example` and fill
    in the values from the Firebase console (Project settings → Your apps → Web
    app) and the Clarity dashboard (Settings → Overview → Project ID):

        ```bash
        cd /opt/buddybird-mbti
        cp .env.example .env
        vi .env   # fill in all seven NEXT_PUBLIC_FIREBASE_* values
                  # plus NEXT_PUBLIC_CLARITY_PROJECT_ID
        ```

        ⚠️ `NEXT_PUBLIC_*` values are **frozen into the bundle at build time**. If the
        `.env` is missing or incomplete, the build succeeds but ships with analytics
        **silently OFF** (the build log prints `[build] NEXT_PUBLIC_FIREBASE_*

    not set`/`[build] NEXT_PUBLIC_CLARITY_PROJECT_ID not set` warnings). After
    every deploy, confirm events arrive in the GA4 Realtime report and a new
    recording appears in the Clarity dashboard.

## 2. Caddy reverse proxy (one-time)

The existing Caddy is configured **manually**. Add a site block to its Caddyfile
pointing at the container name on the `proxy` network:

```caddyfile
mbti.example.com {
    reverse_proxy buddybird-mbti-web:3000
}
```

Replace `mbti.example.com` with the real domain. Then reload Caddy without
downtime (adjust the container name / Caddyfile path to your setup):

```bash
docker exec <caddy_container> caddy reload --config /etc/caddy/Caddyfile
```

Caddy and `buddybird-mbti-web` must share the `proxy` network — the compose stack
joins it as an external network, so no host port is published.

---

## Deploying

On the server, from the repo directory:

```bash
cd /opt/buddybird-mbti
git pull origin main
docker compose up -d --build
```

This builds the image natively (arm64), recreates the container, and joins it to
the `proxy` network. Verify it came up healthy:

```bash
docker compose ps                 # STATUS should show (healthy)
docker inspect --format '{{.State.Health.Status}}' buddybird-mbti-web
```

To reclaim space from old image layers after a few deploys:

```bash
docker image prune -f
```

## Troubleshooting

- **Caddy 502 / can't reach container:** confirm both Caddy and
  `buddybird-mbti-web` are on the `proxy` network (`docker network inspect proxy`),
  and that the container is `healthy` (`docker compose ps`).
- **Container never healthy:** `docker logs buddybird-mbti-web`. The healthcheck
  hits `http://127.0.0.1:3000/api/healthz/` (IPv4 + trailing slash are both
  required).
- **Build fails on the server:** the image build runs `yarn install` (network) and
  `yarn build`; ensure the host has internet egress and enough memory.
