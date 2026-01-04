import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export const AdminDashboard: React.FC = () => {
  const { data: overview } = useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: async () => {
      const res = await fetch('/api/admin/overview', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return res.json();
    },
  });

  const { data: salesData } = useQuery({
    queryKey: ['admin', 'sales'],
    queryFn: async () => {
      const res = await fetch('/api/admin/analytics/sales', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return res.json();
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={overview?.data?.stats?.totalUsers || 0}
            icon="👥"
            color="blue"
          />
          <StatCard
            title="Total Listings"
            value={overview?.data?.stats?.totalToys || 0}
            icon="🧸"
            color="green"
          />
          <StatCard
            title="Total Orders"
            value={overview?.data?.stats?.totalOrders || 0}
            icon="📦"
            color="purple"
          />
          <StatCard
            title="Total Revenue"
            value={`₹${overview?.data?.stats?.totalRevenue || 0}`}
            icon="💰"
            color="yellow"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Sales Overview</h3>
            {salesData && (
              <Line
                data={{
                  labels: salesData.data?.map((d: any) => d.period) || [],
                  datasets: [
                    {
                      label: 'Revenue',
                      data: salesData.data?.map((d: any) => d.total_revenue) || [],
                      borderColor: 'rgb(79, 70, 229)',
                      backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'top' },
                    title: { display: false },
                  },
                }}
              />
            )}
          </div>

          {/* Orders Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Orders by Status</h3>
            <Doughnut
              data={{
                labels: ['Pending', 'Processing', 'Shipped', 'Delivered'],
                datasets: [
                  {
                    data: [12, 19, 15, 54],
                    backgroundColor: [
                      'rgba(255, 206, 86, 0.8)',
                      'rgba(54, 162, 235, 0.8)',
                      'rgba(153, 102, 255, 0.8)',
                      'rgba(75, 192, 192, 0.8)',
                    ],
                  },
                ],
              }}
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Recent Orders</h3>
            </div>
            <div className="divide-y">
              {overview?.data?.recentOrders?.map((order: any) => (
                <div key={order.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">{order.buyer.name}</p>
                    </div>
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      ₹{order.totalAmount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Recent Users</h3>
            </div>
            <div className="divide-y">
              {overview?.data?.recentUsers?.map((user: any) => (
                <div key={user.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'yellow';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${colorClasses[color]} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
};
