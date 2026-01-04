import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useI18n } from '../contexts/I18nContext';

export const SavedSearchesPage: React.FC = () => {
  const { t } = useI18n();
  const [showCreateModal, setShowCreateModal] = React.useState(false);

  const { data: searches, refetch } = useQuery({
    queryKey: ['saved-searches'],
    queryFn: async () => {
      const res = await fetch('/api/saved-searches', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return res.json();
    },
  });

  const deleteSearch = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/saved-searches/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
    },
    onSuccess: () => refetch(),
  });

  const toggleNotifications = useMutation({
    mutationFn: async ({ id, notifyOnNew }: { id: string; notifyOnNew: boolean }) => {
      await fetch(`/api/saved-searches/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notifyOnNew }),
      });
    },
    onSuccess: () => refetch(),
  });

  const runSearch = (query: any) => {
    const params = new URLSearchParams(query);
    window.location.href = `/toys?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('savedSearches.title')}
          </h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            {t('savedSearches.create')}
          </button>
        </div>

        {searches?.data?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searches.data.map((search: any) => (
              <div key={search.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {search.name}
                    </h3>
                    <button
                      onClick={() => deleteSearch.mutate(search.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  {/* Search Criteria */}
                  <div className="space-y-2 mb-4">
                    {search.query.search && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">{t('savedSearches.keyword')}:</span>
                        <span className="font-medium">{search.query.search}</span>
                      </div>
                    )}
                    {search.query.category && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">{t('savedSearches.category')}:</span>
                        <span className="font-medium">{search.query.category}</span>
                      </div>
                    )}
                    {search.query.minPrice && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">{t('savedSearches.priceRange')}:</span>
                        <span className="font-medium">
                          ₹{search.query.minPrice} - ₹{search.query.maxPrice}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Notifications Toggle */}
                  <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-md">
                    <span className="text-sm text-gray-700">
                      {t('savedSearches.notifications')}
                    </span>
                    <button
                      onClick={() =>
                        toggleNotifications.mutate({
                          id: search.id,
                          notifyOnNew: !search.notifyOnNew,
                        })
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        search.notifyOnNew ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          search.notifyOnNew ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Run Search Button */}
                  <button
                    onClick={() => runSearch(search.query)}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    {t('savedSearches.runSearch')}
                  </button>

                  <p className="text-xs text-gray-500 mt-3">
                    {t('savedSearches.created')}: {new Date(search.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <span className="text-6xl mb-4 block">🔍</span>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('savedSearches.noSearches')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('savedSearches.noSearchesDesc')}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              {t('savedSearches.createFirst')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
