import React, { useState, useCallback } from 'react';
import { Search, Filter, X } from 'lucide-react';

interface SearchFilters {
  query: string;
  ageGroup: string[];
  condition: string[];
  priceRange: [number, number];
  category: string[];
  location: string;
  availability: string;
  sortBy: string;
}

const AGE_GROUPS = [
  { value: '0-2', label: '0-2 years' },
  { value: '3-5', label: '3-5 years' },
  { value: '6-8', label: '6-8 years' },
  { value: '9-12', label: '9-12 years' },
  { value: '13+', label: '13+ years' },
];

const CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'like-new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
];

const CATEGORIES = [
  { value: 'action-figures', label: 'Action Figures' },
  { value: 'dolls', label: 'Dolls' },
  { value: 'educational', label: 'Educational' },
  { value: 'board-games', label: 'Board Games' },
  { value: 'outdoor', label: 'Outdoor Toys' },
  { value: 'puzzles', label: 'Puzzles' },
  { value: 'vehicles', label: 'Vehicles' },
  { value: 'building', label: 'Building Blocks' },
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'date-desc', label: 'Newest First' },
  { value: 'date-asc', label: 'Oldest First' },
];

interface SearchFilterProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  onSearch,
  initialFilters = {},
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    ageGroup: [],
    condition: [],
    priceRange: [0, 10000],
    category: [],
    location: '',
    availability: 'all',
    sortBy: 'relevance',
    ...initialFilters,
  });

  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = useCallback(() => {
    onSearch(filters);
  }, [filters, onSearch]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (key: 'ageGroup' | 'condition' | 'category', value: string) => {
    setFilters((prev) => {
      const current = prev[key];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: updated };
    });
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      ageGroup: [],
      condition: [],
      priceRange: [0, 10000],
      category: [],
      location: '',
      availability: 'all',
      sortBy: 'relevance',
    });
  };

  const activeFilterCount =
    filters.ageGroup.length +
    filters.condition.length +
    filters.category.length +
    (filters.location ? 1 : 0) +
    (filters.availability !== 'all' ? 1 : 0);

  return (
    <div className="w-full space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search toys..."
            value={filters.query}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          <Filter className="w-5 h-5" />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
        <button
          onClick={handleSearch}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
        >
          Search
        </button>
      </div>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.ageGroup.map((age) => (
            <FilterChip
              key={age}
              label={`Age: ${age}`}
              onRemove={() => toggleArrayFilter('ageGroup', age)}
            />
          ))}
          {filters.condition.map((cond) => (
            <FilterChip
              key={cond}
              label={`Condition: ${cond}`}
              onRemove={() => toggleArrayFilter('condition', cond)}
            />
          ))}
          {filters.category.map((cat) => (
            <FilterChip
              key={cat}
              label={CATEGORIES.find((c) => c.value === cat)?.label || cat}
              onRemove={() => toggleArrayFilter('category', cat)}
            />
          ))}
          {filters.location && (
            <FilterChip
              label={`Location: ${filters.location}`}
              onRemove={() => handleFilterChange('location', '')}
            />
          )}
          <button
            onClick={clearFilters}
            className="text-sm text-blue-500 hover:text-blue-600 font-medium"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <div className="border border-gray-200 rounded-lg p-6 space-y-6 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Age Group */}
            <div>
              <h3 className="font-semibold mb-3">Age Group</h3>
              <div className="space-y-2">
                {AGE_GROUPS.map((age) => (
                  <label key={age.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.ageGroup.includes(age.value)}
                      onChange={() => toggleArrayFilter('ageGroup', age.value)}
                      className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm">{age.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Condition */}
            <div>
              <h3 className="font-semibold mb-3">Condition</h3>
              <div className="space-y-2">
                {CONDITIONS.map((cond) => (
                  <label key={cond.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.condition.includes(cond.value)}
                      onChange={() => toggleArrayFilter('condition', cond.value)}
                      className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm">{cond.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <h3 className="font-semibold mb-3">Category</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {CATEGORIES.map((cat) => (
                  <label key={cat.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.category.includes(cat.value)}
                      onChange={() => toggleArrayFilter('category', cat.value)}
                      className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm">{cat.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="font-semibold mb-3">
              Price Range: ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
            </h3>
            <div className="flex gap-4 items-center">
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={filters.priceRange[0]}
                onChange={(e) =>
                  handleFilterChange('priceRange', [
                    parseInt(e.target.value),
                    filters.priceRange[1],
                  ])
                }
                className="flex-1"
              />
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={filters.priceRange[1]}
                onChange={(e) =>
                  handleFilterChange('priceRange', [
                    filters.priceRange[0],
                    parseInt(e.target.value),
                  ])
                }
                className="flex-1"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="font-semibold mb-3">Location</h3>
            <input
              type="text"
              placeholder="Enter city or state"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Sort By */}
          <div>
            <h3 className="font-semibold mb-3">Sort By</h3>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

const FilterChip: React.FC<{ label: string; onRemove: () => void }> = ({ label, onRemove }) => (
  <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
    <span>{label}</span>
    <button onClick={onRemove} className="hover:bg-blue-200 rounded-full p-0.5">
      <X className="w-3 h-3" />
    </button>
  </div>
);