FROM node:18-alpine
RUN corepack enable

WORKDIR /app

# Correct paths relative to root context
COPY backend/package.json .
COPY pnpm-lock.yaml* .

RUN pnpm install --frozen-lockfile
COPY backend/ .

EXPOSE $PORT
CMD ["pnpm", "start"]