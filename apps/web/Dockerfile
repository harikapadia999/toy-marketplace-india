# Web Frontend
FROM node:20-alpine AS web-builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/*/package.json ./packages/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build web app
RUN pnpm build --filter=web

# Production image
FROM node:20-alpine AS web-runner

WORKDIR /app

ENV NODE_ENV=production

# Copy built files
COPY --from=web-builder /app/apps/web/.next ./apps/web/.next
COPY --from=web-builder /app/apps/web/public ./apps/web/public
COPY --from=web-builder /app/apps/web/package.json ./apps/web/
COPY --from=web-builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "apps/web/.next/standalone/server.js"]
