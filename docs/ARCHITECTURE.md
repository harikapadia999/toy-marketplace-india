# 🏗️ Architecture Overview

## System Architecture

The Toy Marketplace India platform follows a modern, scalable microservices-inspired architecture with a monorepo structure.

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
├──────────────────────┬──────────────────────────────────────┤
│   Web App (Next.js)  │   Mobile App (React Native + Expo)  │
│   - React 19         │   - React Native 0.77                │
│   - TypeScript 5.8   │   - Expo SDK 52                      │
│   - Tailwind CSS 4.0 │   - NativeWind 4.0                   │
└──────────────────────┴──────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         API Gateway                          │
│                    (Hono 4.11 + Node.js 24)                  │
├─────────────────────────────────────────────────────────────┤
│  Authentication │ Listings │ Transactions │ Messages │ ...  │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                ▼             ▼             ▼
┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
│   PostgreSQL 17  │ │  Redis 7.4   │ │  Cloudinary  │
│   (Drizzle ORM)  │ │   (Cache)    │ │   (Images)   │
└──────────────────┘ └──────────────┘ └──────────────┘
```

## Technology Stack

### Frontend Web (Next.js 15.1)
- **Framework**: Next.js 15.1 with App Router
- **UI Library**: React 19.0
- **Language**: TypeScript 5.8
- **Styling**: Tailwind CSS 4.0
- **Components**: Radix UI + shadcn/ui
- **State Management**: 
  - TanStack Query v5 (server state)
  - Zustand 5.x (client state)
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

### Frontend Mobile (React Native 0.77)
- **Framework**: React Native 0.77 (New Architecture)
- **Platform**: Expo SDK 52
- **Navigation**: Expo Router v4
- **Styling**: NativeWind 4.0 (Tailwind for RN)
- **State**: Same as web (TanStack Query + Zustand)

### Backend API (Node.js 24 + Hono 4.11)
- **Runtime**: Node.js 24.12 LTS (Krypton)
- **Framework**: Hono 4.11 (10× faster than Express)
- **Language**: TypeScript 5.8
- **Validation**: Zod schemas
- **Authentication**: JWT tokens
- **Real-time**: Socket.io 4.6

### Database & Storage
- **Primary DB**: PostgreSQL 17.1
- **ORM**: Drizzle ORM 0.38 (type-safe, lightweight)
- **Cache**: Redis 7.4
- **Search**: Meilisearch (fast, typo-tolerant)
- **File Storage**: Cloudinary (images, videos)
- **Backups**: AWS S3

### Infrastructure
- **Web Hosting**: Vercel (auto-scaling, edge functions)
- **API Hosting**: Railway / Render
- **Database**: Neon / Supabase (serverless PostgreSQL)
- **CDN**: Cloudflare (India edge locations)
- **Monitoring**: Sentry (errors), Vercel Analytics
- **CI/CD**: GitHub Actions
- **Containers**: Docker

## Monorepo Structure

```
toy-marketplace-india/
├── apps/
│   ├── web/                    # Next.js web application
│   │   ├── src/
│   │   │   ├── app/           # App Router pages
│   │   │   ├── components/    # React components
│   │   │   ├── lib/           # Utilities
│   │   │   └── styles/        # Global styles
│   │   └── public/            # Static assets
│   │
│   ├── mobile/                 # React Native mobile app
│   │   ├── app/               # Expo Router screens
│   │   ├── components/        # RN components
│   │   ├── hooks/             # Custom hooks
│   │   └── utils/             # Utilities
│   │
│   ├── api/                    # Backend API server
│   │   ├── src/
│   │   │   ├── routes/        # API routes
│   │   │   ├── middleware/    # Express middleware
│   │   │   ├── services/      # Business logic
│   │   │   └── utils/         # Helpers
│   │   └── tests/             # API tests
│   │
│   └── admin/                  # Admin dashboard
│       └── src/               # Admin UI
│
├── packages/
│   ├── database/              # Drizzle ORM schemas
│   │   ├── src/
│   │   │   ├── schema/        # Database schemas
│   │   │   └── migrations/    # DB migrations
│   │   └── drizzle.config.ts
│   │
│   ├── ui/                    # Shared UI components
│   │   └── src/
│   │       ├── components/    # Reusable components
│   │       └── styles/        # Shared styles
│   │
│   ├── utils/                 # Shared utilities
│   │   └── src/
│   │       ├── validators/    # Zod schemas
│   │       └── helpers/       # Helper functions
│   │
│   ├── typescript-config/     # Shared TS configs
│   └── eslint-config/         # Shared ESLint configs
│
├── docker/                    # Docker configurations
├── .github/                   # GitHub Actions workflows
└── docs/                      # Documentation
```

## Data Flow

### User Registration Flow
```
1. User submits registration form
   ↓
2. Frontend validates with Zod schema
   ↓
3. POST /api/v1/auth/register
   ↓
4. Backend validates input
   ↓
5. Hash password with bcrypt
   ↓
6. Insert user into PostgreSQL
   ↓
7. Generate JWT token
   ↓
8. Return user data + token
   ↓
9. Frontend stores token in localStorage
   ↓
10. Redirect to dashboard
```

### Listing Creation Flow
```
1. Seller uploads images
   ↓
2. Images uploaded to Cloudinary
   ↓
3. Get optimized URLs + thumbnails
   ↓
4. Seller fills listing form
   ↓
5. Frontend validates with Zod
   ↓
6. POST /api/v1/listings
   ↓
7. Backend validates + sanitizes
   ↓
8. Generate SEO-friendly slug
   ↓
9. Insert into PostgreSQL
   ↓
10. Index in Meilisearch
   ↓
11. Return listing data
   ↓
