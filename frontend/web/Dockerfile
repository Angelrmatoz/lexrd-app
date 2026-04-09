# ──────────────────────────────────────────────────────────────
# Dockerfile — LexRD Frontend Web (Next.js 16)
# Multi-stage: deps → packages → builder → runner (prod) + dev
# ──────────────────────────────────────────────────────────────

# ── STAGE 1: Install dependencies ─────────────────────────────
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./
COPY packages/ui/package.json ./packages/ui/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY frontend/web/package.json ./frontend/web/

RUN pnpm install --frozen-lockfile

# ── STAGE 2: Build @repo/ui (dependency de web) ───────────────
FROM node:20-alpine AS packages

RUN apk add --no-cache libc6-compat pnpm

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/frontend/web/node_modules ./frontend/web/node_modules
COPY --from=deps /app/packages/ui/node_modules ./packages/ui/node_modules
COPY packages/ ./packages/
COPY package.json pnpm-workspace.yaml turbo.json ./

WORKDIR /app/packages/ui
RUN pnpm build

# ── STAGE 3: Build Next.js (standalone output) ────────────────
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat pnpm

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/frontend/web/node_modules ./frontend/web/node_modules
COPY --from=deps /app/packages/ui/node_modules ./packages/ui/node_modules
COPY --from=packages /app/packages/ui ./packages/ui
COPY --from=packages /app/packages/typescript-config ./packages/typescript-config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY frontend/web/ ./frontend/web/

WORKDIR /app/frontend/web

RUN pnpm build

# ── STAGE 4: Runner (producción - standalone ligero) ──────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copiar el output standalone (incluye node_modules necesarios y el código)
COPY --from=builder /app/frontend/web/.next/standalone ./
# Los archivos estáticos y públicos NO se incluyen en standalone por defecto,
# deben copiarse manualmente a la ruta donde Next.js los espera dentro de la estructura del monorepo
COPY --from=builder /app/frontend/web/.next/static ./frontend/web/.next/static
COPY --from=builder /app/frontend/web/public ./frontend/web/public

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# En un monorepo, el server.js se genera dentro de la carpeta del paquete correspondiente
CMD ["node", "frontend/web/server.js"]

# ── STAGE 5: Desarrollo (hot reload con Webpack) ───────────
FROM node:20-alpine AS dev

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN pnpm config set store-dir /pnpm-store

EXPOSE 3000

CMD ["sh", "-c", "pnpm install && pnpm dev --filter=web"]
