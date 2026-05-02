# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# Stage 2: Production
FROM node:22-alpine AS runner

WORKDIR /app

# Only copy production dependencies
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist

# Standard security practice: run as non-root user
USER node

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "dist/server.js"]
