# 🔧 Environment Variables Setup

**Important:** Each service loads `.env` from its own directory, NOT from the root!

## 📁 `RevrPay/server/.env`

**Location:** `C:\Users\sulay\OneDrive\Documents\RevrPay\server\.env`

```env
# x402 Configuration
ADDRESS=0x_YOUR_WALLET_ADDRESS_HERE
NETWORK=base-sepolia
FACILITATOR_URL=https://x402.org/facilitator
PORT=3001

# Supabase (REQUIRED)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Analysis Engine
ANALYSIS_ENGINE_URL=http://localhost:3002
RISK_THRESHOLD=75
```

## 📁 `RevrPay/merchant-frontend/.env`

**Location:** `C:\Users\sulay\OneDrive\Documents\RevrPay\merchant-frontend\.env`

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# API Base URL
VITE_API_BASE_URL=http://localhost:3001
```

## 📁 `RevrPay/analysis-engine/.env`

**Location:** `C:\Users\sulay\OneDrive\Documents\RevrPay\analysis-engine\.env`

```env
# Server
PORT=3002
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:5173,http://localhost:5174

# Basescan API (Note: Code uses ETHERSCAN_API_KEY)
ETHERSCAN_API_KEY=your_basescan_api_key_here

# ML Service
ML_SERVICE_URL=http://localhost:3003
ENABLE_ML=true

# MetaSleuth AML (Optional)
METASLEUTH_API_KEY=your_metasleuth_api_key_here
ENABLE_METASLEUTH=false
```

## 📁 `RevrPay/ml-service/.env` (Optional)

**Location:** `C:\Users\sulay\OneDrive\Documents\RevrPay\ml-service\.env`

```env
PORT=3003
MODEL_VERSION=1.0.0
AUTO_RETRAIN=true
MIN_TRAINING_SAMPLES=1000
```

## 📁 `RevrPay/facilitator/.env` (Optional - for local facilitator)

**Location:** `C:\Users\sulay\OneDrive\Documents\RevrPay\facilitator\.env`

**Note:** This is only needed if you want to run your own facilitator. The project uses `https://x402.org/facilitator` by default.

```env
# At least one of these is required (EVM or SVM)
EVM_PRIVATE_KEY=0x_your_ethereum_private_key_here
SVM_PRIVATE_KEY=your_solana_private_key_here

# Optional
PORT=3000
```

---

## 🔑 Where to Get API Keys

### Supabase Keys

1. Go to [supabase.com](https://supabase.com)
2. Create project → Settings → API
3. Copy: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

### Basescan API Key

1. Go to [basescan.org](https://basescan.org)
2. Create account → API-KEYs section
3. Create API key
4. Add to `analysis-engine/.env` as `ETHERSCAN_API_KEY`

### MetaSleuth API Key (Optional)

- Contact BlockSec for API access
- Add to `analysis-engine/.env` as `METASLEUTH_API_KEY`

---

## ✅ Quick Checklist

- [ ] `server/.env` created with wallet address and Supabase keys
- [ ] `merchant-frontend/.env` created with Supabase keys
- [ ] `analysis-engine/.env` created with Basescan API key
- [ ] `ml-service/.env` created (optional)
- [ ] `facilitator/.env` created (optional - only if running local facilitator)
