# --- Build Stage ---
FROM node:22.11.0-alpine AS builder
WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY frontend/package.json frontend/

RUN pnpm install --frozen-lockfile --prod

COPY frontend/ ./

RUN pnpm run build

# --- Production Stage ---
FROM node:22.11.0-alpine
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.output ./
COPY --from=builder /app/frontend/package.json ./package.json

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]