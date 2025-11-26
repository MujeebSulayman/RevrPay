# This Dockerfile is for building from server/ directory
# For Railway/Render: Use root Dockerfile instead (build from repo root)
# For local testing from server/: This won't work due to x402-packages dependency
# Use the root Dockerfile: docker build -f Dockerfile -t revrpay-server .

FROM node:20-alpine

WORKDIR /app

# Note: This Dockerfile assumes x402-packages are already built
# For proper deployment, use the root Dockerfile which builds everything

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3001

# Start server
CMD ["npm", "start"]

