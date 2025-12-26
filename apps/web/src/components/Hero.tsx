import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Search, Shield, Truck, Heart } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background">
      <div className="container py-16 md:py-24">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          {/* Content */}
          <div className="flex flex-col justify-center space-y-6">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                🌱 Eco-Friendly Shopping
              </div>
              <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Buy & Sell
                <br />
                <span className="text-primary">Kids Toys</span>
                <br />
                Near You
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl">
                Save 40-70% on gently used toys. Safe, verified, and delivered to
                your doorstep. Join 100,000+ happy parents across India.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="gap-2" asChild>
                <Link href="/toys">
                  Browse Toys
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/sell">Sell Your Toys</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div>
                <p className="text-2xl font-bold">50K+</p>
                <p className="text-sm text-muted-foreground">Active Listings</p>
              </div>
              <div>
                <p className="text-2xl font-bold">100K+</p>
                <p className="text-sm text-muted-foreground">Happy Parents</p>
              </div>
              <div>
                <p className="text-2xl font-bold">500+</p>
                <p className="text-sm text-muted-foreground">Cities</p>
              </div>
            </div>
          </div>

          {/* Image/Illustration */}
          <div className="relative lg:order-last">
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5">
              {/* Placeholder for hero image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="text-8xl">🧸</div>
                  <p className="text-lg font-medium text-muted-foreground">
                    Hero Image Placeholder
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Cards */}
            <div className="absolute -left-4 top-1/4 hidden lg:block">
              <div className="rounded-lg border bg-background p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">100% Safe</p>
                    <p className="text-xs text-muted-foreground">
                      Verified Sellers
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -right-4 bottom-1/4 hidden lg:block">
              <div className="rounded-lg border bg-background p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Truck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Fast Delivery</p>
                    <p className="text-xs text-muted-foreground">
                      2-3 Days
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Easy Search</h3>
              <p className="text-sm text-muted-foreground">
                Find toys by age, brand, or category
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Safe & Verified</h3>
              <p className="text-sm text-muted-foreground">
                Quality checked by experts
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Fast Delivery</h3>
              <p className="text-sm text-muted-foreground">
                Doorstep delivery in 2-3 days
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Eco-Friendly</h3>
              <p className="text-sm text-muted-foreground">
                Reduce waste, save planet
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
