# syntax=docker/dockerfile:1
# Next.js 16 standalone 멀티스테이지 빌드 (output: "standalone").
FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

# ── deps: 의존성만 설치 (캐시 레이어) ──
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile

# ── builder: 빌드 ──
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# DATABASE_URL 은 빌드 시 prisma generate 에만 필요 (migrate deploy 는 런타임에서)
RUN pnpm prisma generate && pnpm next build

# ── runner: 최소 런타임 ──
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=17900
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# prisma 스키마/엔진 (런타임 migrate deploy 용)
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs
EXPOSE 17900
CMD ["node", "server.js"]
