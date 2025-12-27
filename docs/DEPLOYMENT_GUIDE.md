# 🚀 Toy Marketplace India - Deployment Guide

Complete guide to deploy the Toy Marketplace India platform to production.

---

## 📋 **Prerequisites**

- GitHub account
- Vercel account
- Railway/Render account
- Neon/Supabase account
- Cloudinary account
- Razorpay account
- Domain name (optional)

---

## 🌐 **1. Deploy Web Frontend (Vercel)**

### **Step 1: Connect Repository**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Select `toy-marketplace-india`

### **Step 2: Configure Build Settings**

```bash
# Framework Preset
Next.js

# Root Directory
apps/web

# Build Command
cd ../.. && pnpm build --filter=web

# Output Directory
.next

# Install Command
pnpm install
```

### **Step 3: Environment Variables**

Add these in Vercel dashboard:

```env
NEXT_PUBLIC_API_URL=https://api.toymarketplace.in/api
NEXT_PUBLIC_RAZORPAY_KEY=rzp_live_xxxxx
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

### **Step 4: Deploy**

Click "Deploy" and wait for build to complete.

### **Step 5: Custom Domain (Optional)**

1. Go to Project Settings → Domains
2. Add your domain: `toymarketplace.in`
3. Configure DNS records as shown

---

## 🔧 **2. Deploy Backend API (Railway)**

### **Step 1: Create Project**

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose `toy-marketplace-india`

### **Step 2: Configure Service**

```bash
# Root Directory
apps/api

# Build Command
pnpm build

# Start Command
pnpm start

# Port
3001
```

### **Step 3: Environment Variables**

Add these in Railway dashboard:

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
FRONTEND_URL=https://toymarketplace.in
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_secret
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

### **Step 4: Deploy**

Railway will auto-deploy on push to main branch.

### **Step 5: Custom Domain**

1. Go to Settings → Domains
2. Add custom domain: `api.toymarketplace.in`
3. Configure DNS CNAME record

---

## 🗄️ **3. Setup Database (Neon)**

### **Step 1: Create Database**

1. Go to [Neon Console](https://console.neon.tech)
2. Click "Create Project"
3. Name: `toy-marketplace-prod`
4. Region: Choose closest to your users

### **Step 2: Get Connection String**

Copy the connection string:
```
postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb
```

### **Step 3: Run Migrations**

```bash
# Install dependencies
pnpm install

# Generate migration
cd packages/database
pnpm db:generate

# Push to database
pnpm db:push
```

### **Step 4: Seed Data (Optional)**

```bash
pnpm db:seed
```

---

## 📱 **4. Deploy Mobile App (EAS Build)**

### **Step 1: Install EAS CLI**

```bash
npm install -g eas-cli
```

### **Step 2: Login to Expo**

```bash
eas login
```

### **Step 3: Configure EAS**

Create `apps/mobile/eas.json`:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api.toymarketplace.in/api"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### **Step 4: Build for iOS**

```bash
cd apps/mobile

# Build
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

### **Step 5: Build for Android**

```bash
# Build
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

---

## ☁️ **5. Setup Cloudinary (Images)**

### **Step 1: Create Account**

1. Go to [Cloudinary](https://cloudinary.com)
2. Sign up for free account
3. Go to Dashboard

### **Step 2: Get Credentials**

Copy these values:
- Cloud Name
- API Key
- API Secret

### **Step 3: Configure Upload Preset**

1. Go to Settings → Upload
2. Create unsigned upload preset
3. Name: `toy-marketplace`
4. Folder: `toys`

### **Step 4: Add to Environment**

```env
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_UPLOAD_PRESET=toy-marketplace
```

---

## 💳 **6. Setup Razorpay (Payments)**

### **Step 1: Create Account**

1. Go to [Razorpay](https://razorpay.com)
2. Sign up and complete KYC
3. Go to Dashboard

### **Step 2: Get API Keys**

1. Go to Settings → API Keys
2. Generate Live Keys
3. Copy Key ID and Key Secret

### **Step 3: Configure Webhooks**

1. Go to Settings → Webhooks
2. Add webhook URL: `https://api.toymarketplace.in/api/webhooks/razorpay`
3. Select events:
   - payment.captured
   - payment.failed
   - order.paid

