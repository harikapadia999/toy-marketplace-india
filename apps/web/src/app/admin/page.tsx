'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { 
  BarChart3, 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp,
  DollarSign,
  Eye,
  MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.getAdminStats(),
  });

  const statsCards = [
    {
      title: 'Total Revenue',
      value: formatPrice(stats?.data?.totalRevenue || 0),
      change: '+12.5%',
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Total Users',
      value: stats?.data?.totalUsers || 0,
      change: '+8.2%',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Active Listings',
      value: stats?.data?.activeListings || 0,
      change: '+15.3%',
      icon: Package,
      color: 'text-purple-600',
    },
    {
      title: 'Total Orders',
      value: stats?.data?.totalOrders || 0,
      change: '+23.1%',
      icon: ShoppingCart,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your toy marketplace
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-green-600 mt-1">
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="listings">Listings</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New listing created</p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Top Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Educational', count: 245, percentage: 35 },
                    { name: 'Outdoor & Sports', count: 189, percentage: 27 },
                    { name: 'Electronic', count: 156, percentage: 22 },
                    { name: 'Arts & Crafts', count: 112, percentage: 16 },
                  ].map((cat) => (
                    <div key={cat.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{cat.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {cat.count} listings
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        U{i}
                      </div>
                      <div>
                        <p className="font-medium">User {i}</p>
                        <p className="text-sm text-muted-foreground">user{i}@example.com</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/admin/users/${i}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="listings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Listings Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                      <span className="text-2xl">🧸</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Toy Listing {i}</p>
                      <p className="text-sm text-muted-foreground">₹999 • Educational</p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/admin/listings/${i}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Orders Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Order #ORD{1000 + i}</p>
                      <p className="text-sm text-muted-foreground">₹1,299 • 2 items</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm px-2 py-1 rounded-full bg-green-100 text-green-700">
                        Delivered
                      </span>
                      <Link href={`/admin/orders/${i}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
