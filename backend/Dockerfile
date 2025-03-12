FROM node:18-alpine
# Enable pnpm
RUN corepack enable
# Set build-time args (e.g., PORT from .env)
ENV PORT=$PORT
WORKDIR /app
# Copy dependencies
COPY package.json pnpm-lock.yaml* ./
# Install deps with pnpm
RUN pnpm install --frozen-lockfile
# Copy app source
COPY . .
# Expose and use PORT from .env
EXPOSE $PORT
# Run the "start" script from package.json
CMD ["pnpm", "start"]