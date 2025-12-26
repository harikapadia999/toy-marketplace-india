'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Heart, 
  Share2, 
  MapPin, 
  Star, 
  ShoppingCart, 
  MessageCircle,
  Flag,
  ChevronLeft,
  ChevronRight,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ToyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const { data: toy, isLoading, error } = useQuery({
    queryKey: ['toy', params.id],
    queryFn: () => api.getToy(params.id as string),
  });

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="aspect-square bg-muted rounded-lg" />
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-12 bg-muted rounded w-1/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !toy) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Toy not found</h1>
        <Button onClick={() => router.push('/toys')}>Browse Toys</Button>
      </div>
    );
  }

  const images = toy.data.images || [{ url: '🧸', alt: 'Toy' }];
  const discount = Math.round(
    ((parseFloat(toy.data.originalPrice) - parseFloat(toy.data.salePrice)) / 
    parseFloat(toy.data.originalPrice)) * 100
  );

  const handleAddToCart = () => {
    toast.success('Added to cart!');
  };

  const handleContactSeller = () => {
    router.push(`/messages/new?seller=${toy.data.seller.id}`);
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: toy.data.title,
        text: toy.data.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <Link href="/toys" className="hover:text-foreground">Toys</Link>
        <span>/</span>
        <Link href={`/toys?category=${toy.data.category}`} className="hover:text-foreground">
          {toy.data.category}
        </Link>
        <span>/</span>
        <span className="text-foreground">{toy.data.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-9xl">{images[currentImageIndex].url}</span>
            </div>
            
            {/* Discount Badge */}
            {discount > 0 && (
              <div className="absolute top-4 left-4 rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white">
                {discount}% OFF
              </div>
            )}

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-lg hover:bg-white"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-lg hover:bg-white"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Images */}
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {images.map((image: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`aspect-square overflow-hidden rounded-lg border-2 ${
                    currentImageIndex === index ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <div className="flex h-full items-center justify-center bg-muted">
                    <span className="text-3xl">{image.url}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Title & Actions */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-3xl font-bold">{toy.data.title}</h1>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleWishlist}
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button variant="outline" size="icon" onClick={handleShare}>
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Brand & Category */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>{toy.data.brand}</span>
              <span>•</span>
              <span>{toy.data.category}</span>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              4.8 ({toy.data.reviews?.length || 124} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold">
                {formatPrice(parseFloat(toy.data.salePrice))}
              </span>
              <span className="text-xl text-muted-foreground line-through">
                {formatPrice(parseFloat(toy.data.originalPrice))}
              </span>
              <Badge variant="destructive">{discount}% OFF</Badge>
            </div>
            <p className="text-sm text-green-600">
              You save {formatPrice(parseFloat(toy.data.originalPrice) - parseFloat(toy.data.salePrice))}
            </p>
          </div>

          {/* Condition */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Condition:</span>
            <Badge variant="outline" className="text-green-600 border-green-600">
              {toy.data.condition}
            </Badge>
          </div>

          {/* Key Features */}
          <div className="space-y-2">
            <h3 className="font-semibold">Key Features:</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-600" />
                <span>Age: {toy.data.ageRange || '3-8 years'}</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-600" />
                <span>Material: {toy.data.material || 'Plastic'}</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-600" />
                <span>Safety Certified</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-600" />
                <span>Quality Checked</span>
              </li>
            </ul>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{toy.data.location?.city || 'Mumbai'}, {toy.data.location?.state || 'Maharashtra'}</span>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button className="w-full" size="lg" onClick={handleAddToCart}>
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
            <Button
              variant="outline"
              className="w-full"
              size="lg"
              onClick={handleContactSeller}
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Contact Seller
            </Button>
          </div>

          {/* Seller Info */}
          <div className="rounded-lg border p-4 space-y-3">
            <h3 className="font-semibold">Seller Information</h3>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                {toy.data.seller?.name?.[0] || 'S'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{toy.data.seller?.name || 'Seller'}</span>
                  {toy.data.seller?.isVerified && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      ✓ Verified
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Member since {formatDate(toy.data.seller?.createdAt)}
                </p>
              </div>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/users/${toy.data.seller?.id}`}>
                View Profile
              </Link>
            </Button>
          </div>

          {/* Report */}
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Flag className="mr-2 h-4 w-4" />
            Report this listing
          </Button>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-12">
        <Tabs defaultValue="description">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({toy.data.reviews?.length || 124})</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <div className="prose max-w-none">
              <p className="text-muted-foreground">{toy.data.description}</p>
            </div>
          </TabsContent>

          <TabsContent value="specifications" className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold">Product Details</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Brand:</dt>
                    <dd className="font-medium">{toy.data.brand}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Category:</dt>
                    <dd className="font-medium">{toy.data.category}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Condition:</dt>
                    <dd className="font-medium">{toy.data.condition}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Age Range:</dt>
                    <dd className="font-medium">{toy.data.ageRange || '3-8 years'}</dd>
                  </div>
                </dl>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Additional Info</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Material:</dt>
                    <dd className="font-medium">{toy.data.material || 'Plastic'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Weight:</dt>
                    <dd className="font-medium">{toy.data.weight || '500g'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Dimensions:</dt>
                    <dd className="font-medium">{toy.data.dimensions || '20x15x10 cm'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Listed:</dt>
                    <dd className="font-medium">{formatDate(toy.data.createdAt)}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-6">
              {/* Review Summary */}
              <div className="flex items-center gap-8 rounded-lg border p-6">
                <div className="text-center">
                  <div className="text-5xl font-bold">4.8</div>
                  <div className="flex items-center gap-1 mt-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">124 reviews</p>
                </div>
                <div className="flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-sm w-8">{rating}★</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400"
                          style={{ width: `${rating === 5 ? 80 : rating === 4 ? 15 : 5}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {rating === 5 ? 99 : rating === 4 ? 19 : 6}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Individual Reviews */}
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          U{i}
                        </div>
                        <div>
                          <p className="font-medium">User {i}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, j) => (
                                <Star
                                  key={j}
                                  className={`h-3 w-3 ${
                                    j < 5 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span>•</span>
                            <span>2 days ago</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Great toy! My kid loves it. Quality is excellent and delivery was fast.
                      Highly recommended for parents looking for quality toys.
                    </p>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full">
                Load More Reviews
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Similar Toys */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Similar Toys</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Link
              key={i}
              href={`/toys/${i}`}
              className="group rounded-lg border overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-square bg-muted flex items-center justify-center">
                <span className="text-6xl">🧸</span>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-semibold group-hover:text-primary">
                  Similar Toy {i}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold">₹999</span>
                  <span className="text-sm text-muted-foreground line-through">₹1,499</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
