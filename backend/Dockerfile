FROM node:18-alpine
RUN corepack enable

WORKDIR /app

COPY package.json ../pnpm-lock.yaml* ./

RUN pnpm install --frozen-lockfile
COPY . .

EXPOSE $PORT
CMD ["pnpm", "start"]