# Build from root directory: docker build -f Dockerfile -t zappay-server .
FROM node:20-alpine AS builder

# Install pnpm for x402-packages
RUN npm install -g pnpm

WORKDIR /app

# Copy root package.json
COPY package.json ./

# Copy and build x402-packages first
COPY x402-packages ./x402-packages
WORKDIR /app/x402-packages
RUN pnpm install
RUN NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter=x402 build && \
    pnpm --filter=x402-hono build && \
    pnpm --filter=x402-axios build

# Now build server
WORKDIR /app/server


COPY server/package*.json ./
COPY server/tsconfig.json ./

RUN npm ci

COPY server/ ./


RUN npm run build

FROM node:20-alpine

# Install pnpm for x402-packages dependencies
RUN npm install -g pnpm

WORKDIR /app

# Maintain directory structure for file: dependencies
# x402-packages must be at /app/x402-packages (relative to server)
RUN mkdir -p x402-packages/packages
COPY --from=builder /app/x402-packages/packages/x402 ./x402-packages/packages/x402
COPY --from=builder /app/x402-packages/packages/x402-hono ./x402-packages/packages/x402-hono

# Install x402's production dependencies first (x402-hono depends on it)
WORKDIR /app/x402-packages/packages/x402
COPY --from=builder /app/x402-packages/packages/x402/package.json ./package.json
RUN pnpm install --prod

# Install x402-hono's production dependencies
# x402-hono needs viem, hono, zod, etc. at runtime
WORKDIR /app/x402-packages/packages/x402-hono
COPY --from=builder /app/x402-packages/packages/x402-hono/package.json ./package.json
RUN pnpm install --prod

# Server directory structure (package.json expects file:../x402-packages)
WORKDIR /app/server

# Copy server package files
COPY server/package*.json ./

# Install production dependencies
# The file: protocol will resolve ../x402-packages from /app/server
RUN npm ci --production

# Copy built server dist
COPY --from=builder /app/server/dist ./dist

EXPOSE 3001

# Start server from server directory
CMD ["node", "dist/index.js"]

