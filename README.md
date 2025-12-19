# 🧸 Toy Marketplace India

> A modern, full-stack platform for buying, selling, and reselling kids toys in India. Built with the latest 2025 tech stack.

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-24.12-green)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17.1-blue)](https://www.postgresql.org/)

## 🌟 Features

### For Parents (Buyers)
- 🔍 **Smart Search** - Find toys by age, brand, condition, price
- 📍 **Hyperlocal Discovery** - Find toys in your neighborhood
- 💰 **Best Prices** - Save 40-70% on gently used toys
- ✅ **Safety First** - Verified sellers, quality checks, recall alerts
- 💬 **Direct Chat** - Message sellers, negotiate prices
- 🎁 **Wishlist** - Save toys for later
- 🌱 **Eco-Friendly** - Track your carbon footprint savings

### For Sellers
- 📸 **Quick Listing** - Upload photos, auto-detect toy details
- 💵 **Fair Pricing** - AI-powered price suggestions
- 📦 **Easy Shipping** - Integrated with Shiprocket, Delhivery
- 💳 **Instant Payouts** - UPI, bank transfer
- 📊 **Analytics** - Track views, favorites, sales
- 🏆 **Seller Ratings** - Build trust, get verified badge

### Platform Features
- 🔐 **Secure Payments** - Razorpay integration (UPI, Cards, Wallets)
- 📱 **Mobile Apps** - iOS & Android (React Native + Expo)
- 🌐 **Multi-language** - Hindi, English, Tamil, Telugu, Bengali
- 🎯 **Smart Recommendations** - ML-powered suggestions
- 🔔 **Real-time Notifications** - WhatsApp, Push, Email
- 🛡️ **Fraud Protection** - Aadhaar verification, escrow system

## 🏗️ Tech Stack

### Frontend
- **Web**: Next.js 15.1, React 19, TypeScript 5.8, Tailwind CSS 4.0
- **Mobile**: React Native 0.77, Expo SDK 52, NativeWind 4.0
- **State**: TanStack Query v5, Zustand 5.x
- **UI**: Radix UI, shadcn/ui, Lucide Icons

### Backend
- **Runtime**: Node.js 24.12 LTS (Krypton)
- **Framework**: Hono 4.11 (10× faster than Express)
- **Language**: TypeScript 5.8
- **API**: RESTful + tRPC for type-safety

### Database & Storage
- **Database**: PostgreSQL 17.1
- **ORM**: Drizzle ORM 0.38 (lightweight, fast)
- **Cache**: Redis 7.4
- **Storage**: Cloudinary (images), AWS S3 (backups)
- **Search**: Meilisearch (fast, typo-tolerant)

### Infrastructure
- **Hosting**: Vercel (web), Railway (API), Neon (DB)
- **CDN**: Cloudflare
- **Monitoring**: Sentry, Vercel Analytics
- **CI/CD**: GitHub Actions
- **Containers**: Docker

### Third-party Services
- **Payments**: Razorpay (UPI, Cards, Wallets)
- **SMS/OTP**: MSG91
- **Email**: Resend
- **Shipping**: Shiprocket, Delhivery
- **Maps**: Google Maps API
- **WhatsApp**: WhatsApp Business API

## 📦 Monorepo Structure

```
toy-marketplace-india/
├── apps/
│   ├── web/                 # Next.js 15 web app
│   ├── mobile/              # React Native + Expo mobile app
│   ├── api/                 # Node.js 24 + Hono backend
│   └── admin/               # Admin dashboard
├── packages/
│   ├── ui/                  # Shared UI components
│   ├── database/            # Drizzle schema & migrations
│   ├── typescript-config/   # Shared TS configs
│   ├── eslint-config/       # Shared ESLint configs
│   └── utils/               # Shared utilities
├── docker/                  # Docker configurations
├── .github/                 # GitHub Actions workflows
└── docs/                    # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 24.12+ (LTS)
- PostgreSQL 17.1+
- Redis 7.4+
- pnpm 9.0+ (recommended) or npm

### Installation

```bash
# Clone repository
git clone https://github.com/harikapadia999/toy-marketplace-india.git
cd toy-marketplace-india

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Setup database
pnpm db:push
pnpm db:seed

# Start development servers
pnpm dev
```

This will start:
- Web app: http://localhost:3000
- API server: http://localhost:4000
- Mobile app: Expo DevTools

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/toymarketplace"
REDIS_URL="redis://localhost:6379"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Razorpay
RAZORPAY_KEY_ID="your-key-id"
RAZORPAY_KEY_SECRET="your-key-secret"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Google Maps
GOOGLE_MAPS_API_KEY="your-api-key"

# MSG91 (SMS)
MSG91_AUTH_KEY="your-auth-key"

# Resend (Email)
RESEND_API_KEY="your-api-key"
```

## 📱 Mobile App Setup

```bash
cd apps/mobile

# Install Expo CLI
npm install -g expo-cli

# Start development
npx expo start

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e
```

## 🚢 Deployment

### Web App (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd apps/web
vercel --prod
```

### API (Railway)
```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
cd apps/api
railway up
```

### Mobile App (EAS)
```bash
# Install EAS CLI
npm install -g eas-cli

# Build for production
cd apps/mobile
eas build --platform all

# Submit to stores
eas submit --platform all
```

## 📚 Documentation

- [Architecture Overview](./docs/architecture.md)
- [API Documentation](./docs/api.md)
- [Database Schema](./docs/database.md)
- [Component Library](./docs/components.md)
- [Deployment Guide](./docs/deployment.md)
- [Contributing Guide](./CONTRIBUTING.md)

## 🗺️ Roadmap

### Phase 1: MVP (Weeks 1-8) ✅
- [x] User authentication (email, phone OTP)
- [x] Create/edit listings
- [x] Browse & search toys
- [x] Basic messaging
- [x] Payment integration (Razorpay)
- [x] Mobile app (iOS & Android)

### Phase 2: Growth (Weeks 9-14)
- [ ] Advanced search & filters
- [ ] Ratings & reviews
- [ ] Shipping integration
- [ ] WhatsApp notifications
- [ ] Seller verification (Aadhaar)
- [ ] Analytics dashboard

### Phase 3: Scale (Weeks 15-20)
- [ ] AI price suggestions
- [ ] Image recognition (auto-categorize)
- [ ] Recommendation engine
- [ ] Community features (forums)
- [ ] Subscription plans
- [ ] Multi-language support

### Phase 4: Advanced (Weeks 21+)
- [ ] Video listings
- [ ] Live streaming (toy demos)
- [ ] Toy swap events
- [ ] Charity donations
- [ ] Gamification (badges, rewards)
- [ ] AR try-before-buy

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 👥 Team

- **Hari Kapadia** - Full Stack Developer - [@harikapadia999](https://github.com/harikapadia999)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Expo](https://expo.dev/) - React Native platform
- [Hono](https://hono.dev/) - Fast web framework
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Razorpay](https://razorpay.com/) - Payment gateway

## 📞 Support

- 📧 Email: support@toymarketplace.in
- 💬 Discord: [Join our community](https://discord.gg/toymarketplace)
- 🐦 Twitter: [@toymarketplace_in](https://twitter.com/toymarketplace_in)

---

Made with ❤️ in India for Indian parents and kids
