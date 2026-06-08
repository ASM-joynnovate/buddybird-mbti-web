# Multi-stage build for the Next standalone server (ADR-0002).
# Built natively on the arm64 (Oracle Ampere) host — no cross-arch/QEMU needed.

FROM node:24-alpine AS base
WORKDIR /app
# Yarn 4.16.0 is pinned via .yarnrc.yml (yarnPath → .yarn/releases). Corepack
# exposes the `yarn` launcher; if a future base image drops corepack, replace
# this with `RUN npm i -g yarn@4.16.0`.
RUN corepack enable

# --- deps: install with the immutable lockfile -----------------------------
# NODE_ENV is intentionally NOT set to production here so devDependencies
# (next build toolchain: typescript, tailwind, postcss) are installed.
FROM base AS deps
COPY .yarnrc.yml package.json yarn.lock ./
COPY .yarn ./.yarn
RUN yarn install --immutable

# --- builder: produce .next/standalone -------------------------------------
FROM base AS builder
# Firebase web config (ADR-0011). NEXT_PUBLIC_* values are inlined at BUILD time,
# so they must be present here (passed via docker-compose build.args from the
# server-side .env). Empty values are valid: Firebase stays disabled and the app
# falls back to the console analytics adapter (next build prints a warning).
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID
ARG NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY \
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN \
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID \
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET \
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID \
    NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID \
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=$NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/.yarn ./.yarn
COPY . .
RUN yarn build

# --- runner: minimal standalone server -------------------------------------
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# HOSTNAME=0.0.0.0 is REQUIRED — otherwise the standalone server binds localhost
# and is unreachable from the Caddy `proxy` network. PORT mirrors the default.
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# server.js does not bundle public/.next/static — copy them in (Next docs).
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# 127.0.0.1 (not localhost): the server binds IPv4 0.0.0.0, but `localhost`
# resolves to IPv6 ::1 in the container → connection refused. Trailing slash is
# the canonical URL under trailingSlash:true (/api/healthz 308-redirects, which
# busybox wget will not follow).
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1:3000/api/healthz/ || exit 1

CMD ["node", "server.js"]
