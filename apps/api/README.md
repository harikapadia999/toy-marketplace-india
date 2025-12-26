# 🧸 Toy Marketplace India - API Backend

Node.js 24 + Hono backend API for Toy Marketplace India.

## 🚀 Features

- **Fast**: Built with Hono (10× faster than Express)
- **Type-Safe**: Full TypeScript support
- **Secure**: JWT authentication, password hashing
- **Scalable**: PostgreSQL + Drizzle ORM
- **Modern**: Node.js 24 LTS

## 📦 Tech Stack

- **Runtime**: Node.js 24.12 LTS
- **Framework**: Hono 4.11
- **Database**: PostgreSQL 17 + Drizzle ORM
- **Auth**: JWT + bcrypt
- **Validation**: Zod

## 🛠️ Setup

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your values
```

3. Run database migrations:
```bash
pnpm db:migrate
```

4. Start development server:
```bash
pnpm dev
```

## 📚 API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token

### Toys
- `GET /api/toys` - Get all toys (with filters)
- `GET /api/toys/:id` - Get single toy
- `POST /api/toys` - Create toy (auth required)
- `PUT /api/toys/:id` - Update toy (auth required)
- `DELETE /api/toys/:id` - Delete toy (auth required)

### Users
- `GET /api/users/profile` - Get current user profile (auth required)
- `PUT /api/users/profile` - Update profile (auth required)
- `GET /api/users/:id` - Get user by ID (public)

### Orders
- `GET /api/orders` - Get user orders (auth required)
- `GET /api/orders/:id` - Get single order (auth required)
- `POST /api/orders` - Create order (auth required)
- `PATCH /api/orders/:id/status` - Update order status (auth required)

### Reviews
- `GET /api/reviews/toy/:toyId` - Get toy reviews
- `POST /api/reviews` - Create review (auth required)
- `PUT /api/reviews/:id` - Update review (auth required)
- `DELETE /api/reviews/:id` - Delete review (auth required)

### Wishlist
- `GET /api/wishlist` - Get user wishlist (auth required)
- `POST /api/wishlist` - Add to wishlist (auth required)
- `DELETE /api/wishlist/:toyId` - Remove from wishlist (auth required)
- `GET /api/wishlist/check/:toyId` - Check if in wishlist (auth required)

## 🔒 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📝 License

MIT
