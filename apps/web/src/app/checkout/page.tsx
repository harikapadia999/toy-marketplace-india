'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, MapPin, CreditCard, Package, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCartStore } from '@/stores/cartStore';
import { formatPrice } from '@/lib/utils';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const addressSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
  addressLine1: z.string().min(5, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode'),
});

type AddressFormData = z.infer<typeof addressSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, getTotalSavings, clearCart } = useCartStore();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  });

  if (items.length === 0) {
    router.push('/cart');
    return null;
  }

  const onSubmit = async (data: AddressFormData) => {
    try {
      setIsProcessing(true);

      // Create order
      const order = await api.createOrder({
        items: items.map((item) => ({
          toyId: item.toyId,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: data,
        paymentMethod,
        totalAmount: getTotalPrice(),
      });

      // Clear cart
      clearCart();

      // Redirect to success page
      toast.success('Order placed successfully!');
      router.push(`/orders/${order.data.id}`);
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {[
            { num: 1, label: 'Address', icon: MapPin },
            { num: 2, label: 'Payment', icon: CreditCard },
            { num: 3, label: 'Review', icon: Package },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                    step >= s.num
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted-foreground text-muted-foreground'
                  }`}
                >
                  {step > s.num ? (
                    <Check className="h-6 w-6" />
                  ) : (
                    <s.icon className="h-6 w-6" />
                  )}
                </div>
                <span className="text-sm mt-2">{s.label}</span>
              </div>
              {i < 2 && (
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

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Step 1: Address */}
            {step === 1 && (
              <div className="rounded-lg border p-6 space-y-6">
                <h2 className="text-xl font-bold">Shipping Address</h2>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      {...register('fullName')}
                    />
                    {errors.fullName && (
                      <p className="text-sm text-destructive">
                        {errors.fullName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="flex gap-2">
                      <div className="flex items-center justify-center px-3 border rounded-md bg-muted">
                        <span className="text-sm">+91</span>
                      </div>
                      <Input
                        id="phone"
                        placeholder="9876543210"
                        maxLength={10}
                        {...register('phone')}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-sm text-destructive">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressLine1">Address Line 1 *</Label>
                  <Input
                    id="addressLine1"
                    placeholder="House No., Building Name"
                    {...register('addressLine1')}
                  />
                  {errors.addressLine1 && (
                    <p className="text-sm text-destructive">
                      {errors.addressLine1.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressLine2">Address Line 2</Label>
                  <Input
                    id="addressLine2"
                    placeholder="Road Name, Area, Colony"
                    {...register('addressLine2')}
                  />
                </div>

                <div className="grid gap-6 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="Mumbai"
                      {...register('city')}
                    />
                    {errors.city && (
                      <p className="text-sm text-destructive">
                        {errors.city.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      placeholder="Maharashtra"
                      {...register('state')}
                    />
                    {errors.state && (
                      <p className="text-sm text-destructive">
                        {errors.state.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      placeholder="400001"
                      maxLength={6}
                      {...register('pincode')}
                    />
                    {errors.pincode && (
                      <p className="text-sm text-destructive">
                        {errors.pincode.message}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full"
                >
                  Continue to Payment
                </Button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="rounded-lg border p-6 space-y-6">
                <h2 className="text-xl font-bold">Payment Method</h2>

                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer hover:bg-muted">
                      <RadioGroupItem value="razorpay" />
                      <div className="flex-1">
                        <div className="font-medium">Razorpay</div>
                        <div className="text-sm text-muted-foreground">
                          UPI, Cards, Wallets, Net Banking
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer hover:bg-muted">
                      <RadioGroupItem value="cod" />
                      <div className="flex-1">
                        <div className="font-medium">Cash on Delivery</div>
                        <div className="text-sm text-muted-foreground">
                          Pay when you receive
                        </div>
                      </div>
                    </label>
                  </div>
                </RadioGroup>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1"
                  >
                    Review Order
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="rounded-lg border p-6 space-y-4">
                  <h2 className="text-xl font-bold">Order Items</h2>
                  {items.map((item) => (
                    <div key={item.toyId} className="flex gap-4">
                      <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                        <span className="text-2xl">🧸</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatPrice(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Place Order'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 rounded-lg border p-6 space-y-4">
            <h2 className="text-xl font-bold">Order Summary</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)}{' '}
                  items)
                </span>
                <span className="font-medium">
                  {formatPrice(getTotalPrice() + getTotalSavings())}
                </span>
              </div>

              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatPrice(getTotalSavings())}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span className="font-medium text-green-600">FREE</span>
              </div>

              <div className="border-t pt-2 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatPrice(getTotalPrice())}</span>
              </div>
            </div>

            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-900">
              You're saving {formatPrice(getTotalSavings())}! 🎉
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
