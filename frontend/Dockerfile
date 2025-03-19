# --- Build Stage ---
FROM node:22.11.0-alpine AS builder
RUN corepack enable

WORKDIR /app

# Copy package files
COPY package.json ../pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy the rest of the application
COPY . .

# Build the application
RUN pnpm run build

# --- Production Stage ---
FROM node:22.11.0-alpine
WORKDIR /app

# Copy necessary files from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.output ./
COPY --from=builder /app/package.json ./package.json

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["node", ".output/server/index.mjs"]