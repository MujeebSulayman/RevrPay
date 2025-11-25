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

# Copy server package files
COPY server/package*.json ./
COPY server/tsconfig.json ./

# Install server dependencies (this will link to built x402-hono)
RUN npm ci

# Copy server source code
COPY server/ ./

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Maintain directory structure for file: dependencies
# Create x402-packages structure and copy only needed built packages
RUN mkdir -p x402-packages/packages
COPY --from=builder /app/x402-packages/packages/x402 ./x402-packages/packages/x402
COPY --from=builder /app/x402-packages/packages/x402-hono ./x402-packages/packages/x402-hono

# Copy server package files
COPY server/package*.json ./

# Install production dependencies only
# The file: protocol will work because x402-packages structure is maintained
RUN npm ci --production

# Copy built server
COPY --from=builder /app/server/dist ./dist

# Expose port
EXPOSE 3001

# Start server
CMD ["npm", "start"]

