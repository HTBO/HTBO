# Use Node.js 22 Alpine image
FROM node:22-alpine

# Install dependencies required for pnpm and native modules (if any)
RUN apk add --no-cache python3 make g++

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy root package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Copy backend package.json
COPY backend/package.json ./backend/package.json

# Install production dependencies for the backend using pnpm
RUN pnpm install --filter htbo-backend --prod

# Copy the rest of the backend source code
COPY backend/ ./backend/

# Set working directory to the backend
WORKDIR /app/backend

# Start the application
CMD ["node", "src/server.js"]