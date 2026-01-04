import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useI18n } from '../contexts/I18nContext';

export const AnalyticsPage: React.FC = () => {
  const { t } = useI18n();
  const [timeRange, setTimeRange] = React.useState<'7d' | '30d' | '90d'>('30d');

  const { data: analytics } = useQuery({
    queryKey: ['analytics', timeRange],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/stats?range=${timeRange}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return res.json();
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('analytics.title')}
          </h1>

          {/* Time Range Selector */}
          <div className="flex gap-2">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  timeRange === range
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t(`analytics.${range}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Seller Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title={t('analytics.totalViews')}
            value={analytics?.data?.totalViews || 0}
            icon="👁️"
            trend="+12%"
            trendUp={true}
          />
          <StatCard
            title={t('analytics.totalSales')}
            value={analytics?.data?.totalSales || 0}
            icon="💰"
            trend="+8%"
            trendUp={true}
          />
          <StatCard
            title={t('analytics.activeListings')}
            value={analytics?.data?.activeListings || 0}
            icon="🧸"
            trend="+5"
            trendUp={true}
          />
          <StatCard
            title={t('analytics.avgRating')}
            value={(analytics?.data?.avgRating || 0).toFixed(1)}
            icon="⭐"
            trend="+0.2"
            trendUp={true}
          />
        </div>

        {/* Top Performing Listings */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">
              {t('analytics.topListings')}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('analytics.listing')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('analytics.views')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('analytics.sales')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('analytics.revenue')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('analytics.conversionRate')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {analytics?.data?.topListings?.map((listing: any) => (
                  <tr key={listing.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={listing.image}
                          alt={listing.title}
                          className="w-12 h-12 rounded-md object-cover mr-3"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{listing.title}</p>
                          <p className="text-sm text-gray-500">{listing.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {listing.views}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {listing.sales}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      ₹{listing.revenue}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        {listing.conversionRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">
              {t('analytics.trafficSources')}
            </h3>
            <div className="space-y-4">
              {analytics?.data?.trafficSources?.map((source: any) => (
                <div key={source.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {source.name}
                    </span>
                    <span className="text-sm text-gray-900">
                      {source.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">
              {t('analytics.topCategories')}
            </h3>
            <div className="space-y-4">
              {analytics?.data?.topCategories?.map((category: any) => (
                <div key={category.name} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{category.name}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {category.count} {t('analytics.listings')}
                  </span>
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
  trend?: string;
  trendUp?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, trendUp }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
      {trend && (
        <p className={`text-sm ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
          {trendUp ? '↑' : '↓'} {trend}
        </p>
      )}
    </div>
  );
};
