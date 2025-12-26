import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Priya Sharma',
    location: 'Mumbai, Maharashtra',
    avatar: '👩',
    rating: 5,
    text: 'Amazing platform! I sold my daughter\'s old toys in just 2 days. The buyers were genuine and the payment was instant. Highly recommended!',
    role: 'Seller',
  },
  {
    id: 2,
    name: 'Rahul Kumar',
    location: 'Delhi, NCR',
    avatar: '👨',
    rating: 5,
    text: 'Bought a LEGO set for my son at 60% off! The toy was in perfect condition. Great way to save money and help the environment.',
    role: 'Buyer',
  },
  {
    id: 3,
    name: 'Anjali Patel',
    location: 'Bangalore, Karnataka',
    avatar: '👩',
    rating: 5,
    text: 'Love the safety verification feature. As a parent, I feel confident buying used toys knowing they\'ve been checked for quality and safety.',
    role: 'Buyer',
  },
  {
    id: 4,
    name: 'Vikram Singh',
    location: 'Pune, Maharashtra',
    avatar: '👨',
    rating: 5,
    text: 'The chat feature is so convenient! I could negotiate prices and arrange pickup easily. Made 15,000 rupees selling toys my kids outgrew.',
    role: 'Seller',
  },
  {
    id: 5,
    name: 'Sneha Reddy',
    location: 'Hyderabad, Telangana',
    avatar: '👩',
    rating: 5,
    text: 'Fast delivery and excellent customer support. My kids are thrilled with their "new" toys, and I\'m happy with the savings!',
    role: 'Buyer',
  },
  {
    id: 6,
    name: 'Arjun Mehta',
    location: 'Chennai, Tamil Nadu',
    avatar: '👨',
    rating: 5,
    text: 'Best platform for sustainable shopping. I\'ve bought and sold multiple toys. The community is trustworthy and responsive.',
    role: 'Both',
  },
];

export function Testimonials() {
  return (
    <section className="py-16 md:py-24 bg-muted/50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">
            What Parents Say
          </h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Join 100,000+ happy parents who trust ToyMarket India
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="relative overflow-hidden rounded-lg border bg-card p-6 transition-all hover:shadow-lg"
            >
              {/* Quote Icon */}
              <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/10" />

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              {/* Text */}
              <p className="text-sm text-muted-foreground mb-6">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-2xl">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.location}
                  </p>
                  <p className="text-xs text-primary font-medium">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="text-center">
            <p className="text-4xl font-bold text-primary">4.9/5</p>
            <p className="text-sm text-muted-foreground mt-1">
              Average Rating
            </p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-primary">50K+</p>
            <p className="text-sm text-muted-foreground mt-1">
              Toys Sold
            </p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-primary">100K+</p>
            <p className="text-sm text-muted-foreground mt-1">
              Happy Parents
            </p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-primary">500+</p>
            <p className="text-sm text-muted-foreground mt-1">
              Cities Covered
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
