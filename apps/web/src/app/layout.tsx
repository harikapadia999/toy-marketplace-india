import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const calSans = localFont({
  src: '../fonts/CalSans-SemiBold.woff2',
  variable: '--font-cal-sans',
  weight: '600',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Toy Marketplace India - Buy, Sell & Resell Kids Toys',
    template: '%s | Toy Marketplace India',
  },
  description:
    'India\'s largest marketplace for buying, selling, and reselling kids toys. Save 40-70% on gently used toys. Safe, verified, and eco-friendly.',
  keywords: [
    'toys',
    'kids toys',
    'buy toys',
    'sell toys',
    'resell toys',
    'used toys',
    'second hand toys',
    'toy marketplace',
    'India',
    'children toys',
    'baby toys',
    'educational toys',
  ],
  authors: [{ name: 'Toy Marketplace India' }],
  creator: 'Toy Marketplace India',
  publisher: 'Toy Marketplace India',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: '/',
    title: 'Toy Marketplace India - Buy, Sell & Resell Kids Toys',
    description:
      'India\'s largest marketplace for buying, selling, and reselling kids toys. Save 40-70% on gently used toys.',
    siteName: 'Toy Marketplace India',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Toy Marketplace India',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Toy Marketplace India - Buy, Sell & Resell Kids Toys',
    description:
      'India\'s largest marketplace for buying, selling, and reselling kids toys. Save 40-70% on gently used toys.',
    images: ['/og-image.jpg'],
    creator: '@toymarketplace',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${calSans.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
