import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface ToyFiltersProps {
  filters: {
    category: string;
    condition: string;
    minPrice: string;
    maxPrice: string;
    sortBy: string;
  };
  onChange: (filters: any) => void;
}

const categories = [
  'Educational',
  'Outdoor & Sports',
  'Arts & Crafts',
  'Electronic',
  'Dolls & Figures',
  'Vehicles',
  'Puzzles & Games',
  'Baby Toys',
];

const conditions = [
  { value: 'new', label: 'New' },
  { value: 'like_new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
];

export function ToyFilters({ filters, onChange }: ToyFiltersProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-4">Filters</h3>
      </div>

      {/* Category */}
      <div className="space-y-3">
        <Label className="text-base">Category</Label>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category}`}
                checked={filters.category === category}
                onCheckedChange={(checked) =>
                  onChange({
                    ...filters,
                    category: checked ? category : '',
                  })
                }
              />
              <Label
                htmlFor={`category-${category}`}
                className="text-sm font-normal cursor-pointer"
              >
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Condition */}
      <div className="space-y-3">
        <Label className="text-base">Condition</Label>
        <div className="space-y-2">
          {conditions.map((condition) => (
            <div key={condition.value} className="flex items-center space-x-2">
              <Checkbox
                id={`condition-${condition.value}`}
                checked={filters.condition === condition.value}
                onCheckedChange={(checked) =>
                  onChange({
                    ...filters,
                    condition: checked ? condition.value : '',
                  })
                }
              />
              <Label
                htmlFor={`condition-${condition.value}`}
                className="text-sm font-normal cursor-pointer"
              >
                {condition.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <Label className="text-base">Price Range</Label>
        <div className="space-y-2">
          <div>
            <Label htmlFor="minPrice" className="text-sm">Min Price</Label>
            <Input
              id="minPrice"
              type="number"
              placeholder="₹ 0"
              value={filters.minPrice}
              onChange={(e) =>
                onChange({ ...filters, minPrice: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="maxPrice" className="text-sm">Max Price</Label>
            <Input
              id="maxPrice"
              type="number"
              placeholder="₹ 10,000"
              value={filters.maxPrice}
              onChange={(e) =>
                onChange({ ...filters, maxPrice: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {/* Age Range */}
      <div className="space-y-3">
        <Label className="text-base">Age Range</Label>
        <div className="space-y-2">
          {['0-2 years', '3-5 years', '6-8 years', '9-12 years', '12+ years'].map((age) => (
            <div key={age} className="flex items-center space-x-2">
              <Checkbox id={`age-${age}`} />
              <Label
                htmlFor={`age-${age}`}
                className="text-sm font-normal cursor-pointer"
              >
                {age}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="space-y-3">
        <Label className="text-base">Location</Label>
        <Input type="text" placeholder="Enter city or PIN code" />
      </div>
    </div>
  );
}
