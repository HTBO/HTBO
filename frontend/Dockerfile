# --- Build Stage ---
FROM node:18-alpine AS builder

# Enable pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# COPY package.json .
# COPY pnpm-lock.yaml .

# Install dependencies

# Copy the rest of the application
COPY frontend/. .
# RUN pnpm install --frozen-lockfile

# Build the application

WORKDIR /app
RUN pnpm install
RUN pnpm run build

# --- Production Stage ---
FROM node:18-alpine
WORKDIR /app

# Copy necessary files from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.output ./
COPY --from=builder /app/package.json ./package.json

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["node", ".output/server/index.mjs"]