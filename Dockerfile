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

WORKDIR /app


RUN mkdir -p x402-packages/packages
COPY --from=builder /app/x402-packages/packages/x402 ./x402-packages/packages/x402
COPY --from=builder /app/x402-packages/packages/x402-hono ./x402-packages/packages/x402-hono


COPY server/package*.json ./

RUN npm ci --production

COPY --from=builder /app/server/dist ./dist


EXPOSE 3001

CMD ["node", "dist/index.js"]