### **Step 4: Add to Environment**

```env
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_secret
NEXT_PUBLIC_RAZORPAY_KEY=rzp_live_xxxxx
```

---

## 📧 **7. Setup Email (Resend)**

### **Step 1: Create Account**

1. Go to [Resend](https://resend.com)
2. Sign up for account
3. Verify domain

### **Step 2: Get API Key**

1. Go to API Keys
2. Create new key
3. Copy API key

### **Step 3: Add to Environment**

```env
RESEND_API_KEY=re_xxxxx
FROM_EMAIL=noreply@toymarketplace.in
```

---

## 📱 **8. Setup SMS (MSG91)**

### **Step 1: Create Account**

1. Go to [MSG91](https://msg91.com)
2. Sign up and verify
3. Add credits

### **Step 2: Get Auth Key**

1. Go to Settings
2. Copy Auth Key

### **Step 3: Add to Environment**

```env
MSG91_AUTH_KEY=xxxxx
MSG91_SENDER_ID=TOYMKT
```

---

## 🔒 **9. Security Configuration**

### **SSL/TLS Certificates**

Vercel and Railway provide automatic SSL.

### **CORS Configuration**

Update `apps/api/src/app.ts`:

```typescript
app.use('*', cors({
  origin: [
    'https://toymarketplace.in',
    'https://www.toymarketplace.in',
  ],
  credentials: true,
}));
```

### **Rate Limiting**

Add to `apps/api/src/middleware/rateLimit.ts`:

```typescript
import { rateLimiter } from 'hono-rate-limiter';

export const rateLimit = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
```

### **Security Headers**

Add to `apps/api/src/middleware/security.ts`:

```typescript
import { secureHeaders } from 'hono/secure-headers';

app.use('*', secureHeaders());
```

---

## 📊 **10. Monitoring & Analytics**

### **Sentry (Error Tracking)**

```bash
# Install
pnpm add @sentry/nextjs @sentry/node

# Configure
SENTRY_DSN=https://xxx@sentry.io/xxx
```

### **Google Analytics**

```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### **Mixpanel**

```env
NEXT_PUBLIC_MIXPANEL_TOKEN=xxxxx
```

---

## 🧪 **11. Testing Deployment**

### **Web Frontend**

```bash
# Test homepage
curl https://toymarketplace.in

# Test API connection
curl https://toymarketplace.in/api/health
```

### **Backend API**

```bash
# Health check
curl https://api.toymarketplace.in/api/health

# Test auth
curl -X POST https://api.toymarketplace.in/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### **Database**

```bash
# Connect to database
psql $DATABASE_URL

# Check tables
\dt
```

---

## 🔄 **12. CI/CD Pipeline**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 9
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run tests
        run: pnpm test
      
      - name: Build
        run: pnpm build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 📝 **13. Post-Deployment Checklist**

- [ ] Web frontend accessible
- [ ] Mobile app builds successfully
- [ ] API endpoints responding
- [ ] Database connected
- [ ] Authentication working
- [ ] Payments processing
- [ ] Images uploading
- [ ] Emails sending
- [ ] SMS sending
- [ ] Error tracking active
- [ ] Analytics tracking
- [ ] SSL certificates valid
- [ ] Custom domains configured
- [ ] Backups configured

---

## 🆘 **14. Troubleshooting**

### **Build Failures**

```bash
# Clear cache
pnpm store prune

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### **Database Connection Issues**

```bash
# Test connection
psql $DATABASE_URL

# Check SSL mode
DATABASE_URL="postgresql://...?sslmode=require"
```

### **API Not Responding**

```bash
# Check logs
railway logs

# Restart service
railway restart
```

---

## 📞 **15. Support**

- **Documentation**: https://docs.toymarketplace.in
- **Email**: support@toymarketplace.in
- **GitHub Issues**: https://github.com/harikapadia999/toy-marketplace-india/issues

---

## 🎉 **Deployment Complete!**

Your Toy Marketplace India is now live! 🧸🇮🇳✨

**Next Steps:**
1. Test all features
2. Monitor errors
3. Gather user feedback
4. Iterate and improve

**Happy Selling!** 🚀
