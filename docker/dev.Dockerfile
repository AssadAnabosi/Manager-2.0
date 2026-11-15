# Development image for the whole monorepo (API + web). Not used for production.
# Debian-based on purpose: workerd (Wrangler's local runtime) needs glibc, so never alpine.
FROM oven/bun:1

# Wrangler must run on Node.js: under Bun it cannot forward requests to the local Worker.
COPY --from=node:22-slim /usr/local/bin/node /usr/local/bin/node

WORKDIR /app

# Install dependencies first so this layer is cached until a manifest or the lockfile changes.
COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/landing/package.json apps/landing/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN bun install --frozen-lockfile

COPY . .

ENV WRANGLER_SEND_METRICS=false \
    CI=1
