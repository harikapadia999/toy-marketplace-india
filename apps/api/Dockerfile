# API Backend
FROM node:20-alpine AS api-builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/*/package.json ./packages/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build API
RUN pnpm build --filter=api

# Production image
FROM node:20-alpine AS api-runner

WORKDIR /app

ENV NODE_ENV=production

# Copy built files
COPY --from=api-builder /app/apps/api/dist ./apps/api/dist
COPY --from=api-builder /app/apps/api/package.json ./apps/api/
COPY --from=api-builder /app/node_modules ./node_modules
COPY --from=api-builder /app/packages ./packages

EXPOSE 3001

CMD ["node", "apps/api/dist/index.js"]
