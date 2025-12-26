import Link from 'next/link';
import Image from 'next/image';
import { Heart, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice, calculateDiscount } from '@/lib/utils';

const featuredToys = [
  {
    id: '1',
    name: 'LEGO Classic Creative Building Set',
    brand: 'LEGO',
    originalPrice: 4999,
    salePrice: 2499,
    condition: 'Like New',
    age: '4-99 years',
    location: 'Mumbai, Maharashtra',
    rating: 4.8,
    reviews: 124,
    image: '/placeholder-toy-1.jpg',
    seller: {
      name: 'Priya Sharma',
      verified: true,
    },
  },
  {
    id: '2',
    name: 'Hot Wheels Track Builder Set',
    brand: 'Hot Wheels',
    originalPrice: 3499,
    salePrice: 1799,
    condition: 'Good',
    age: '5-10 years',
    location: 'Delhi, NCR',
    rating: 4.6,
    reviews: 89,
    image: '/placeholder-toy-2.jpg',
    seller: {
      name: 'Rahul Kumar',
      verified: true,
    },
  },
  {
    id: '3',
    name: 'Barbie Dreamhouse Playset',
    brand: 'Barbie',
    originalPrice: 8999,
    salePrice: 4499,
    condition: 'Like New',
    age: '3-7 years',
    location: 'Bangalore, Karnataka',
    rating: 4.9,
    reviews: 156,
    image: '/placeholder-toy-3.jpg',
    seller: {
      name: 'Anjali Patel',
      verified: true,
    },
  },
  {
    id: '4',
    name: 'Nerf Elite 2.0 Blaster',
    brand: 'Nerf',
    originalPrice: 2999,
    salePrice: 1499,
    condition: 'Good',
    age: '8+ years',
    location: 'Pune, Maharashtra',
    rating: 4.7,
    reviews: 67,
    image: '/placeholder-toy-4.jpg',
    seller: {
      name: 'Vikram Singh',
      verified: true,
    },
  },
];

export function FeaturedToys() {
  return (
    <section className="py-16 md:py-24 bg-muted/50">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Featured Toys
            </h2>
            <p className="text-muted-foreground mt-2">
              Handpicked toys from verified sellers
            </p>
          </div>
          <Link
            href="/toys"
            className="hidden md:flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            View All
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredToys.map((toy) => (
            <div
              key={toy.id}
              className="group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg"
            >
              {/* Image */}
              <Link href={`/toys/${toy.id}`} className="relative block aspect-square overflow-hidden bg-muted">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl">{toy.brand === 'LEGO' ? '🧱' : toy.brand === 'Hot Wheels' ? '🏎️' : toy.brand === 'Barbie' ? '👗' : '🎯'}</span>
                </div>
                {/* Discount Badge */}
                <div className="absolute top-2 left-2 rounded-full bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
                  {calculateDiscount(toy.originalPrice, toy.salePrice)}% OFF
                </div>
                {/* Wishlist Button */}
                <button className="absolute top-2 right-2 rounded-full bg-background/80 p-2 backdrop-blur-sm transition-colors hover:bg-background">
                  <Heart className="h-4 w-4" />
                </button>
              </Link>

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Title */}
                <Link href={`/toys/${toy.id}`}>
                  <h3 className="font-semibold line-clamp-2 hover:text-primary">
                    {toy.name}
                  </h3>
                </Link>

                {/* Brand & Condition */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{toy.brand}</span>
                  <span>•</span>
                  <span className="text-green-600">{toy.condition}</span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {formatPrice(toy.salePrice)}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(toy.originalPrice)}
                  </span>
                </div>

                {/* Rating & Location */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{toy.rating}</span>
                    <span className="text-muted-foreground">
                      ({toy.reviews})
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="text-xs">{toy.location.split(',')[0]}</span>
                  </div>
                </div>

                {/* Seller */}
                <div className="flex items-center gap-2 pt-2 border-t">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {toy.seller.name[0]}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {toy.seller.name}
                  </span>
                  {toy.seller.verified && (
                    <span className="text-xs text-green-600">✓ Verified</span>
                  )}
                </div>

                {/* Action Button */}
                <Button className="w-full" size="sm">
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button variant="outline" size="lg" asChild>
            <Link href="/toys">Browse All Toys</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
