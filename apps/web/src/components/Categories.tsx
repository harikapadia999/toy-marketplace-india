import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const categories = [
  {
    id: 'educational',
    name: 'Educational',
    icon: '📚',
    count: '5,234',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'outdoor',
    name: 'Outdoor & Sports',
    icon: '⚽',
    count: '3,456',
    color: 'bg-green-100 text-green-600',
  },
  {
    id: 'creative',
    name: 'Arts & Crafts',
    icon: '🎨',
    count: '4,123',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    id: 'electronic',
    name: 'Electronic',
    icon: '🎮',
    count: '2,789',
    color: 'bg-red-100 text-red-600',
  },
  {
    id: 'dolls',
    name: 'Dolls & Figures',
    icon: '🪆',
    count: '6,543',
    color: 'bg-pink-100 text-pink-600',
  },
  {
    id: 'vehicles',
    name: 'Vehicles',
    icon: '🚗',
    count: '3,987',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    id: 'puzzles',
    name: 'Puzzles & Games',
    icon: '🧩',
    count: '4,567',
    color: 'bg-yellow-100 text-yellow-600',
  },
  {
    id: 'baby',
    name: 'Baby Toys',
    icon: '🍼',
    count: '2,345',
    color: 'bg-cyan-100 text-cyan-600',
  },
];

export function Categories() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Shop by Category
            </h2>
            <p className="text-muted-foreground mt-2">
              Find the perfect toy for every age and interest
            </p>
          </div>
          <Link
            href="/categories"
            className="hidden md:flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.id}`}
              className="group relative overflow-hidden rounded-lg border bg-card p-6 transition-all hover:shadow-lg hover:scale-105"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-full text-3xl ${category.color}`}
                >
                  {category.icon}
                </div>
                <div>
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {category.count} toys
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            View All Categories
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
