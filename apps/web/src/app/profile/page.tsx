'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { 
  User, 
  Package, 
  Heart, 
  Settings, 
  LogOut,
  Edit,
  Star,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  const { data: myListings } = useQuery({
    queryKey: ['my-listings'],
    queryFn: () => api.getMyToys(),
  });

  const { data: myOrders } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => api.getMyOrders(),
  });

  if (!user) {
    return null;
  }

  return (
    <div className="container py-8">
      {/* Profile Header */}
      <div className="rounded-lg border p-6 mb-8">
        <div className="flex items-start justify-between">
          <div className="flex gap-6">
            {/* Avatar */}
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
              {user.name[0]}
            </div>

            {/* Info */}
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                  {user.isVerified && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      ✓ Verified
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">Member since {formatDate(user.createdAt || new Date())}</p>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>+91 {user.phone}</span>
                </div>
              </div>

              <div className="flex gap-6 text-sm">
                <div>
                  <div className="text-2xl font-bold">{myListings?.data?.length || 0}</div>
                  <div className="text-muted-foreground">Listings</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{myOrders?.data?.length || 0}</div>
                  <div className="text-muted-foreground">Orders</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">4.8</div>
                  <div className="text-muted-foreground">Rating</div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/profile/edit">
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Link>
            </Button>
            <Button variant="outline" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="listings">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="listings">
            <Package className="mr-2 h-4 w-4" />
            My Listings
          </TabsTrigger>
          <TabsTrigger value="orders">
            <Package className="mr-2 h-4 w-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="wishlist">
            <Heart className="mr-2 h-4 w-4" />
            Wishlist
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* My Listings */}
        <TabsContent value="listings" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">My Listings</h2>
              <Button asChild>
                <Link href="/sell">+ Add New Listing</Link>
              </Button>
            </div>

            {myListings?.data?.length === 0 ? (
              <div className="text-center py-12 border rounded-lg">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No listings yet</h3>
                <p className="text-muted-foreground mt-2">Start selling your toys today!</p>
                <Button asChild className="mt-4">
                  <Link href="/sell">Create Listing</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {myListings?.data?.map((toy: any) => (
                  <div key={toy.id} className="rounded-lg border overflow-hidden">
                    <div className="aspect-square bg-muted flex items-center justify-center">
                      <span className="text-6xl">🧸</span>
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="font-semibold line-clamp-1">{toy.title}</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold">₹{toy.salePrice}</span>
                        <span className="text-sm text-muted-foreground line-through">
                          ₹{toy.originalPrice}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <Link href={`/toys/${toy.id}`}>View</Link>
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Orders */}
        <TabsContent value="orders" className="mt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">My Orders</h2>

            {myOrders?.data?.length === 0 ? (
              <div className="text-center py-12 border rounded-lg">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No orders yet</h3>
                <p className="text-muted-foreground mt-2">Start shopping for toys!</p>
                <Button asChild className="mt-4">
                  <Link href="/toys">Browse Toys</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {myOrders?.data?.map((order: any) => (
                  <div key={order.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-semibold">Order #{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          Placed on {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <Badge>{order.status}</Badge>
                    </div>

                    <div className="flex gap-4">
                      <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                        <span className="text-2xl">🧸</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{order.toy?.title}</p>
                        <p className="text-sm text-muted-foreground">
                          ₹{order.totalAmount}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/orders/${order.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Wishlist */}
        <TabsContent value="wishlist" className="mt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">My Wishlist</h2>
            <div className="text-center py-12 border rounded-lg">
              <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No items in wishlist</h3>
              <p className="text-muted-foreground mt-2">
                Save your favorite toys to buy later!
              </p>
            </div>
          </div>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="mt-6">
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Account Settings</h2>

            <div className="rounded-lg border p-6 space-y-4">
              <h3 className="font-semibold">Notifications</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-sm">Email notifications</span>
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm">SMS notifications</span>
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm">Push notifications</span>
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                </label>
              </div>
            </div>

            <div className="rounded-lg border p-6 space-y-4">
              <h3 className="font-semibold">Privacy</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-sm">Show profile to public</span>
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm">Show phone number</span>
                  <input type="checkbox" className="h-4 w-4" />
                </label>
              </div>
            </div>

            <div className="rounded-lg border border-destructive p-6 space-y-4">
              <h3 className="font-semibold text-destructive">Danger Zone</h3>
              <Button variant="destructive">Delete Account</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