12. Redirect to listing page
```

### Transaction Flow
```
1. Buyer clicks "Buy Now"
   ↓
2. Create transaction record (status: pending)
   ↓
3. Initiate Razorpay payment
   ↓
4. User completes payment (UPI/Card)
   ↓
5. Razorpay webhook → Update transaction
   ↓
6. Hold amount in escrow
   ↓
7. Notify seller (WhatsApp + Email)
   ↓
8. Seller ships item
   ↓
9. Update tracking info
   ↓
10. Buyer receives item
   ↓
11. Buyer confirms delivery
   ↓
12. Release escrow to seller
   ↓
13. Update listing status (sold)
   ↓
14. Prompt for review
```

## Security Architecture

### Authentication
- **JWT Tokens**: Signed with HS256, 7-day expiry
- **Refresh Tokens**: 30-day expiry for session renewal
- **Password Hashing**: bcrypt with 12 salt rounds
- **OTP**: 6-digit, 10-minute expiry, stored in Redis

### Authorization
- **Role-Based Access Control (RBAC)**:
  - `buyer`: Can browse, purchase, review
  - `seller`: Can list, sell, manage inventory
  - `both`: Combined buyer + seller permissions
  - `admin`: Full platform access

### Data Protection
- **Input Validation**: Zod schemas on frontend + backend
- **SQL Injection**: Prevented by Drizzle ORM parameterized queries
- **XSS Protection**: DOMPurify sanitization
- **CSRF**: Tokens for state-changing operations
- **Rate Limiting**: Redis-based, 100 req/15min per IP
- **HTTPS Only**: Enforced in production

### Payment Security
- **PCI Compliance**: Razorpay handles card data
- **Escrow System**: Funds held until delivery confirmed
- **Webhook Verification**: HMAC signature validation
- **Fraud Detection**: Razorpay's built-in fraud checks

## Performance Optimizations

### Frontend
- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: next/image with Cloudinary
- **Font Optimization**: next/font with local fonts
- **Lazy Loading**: React.lazy for heavy components
- **Prefetching**: Link prefetching for navigation
- **Bundle Analysis**: @next/bundle-analyzer

### Backend
- **Database Indexing**: 
  - B-tree on frequently queried columns
  - GIN index for full-text search
  - Composite indexes for multi-column queries
- **Query Optimization**: 
  - Select only needed columns
  - Use joins instead of N+1 queries
  - Pagination for large datasets
- **Caching Strategy**:
  - Redis for session data (TTL: 7 days)
  - Popular listings cache (TTL: 5 minutes)
  - User profile cache (TTL: 1 hour)
- **Connection Pooling**: PostgreSQL pool (max: 10)

### Mobile
- **Hermes Engine**: Faster JavaScript execution
- **RAM Bundles**: Lazy load JS modules
- **Image Caching**: expo-image with disk cache
- **FlatList Optimization**: windowSize, removeClippedSubviews
- **Code Push**: OTA updates without app store

## Scalability Strategy

### Horizontal Scaling
- **Stateless API**: No session state in server memory
- **Load Balancing**: Vercel/Railway auto-scaling
- **Database Read Replicas**: For read-heavy operations
- **CDN**: Cloudflare for static assets

### Vertical Scaling
- **Database**: Upgrade PostgreSQL instance as needed
- **Redis**: Increase memory for larger cache
- **API Server**: Increase CPU/RAM on Railway

### Microservices (Future)
- **Notification Service**: Separate service for emails/SMS
- **Search Service**: Dedicated Meilisearch cluster
- **Image Processing**: Serverless functions for resizing
- **Analytics Service**: Separate data warehouse

## Monitoring & Observability

### Error Tracking
- **Sentry**: Real-time error monitoring
- **Source Maps**: For production debugging
- **User Context**: Attach user ID to errors

### Performance Monitoring
- **Vercel Analytics**: Core Web Vitals
- **API Metrics**: Response times, error rates
- **Database Metrics**: Query performance, connection pool

### Logging
- **Structured Logging**: JSON format
- **Log Levels**: ERROR, WARN, INFO, DEBUG
- **Log Aggregation**: CloudWatch / Datadog

### Alerting
- **Error Threshold**: Alert if error rate > 1%
- **Response Time**: Alert if p95 > 500ms
- **Database**: Alert if connection pool > 80%
- **Disk Space**: Alert if > 85% full

## Deployment Pipeline

```
1. Developer pushes to feature branch
   ↓
2. GitHub Actions runs:
   - Linting (ESLint)
   - Type checking (TypeScript)
   - Unit tests (Jest)
   - Build verification
   ↓
3. Create Pull Request
   ↓
4. Code review + approval
   ↓
5. Merge to main branch
   ↓
6. GitHub Actions runs:
   - Full test suite
   - Build production bundles
   - Run E2E tests (Playwright)
   ↓
7. Deploy to staging:
   - Web → Vercel (preview)
   - API → Railway (staging)
   - DB → Neon (staging)
   ↓
8. Manual QA testing
   ↓
9. Approve production deployment
   ↓
10. Deploy to production:
    - Web → Vercel (production)
    - API → Railway (production)
    - DB → Neon (production)
    ↓
11. Run smoke tests
    ↓
12. Monitor for errors (Sentry)
```

## Disaster Recovery

### Backup Strategy
- **Database**: Daily automated backups (retained 30 days)
- **Files**: Cloudinary auto-backup to S3
- **Code**: Git version control

### Recovery Plan
- **RTO (Recovery Time Objective)**: 1 hour
- **RPO (Recovery Point Objective)**: 24 hours
- **Failover**: Automatic with Vercel/Railway
- **Data Restore**: From latest backup

---

**Last Updated**: December 19, 2025
**Version**: 1.0.0
