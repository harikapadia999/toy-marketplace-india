'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X, Loader2, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const sellToySchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(100),
  description: z.string().min(50, 'Description must be at least 50 characters').max(1000),
  category: z.string().min(1, 'Please select a category'),
  brand: z.string().min(2, 'Brand name is required'),
  condition: z.enum(['new', 'like_new', 'good', 'fair']),
  originalPrice: z.string().min(1, 'Original price is required'),
  salePrice: z.string().min(1, 'Sale price is required'),
  ageRange: z.string().optional(),
  material: z.string().optional(),
  weight: z.string().optional(),
  dimensions: z.string().optional(),
});

type SellToyFormData = z.infer<typeof sellToySchema>;

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
  { value: 'new', label: 'New', description: 'Brand new, never used' },
  { value: 'like_new', label: 'Like New', description: 'Used once or twice, excellent condition' },
  { value: 'good', label: 'Good', description: 'Used but well maintained' },
  { value: 'fair', label: 'Fair', description: 'Shows signs of use but functional' },
];

export default function SellToyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<SellToyFormData>({
    resolver: zodResolver(sellToySchema),
  });

  const originalPrice = watch('originalPrice');
  const salePrice = watch('salePrice');
  const discount = originalPrice && salePrice 
    ? Math.round(((parseFloat(originalPrice) - parseFloat(salePrice)) / parseFloat(originalPrice)) * 100)
    : 0;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: SellToyFormData) => {
    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.createToy({
        ...data,
        images: images.map((img, i) => ({ url: img, alt: `${data.title} ${i + 1}` })),
        location: { city: 'Mumbai', state: 'Maharashtra' }, // TODO: Get from user
      });

      toast.success('Toy listed successfully!');
      router.push('/profile/listings');
    } catch (error: any) {
      console.error('Create toy error:', error);
      toast.error(error.response?.data?.message || 'Failed to list toy');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Sell Your Toy</h1>
        <p className="text-muted-foreground">
          List your toy in minutes and reach thousands of buyers
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: 'Basic Info' },
            { num: 2, label: 'Images' },
            { num: 3, label: 'Pricing' },
            { num: 4, label: 'Preview' },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                    step >= s.num
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted-foreground text-muted-foreground'
                  }`}
                >
                  {step > s.num ? <Check className="h-5 w-5" /> : s.num}
                </div>
                <span className="text-sm mt-2">{s.label}</span>
              </div>
              {i < 3 && (
                <div
                  className={`h-0.5 flex-1 ${
                    step > s.num ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Toy Title *</Label>
              <Input
                id="title"
                placeholder="e.g., LEGO City Police Station Building Set"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your toy in detail. Include condition, features, and any accessories..."
                rows={6}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select onValueChange={(value) => setValue('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Brand *</Label>
                <Input
                  id="brand"
                  placeholder="e.g., LEGO, Hot Wheels, Barbie"
                  {...register('brand')}
                />
                {errors.brand && (
                  <p className="text-sm text-destructive">{errors.brand.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Condition *</Label>
              <div className="grid gap-4 sm:grid-cols-2">
                {conditions.map((cond) => (
                  <label
                    key={cond.value}
                    className="flex items-start gap-3 rounded-lg border p-4 cursor-pointer hover:bg-muted"
                  >
                    <input
                      type="radio"
                      value={cond.value}
                      {...register('condition')}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium">{cond.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {cond.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {errors.condition && (
                <p className="text-sm text-destructive">{errors.condition.message}</p>
              )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ageRange">Age Range</Label>
                <Input
                  id="ageRange"
                  placeholder="e.g., 3-8 years"
                  {...register('ageRange')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="material">Material</Label>
                <Input
                  id="material"
                  placeholder="e.g., Plastic, Wood, Metal"
                  {...register('material')}
                />
              </div>
            </div>

            <Button type="button" onClick={() => setStep(2)} className="w-full">
              Continue to Images
            </Button>
          </div>
        )}

        {/* Step 2: Images */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Upload Images * (Max 5)</Label>
              <div className="grid gap-4 sm:grid-cols-3">
                {images.map((img, index) => (
                  <div key={index} className="relative aspect-square rounded-lg border overflow-hidden">
                    <img src={img} alt={`Upload ${index + 1}`} className="object-cover w-full h-full" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 rounded-full bg-destructive p-1 text-destructive-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {images.length < 5 && (
                  <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed hover:bg-muted">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="mt-2 text-sm text-muted-foreground">Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Upload clear photos from different angles. First image will be the cover photo.
              </p>
            </div>

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button
                type="button"
                onClick={() => setStep(3)}
                disabled={images.length === 0}
                className="flex-1"
              >
                Continue to Pricing
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Pricing */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="originalPrice">Original Price (₹) *</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  placeholder="2000"
                  {...register('originalPrice')}
                />
                {errors.originalPrice && (
                  <p className="text-sm text-destructive">{errors.originalPrice.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="salePrice">Your Selling Price (₹) *</Label>
                <Input
                  id="salePrice"
                  type="number"
                  placeholder="1200"
                  {...register('salePrice')}
                />
                {errors.salePrice && (
                  <p className="text-sm text-destructive">{errors.salePrice.message}</p>
                )}
              </div>
            </div>

            {discount > 0 && (
              <div className="rounded-lg bg-green-50 p-4 text-green-900">
                <p className="font-medium">Great pricing! 🎉</p>
                <p className="text-sm">
                  You're offering a {discount}% discount. This will attract more buyers!
                </p>
              </div>
            )}

            <div className="rounded-lg border p-4 space-y-2">
              <h3 className="font-semibold">Pricing Tips</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Check similar toys to price competitively</li>
                <li>• Consider the condition when pricing</li>
                <li>• Offer 30-50% off original price for used toys</li>
                <li>• Be open to reasonable offers</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button type="button" onClick={() => setStep(4)} className="flex-1">
                Preview Listing
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Preview */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="rounded-lg border p-6 space-y-4">
              <h3 className="text-xl font-bold">Preview Your Listing</h3>
              
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  {images[0] && (
                    <img
                      src={images[0]}
                      alt="Preview"
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-2xl font-bold">{watch('title')}</h4>
                    <p className="text-muted-foreground">{watch('brand')} • {watch('category')}</p>
                  </div>

                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold">₹{watch('salePrice')}</span>
                    <span className="text-lg text-muted-foreground line-through">
                      ₹{watch('originalPrice')}
                    </span>
                    {discount > 0 && (
                      <span className="rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
                        {discount}% OFF
                      </span>
                    )}
                  </div>

                  <p className="text-sm">{watch('description')}</p>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Condition:</span>
                      <span className="font-medium">{watch('condition')}</span>
                    </div>
                    {watch('ageRange') && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Age Range:</span>
                        <span className="font-medium">{watch('ageRange')}</span>
                      </div>
                    )}
                    {watch('material') && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Material:</span>
                        <span className="font-medium">{watch('material')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => setStep(3)} className="flex-1">
                Back
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  'Publish Listing'
                )}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
