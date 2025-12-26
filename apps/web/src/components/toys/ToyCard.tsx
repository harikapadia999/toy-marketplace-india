import Link from 'next/link';
import Image from 'next/image';
import { Heart, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice, calculateDiscount } from '@/lib/utils';

interface ToyCardProps {
  toy: any;
  viewMode?: 'grid' | 'list';
}

export function ToyCard({ toy, viewMode = 'grid' }: ToyCardProps) {
  if (viewMode === 'list') {
    return (
      <div className="flex gap-4 p-4 border rounded-lg hover:shadow-lg transition-shadow">
        {/* Image */}
        <Link href={`/toys/${toy.id}`} className="relative w-48 h-48 shrink-0 overflow-hidden rounded-lg bg-muted">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl">🧸</span>
          </div>
          <div className="absolute top-2 left-2 rounded-full bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
            {calculateDiscount(parseFloat(toy.originalPrice), parseFloat(toy.salePrice))}% OFF
          </div>
        </Link>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          <Link href={`/toys/${toy.id}`}>
            <h3 className="font-semibold text-lg hover:text-primary line-clamp-2">
              {toy.title}
            </h3>
          </Link>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <span>{toy.brand}</span>
            <span>•</span>
            <span className="text-green-600">{toy.condition}</span>
          </div>

          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {toy.description}
          </p>

          <div className="mt-auto pt-4 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  {formatPrice(parseFloat(toy.salePrice))}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(parseFloat(toy.originalPrice))}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">4.8</span>
                <span className="text-sm text-muted-foreground">(124)</span>
              </div>
            </div>

            <Button>View Details</Button>
          </div>
        </div>

        {/* Wishlist */}
        <button className="self-start p-2 rounded-full hover:bg-muted">
          <Heart className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg">
      {/* Image */}
      <Link href={`/toys/${toy.id}`} className="relative block aspect-square overflow-hidden bg-muted">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl">🧸</span>
        </div>
        <div className="absolute top-2 left-2 rounded-full bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
          {calculateDiscount(parseFloat(toy.originalPrice), parseFloat(toy.salePrice))}% OFF
        </div>
        <button className="absolute top-2 right-2 rounded-full bg-background/80 p-2 backdrop-blur-sm transition-colors hover:bg-background">
          <Heart className="h-4 w-4" />
        </button>
      </Link>

      {/* Content */}
      <div className="p-4 space-y-3">
        <Link href={`/toys/${toy.id}`}>
          <h3 className="font-semibold line-clamp-2 hover:text-primary">
            {toy.title}
          </h3>
        </Link>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{toy.brand}</span>
          <span>•</span>
          <span className="text-green-600">{toy.condition}</span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">
            {formatPrice(parseFloat(toy.salePrice))}
          </span>
          <span className="text-sm text-muted-foreground line-through">
            {formatPrice(parseFloat(toy.originalPrice))}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">4.8</span>
            <span className="text-muted-foreground">(124)</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="text-xs">{toy.location?.city || 'Mumbai'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {toy.seller?.name?.[0] || 'S'}
          </div>
          <span className="text-sm text-muted-foreground">
            {toy.seller?.name || 'Seller'}
          </span>
          {toy.seller?.isVerified && (
            <span className="text-xs text-green-600">✓ Verified</span>
          )}
        </div>

        <Button className="w-full" size="sm">
          View Details
        </Button>
      </div>
    </div>
  );
}
