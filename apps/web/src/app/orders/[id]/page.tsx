'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Package, MapPin, Calendar, CreditCard, Truck, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';

export default function OrderDetailPage() {
  const params = useParams();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', params.id],
    queryFn: () => api.getOrder(params.id as string),
  });

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Order not found</h1>
      </div>
    );
  }

  const statusSteps = [
    { label: 'Order Placed', icon: Package, completed: true },
    { label: 'Processing', icon: CreditCard, completed: order.data.status !== 'pending' },
    { label: 'Shipped', icon: Truck, completed: order.data.status === 'shipped' || order.data.status === 'delivered' },
    { label: 'Delivered', icon: CheckCircle, completed: order.data.status === 'delivered' },
  ];

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Order #{order.data.orderNumber}</h1>
            <p className="text-muted-foreground">
              Placed on {formatDate(order.data.createdAt)}
            </p>
          </div>
          <Badge variant={order.data.status === 'delivered' ? 'default' : 'outline'}>
            {order.data.status}
          </Badge>
        </div>
      </div>

      {/* Order Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Order Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {statusSteps.map((step, index) => (
              <div key={step.label} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                      step.completed
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted-foreground text-muted-foreground'
                    }`}
                  >
                    <step.icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm mt-2 text-center">{step.label}</span>
                </div>
                {index < statusSteps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 ${
                      step.completed ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.data.items?.map((item: any) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                    <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center">
                      <span className="text-3xl">🧸</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.toy?.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                      <p className="text-sm font-medium mt-1">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <p className="font-medium">{order.data.shippingAddress?.fullName}</p>
                <p>{order.data.shippingAddress?.addressLine1}</p>
                {order.data.shippingAddress?.addressLine2 && (
                  <p>{order.data.shippingAddress.addressLine2}</p>
                )}
                <p>
                  {order.data.shippingAddress?.city}, {order.data.shippingAddress?.state} -{' '}
                  {order.data.shippingAddress?.pincode}
                </p>
                <p className="pt-2">Phone: +91 {order.data.shippingAddress?.phone}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    {formatPrice(order.data.subtotal || order.data.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(order.data.discount || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-medium text-green-600">FREE</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(order.data.totalAmount)}</span>
                </div>
              </div>

              <div className="pt-4 border-t space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="font-medium">{order.data.paymentMethod}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Expected Delivery:</span>
                  <span className="font-medium">3-5 days</span>
                </div>
              </div>

              {order.data.status !== 'delivered' && order.data.status !== 'cancelled' && (
                <Button variant="outline" className="w-full">
                  Cancel Order
                </Button>
              )}

              <Button variant="outline" className="w-full">
                Download Invoice
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
