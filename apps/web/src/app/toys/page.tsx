'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, Grid3x3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { ToyCard } from '@/components/toys/ToyCard';
import { ToyFilters } from '@/components/toys/ToyFilters';
import { api } from '@/lib/api';

export default function ToysPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    condition: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest' as const,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['toys', filters, searchQuery],
    queryFn: () => api.getToys({
      ...filters,
      search: searchQuery,
      page: 1,
      limit: 20,
    }),
  });

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Browse Toys</h1>
        <p className="text-muted-foreground">
          Discover thousands of toys for kids of all ages
        </p>
      </div>

      {/* Search & Filters Bar */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search toys, brands, categories..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Sort */}
          <Select
            value={filters.sortBy}
            onValueChange={(value) => setFilters({ ...filters, sortBy: value as any })}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </Select>

          {/* View Mode */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Filters Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Active Filters */}
        {(filters.category || filters.condition || filters.minPrice || filters.maxPrice) && (
          <div className="flex flex-wrap gap-2">
            {filters.category && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                Category: {filters.category}
                <button
                  onClick={() => setFilters({ ...filters, category: '' })}
                  className="hover:text-primary/80"
                >
                  ×
                </button>
              </div>
            )}
            {filters.condition && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                Condition: {filters.condition}
                <button
                  onClick={() => setFilters({ ...filters, condition: '' })}
                  className="hover:text-primary/80"
                >
                  ×
                </button>
              </div>
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                Price: ₹{filters.minPrice || '0'} - ₹{filters.maxPrice || '∞'}
                <button
                  onClick={() => setFilters({ ...filters, minPrice: '', maxPrice: '' })}
                  className="hover:text-primary/80"
                >
                  ×
                </button>
              </div>
            )}
            <button
              onClick={() => setFilters({
                category: '',
                condition: '',
                minPrice: '',
                maxPrice: '',
                sortBy: 'newest',
              })}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <aside className="w-64 shrink-0">
            <ToyFilters filters={filters} onChange={setFilters} />
          </aside>
        )}

        {/* Toys Grid/List */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-muted rounded-lg mb-4" />
                  <div className="h-4 bg-muted rounded mb-2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Failed to load toys. Please try again.</p>
            </div>
          ) : data?.data.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No toys found. Try adjusting your filters.</p>
            </div>
          ) : (
            <>
              <div className={
                viewMode === 'grid'
                  ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'space-y-4'
              }>
                {data?.data.map((toy: any) => (
                  <ToyCard key={toy.id} toy={toy} viewMode={viewMode} />
                ))}
              </div>

              {/* Pagination */}
              {data && data.pagination.totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  <Button variant="outline" disabled={data.pagination.page === 1}>
                    Previous
                  </Button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, data.pagination.totalPages) }).map((_, i) => (
                      <Button
                        key={i}
                        variant={data.pagination.page === i + 1 ? 'default' : 'outline'}
                        size="icon"
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    disabled={data.pagination.page === data.pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
