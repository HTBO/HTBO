# --- Build Stage ---
FROM node:22-alpine AS build

# Enable pnpm
RUN corepack enable

# Set the working directory inside the container
WORKDIR /app

COPY /frontend/package.json .
COPY pnpm-lock.yaml .

# Install dependencies
RUN pnpm install

# Copy the necessary files
COPY frontend/. .

# Build the application
RUN pnpm run build

# --- Production Stage ---
FROM node:22-slim

WORKDIR /app

# Copy necessary files from the builder stage
COPY --from=build /app/.output ./

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["node", "/app/server/index.mjs"]