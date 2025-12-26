'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Search, ShoppingCart, User, Heart, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top Bar */}
      <div className="border-b bg-primary/5">
        <div className="container flex h-10 items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Deliver to:</span>
            <button className="font-medium hover:text-primary">
              Mumbai, 400001
            </button>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/sell" className="hover:text-primary">
              Sell Toys
            </Link>
            <Link href="/help" className="hover:text-primary">
              Help & Support
            </Link>
            <Link href="/download" className="hover:text-primary">
              Download App
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container flex h-16 items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-xl font-bold">🧸</span>
          </div>
          <span className="hidden font-display text-xl font-bold sm:inline-block">
            ToyMarket
          </span>
        </Link>

        {/* Search Bar */}
        <div className="flex flex-1 items-center gap-2">
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for toys, brands, age groups..."
              className="pl-10 pr-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button size="sm" className="hidden md:flex">
            Search
          </Button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Wishlist */}
          <Button variant="ghost" size="icon" className="relative">
            <Heart className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              3
            </span>
          </Button>

          {/* Cart */}
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              2
            </span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/orders">My Orders</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/wishlist">Wishlist</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/messages">Messages</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/sell">Sell Toys</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="border-t">
        <div className="container flex h-12 items-center justify-between">
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/toys"
              className="text-sm font-medium hover:text-primary"
            >
              All Toys
            </Link>
            <Link
              href="/categories/educational"
              className="text-sm font-medium hover:text-primary"
            >
              Educational
            </Link>
            <Link
              href="/categories/outdoor"
              className="text-sm font-medium hover:text-primary"
            >
              Outdoor
            </Link>
            <Link
              href="/categories/creative"
              className="text-sm font-medium hover:text-primary"
            >
              Creative
            </Link>
            <Link
              href="/categories/electronic"
              className="text-sm font-medium hover:text-primary"
            >
              Electronic
            </Link>
            <Link
              href="/deals"
              className="text-sm font-medium text-primary hover:text-primary/80"
            >
              🔥 Hot Deals
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              🌱 Save 40-70% & Help Environment
            </span>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="border-t md:hidden">
          <div className="container space-y-4 py-4">
            <Link
              href="/toys"
              className="block text-sm font-medium hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              All Toys
            </Link>
            <Link
              href="/categories/educational"
              className="block text-sm font-medium hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Educational
            </Link>
            <Link
              href="/categories/outdoor"
              className="block text-sm font-medium hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Outdoor
            </Link>
            <Link
              href="/categories/creative"
              className="block text-sm font-medium hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Creative
            </Link>
            <Link
              href="/categories/electronic"
              className="block text-sm font-medium hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Electronic
            </Link>
            <Link
              href="/deals"
              className="block text-sm font-medium text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              🔥 Hot Deals
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
