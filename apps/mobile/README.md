# Toy Marketplace India - Mobile App

A cross-platform mobile application for buying and selling pre-loved toys in India, built with React Native and Expo.

## Features

- 🏠 **Home Screen**: Browse featured toys and categories
- 🔍 **Search**: Advanced search with filters
- 💬 **Messages**: Real-time chat with buyers/sellers
- 👤 **Profile**: Manage listings, orders, and settings
- 📦 **Sell**: Multi-step form to list toys
- 🛒 **Cart**: Shopping cart with checkout
- 📱 **Native Features**: Camera, location, notifications

## Tech Stack

- **Framework**: React Native 0.76.5
- **Runtime**: Expo SDK 52
- **Language**: TypeScript
- **Navigation**: Expo Router
- **State Management**: Zustand
- **Data Fetching**: React Query
- **UI**: React Native components
- **Icons**: Ionicons

## Getting Started

### Prerequisites

- Node.js 24+
- pnpm 9+
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
cd apps/mobile
pnpm start

# Run on iOS
pnpm ios

# Run on Android
pnpm android

# Run on Web
pnpm web
```

## Project Structure

```
apps/mobile/
├── app/                    # App screens (Expo Router)
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Home screen
│   │   ├── search.tsx     # Search screen
│   │   ├── sell.tsx       # Sell screen
│   │   ├── messages.tsx   # Messages screen
│   │   └── profile.tsx    # Profile screen
│   ├── auth/              # Auth screens
│   ├── toys/              # Toy detail screens
│   └── _layout.tsx        # Root layout
├── lib/                   # Utilities
│   └── api.ts            # API client
├── assets/               # Images, fonts
└── app.json             # Expo configuration
```

## Screens

### Home Screen
- Featured toys carousel
- Category chips
- Popular brands
- Search bar
- Cart badge

### Search Screen
- Search input
- Category filters
- Condition filters
- Results grid
- Wishlist toggle

### Sell Screen
- Multi-step form (4 steps)
- Image upload (up to 5)
- Category selection
- Pricing calculator
- Preview listing

### Messages Screen
- Chat list
- Search conversations
- Unread badges
- Real-time updates

### Profile Screen
- User stats
- My listings
- My orders
- Wishlist
- Settings
- Logout

## API Integration

The app connects to the backend API:

```typescript
// Configure API URL
EXPO_PUBLIC_API_URL=http://localhost:3001/api
```

## Permissions

The app requires:
- **Camera**: For toy photos
- **Photo Library**: For image uploads
- **Location**: For nearby toys
- **Notifications**: For messages

## Building

### Development Build

```bash
# iOS
eas build --profile development --platform ios

# Android
eas build --profile development --platform android
```

### Production Build

```bash
# iOS
eas build --profile production --platform ios

# Android
eas build --profile production --platform android
```

## Environment Variables

Create `.env` file:

```env
EXPO_PUBLIC_API_URL=https://api.toymarketplace.in/api
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## License

MIT License - see LICENSE file

## Support

For support, email support@toymarketplace.in
