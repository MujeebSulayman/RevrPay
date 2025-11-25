# Backend Deployment Guide

This guide covers deploying the ZapPay backend server with x402 facilitator support.

## 🎯 Quick Deploy Options

### Option 1: Railway (Recommended - Easiest)

1. **Sign up**: https://railway.app
2. **New Project** → **Deploy from GitHub**
3. **Select your repo** → **Add Service**
4. **IMPORTANT**: Do NOT set Root Directory - build from repo root (Railway will use `railway.json`)
5. **Add Environment Variables**:
   ```env
   ADDRESS=0x_YOUR_WALLET_ADDRESS
   NETWORK=base-sepolia
   FACILITATOR_URL=https://x402.org/facilitator
   PORT=3001
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ANALYSIS_ENGINE_URL=http://your-analysis-engine-url:3002
   CORS_ORIGINS=https://your-frontend-domain.com,https://your-merchant-dashboard.com
   ```
6. **Deploy** - Railway auto-detects Node.js and runs build

**Note**: Railway will:

- Install pnpm globally
- Run `npm install` (root dependencies)
- Run `npm run build:x402` (builds x402-packages)
- Run `cd server && npm install && npm run build` (builds server)
- Run `cd server && npm start` (starts server)

The `railway.json` in `server/` directory handles this automatically.

### Option 2: Render

1. **Sign up**: https://render.com
2. **New** → **Web Service**
3. **Connect GitHub** → Select your repo
4. **Settings**:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. **Add Environment Variables** (same as Railway above)
6. **Deploy**

### Option 3: Fly.io

1. **Install Fly CLI**: `npm install -g @fly/cli`
2. **Login**: `fly auth login`
3. **Initialize**: `cd server && fly launch`
4. **Set secrets**:
   ```bash
   fly secrets set ADDRESS=0x_YOUR_WALLET_ADDRESS
   fly secrets set NETWORK=base-sepolia
   fly secrets set FACILITATOR_URL=https://x402.org/facilitator
   fly secrets set SUPABASE_URL=your_supabase_url
   fly secrets set SUPABASE_ANON_KEY=your_anon_key
   fly secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```
5. **Deploy**: `fly deploy`

### Option 4: Docker (Any Platform)

The `Dockerfile` is already created. Deploy to:

- **AWS ECS/Fargate**
- **Google Cloud Run**
- **Azure Container Instances**
- **DigitalOcean App Platform**
- **Any Docker host**

**Build & Run Locally**:

```bash
# Build from repo root (not server directory)
docker build -f Dockerfile -t zappay-server .
docker run -p 3001:3001 --env-file server/.env zappay-server
```

**Note**: The root `Dockerfile` builds x402-packages first, then the server. The `server/Dockerfile` is for reference only and won't work standalone due to x402-packages dependency.

## 🔧 Environment Variables

### Required

| Variable                    | Description                                | Example                   |
| --------------------------- | ------------------------------------------ | ------------------------- |
| `ADDRESS`                   | Your wallet address for receiving payments | `0x1234...`               |
| `SUPABASE_URL`              | Your Supabase project URL                  | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY`         | Supabase anonymous key                     | `eyJhbGc...`              |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key                  | `eyJhbGc...`              |

### Optional (with defaults)

| Variable              | Default                         | Description                     |
| --------------------- | ------------------------------- | ------------------------------- |
| `FACILITATOR_URL`     | `https://x402.org/facilitator`  | x402 facilitator service        |
| `NETWORK`             | `base-sepolia`                  | Blockchain network              |
| `PORT`                | `3001`                          | Server port                     |
| `ANALYSIS_ENGINE_URL` | -                               | Risk analysis service URL       |
| `CORS_ORIGINS`        | `localhost:5173,localhost:5174` | Comma-separated allowed origins |

## 🌐 x402 Facilitator

**Important**: The x402 facilitator is an **external service**. You don't need to deploy it.

- **Testnet**: `https://x402.org/facilitator` (default)
- **Production**: `https://api.cdp.coinbase.com/platform/v2/x402`

The facilitator handles:

- Payment verification
- Transaction settlement
- Session token generation

Your server just needs to:

1. Set `FACILITATOR_URL` in environment
2. Include facilitator URL in 402 response headers
3. The x402-hono middleware handles the rest

## 📝 Pre-Deployment Checklist

- [ ] Update `ADDRESS` to production wallet
- [ ] Set `CORS_ORIGINS` to your frontend domains
- [ ] Update `SUPABASE_*` keys (use production Supabase project)
- [ ] Set `NETWORK` to production network (if not testnet)
- [ ] Update `ANALYSIS_ENGINE_URL` if using fraud detection
- [ ] Test build locally: `npm run build && npm start`

## 🔍 Post-Deployment

1. **Check health endpoint**: `https://your-api.com/api/health`
2. **Test payment endpoint**: Try a 402 response
3. **Monitor logs** for errors
4. **Update frontend** `VITE_API_BASE_URL` to your deployed URL

## 🐛 Troubleshooting

**Build fails**:

- Ensure `x402-packages` are built first
- Check Node.js version (18+)

**402 payments not working**:

- Verify `FACILITATOR_URL` is correct
- Check wallet address is valid for network
- Ensure facilitator service is accessible

**CORS errors**:

- Add your frontend domain to `CORS_ORIGINS`
- Format: `https://domain.com,https://www.domain.com`

**Supabase errors**:

- Verify all three Supabase keys are set
- Check RLS policies are configured
- Ensure database migration ran

## 📚 Additional Resources

- [Railway Docs](https://docs.railway.app)
- [Render Docs](https://render.com/docs)
- [Fly.io Docs](https://fly.io/docs)
- [x402 Protocol](https://x402.org)
