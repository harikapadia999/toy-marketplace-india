import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useI18n } from '../contexts/I18nContext';

export const NotificationsPage: React.FC = () => {
  const { t } = useI18n();
  const [filter, setFilter] = React.useState<'all' | 'unread'>('all');

  const { data: notifications, refetch } = useQuery({
    queryKey: ['notifications', filter],
    queryFn: async () => {
      const res = await fetch(`/api/notifications?unreadOnly=${filter === 'unread'}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return res.json();
    },
  });

  const { data: unreadCount } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const res = await fetch('/api/notifications/unread-count', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return res.json();
    },
  });

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    refetch();
  };

  const markAllAsRead = async () => {
    await fetch('/api/notifications/read-all', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    refetch();
  };

  const deleteNotification = async (id: string) => {
    await fetch(`/api/notifications/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    refetch();
  };

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      order: '📦',
      message: '💬',
      listing: '🧸',
      review: '⭐',
      system: '🔔',
    };
    return icons[type] || '🔔';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t('notifications.title')}
            </h1>
            {unreadCount?.count > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {unreadCount.count} {t('notifications.unread')}
              </p>
            )}
          </div>
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 text-sm text-indigo-600 hover:text-indigo-700"
          >
            {t('notifications.markAllRead')}
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setFilter('all')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  filter === 'all'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t('notifications.all')}
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  filter === 'unread'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t('notifications.unread')}
                {unreadCount?.count > 0 && (
                  <span className="ml-2 px-2 py-1 text-xs bg-indigo-100 text-indigo-600 rounded-full">
                    {unreadCount.count}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow divide-y">
          {notifications?.data?.length > 0 ? (
            notifications.data.map((notification: any) => (
              <div
                key={notification.id}
                className={`p-6 hover:bg-gray-50 ${
                  !notification.read ? 'bg-indigo-50' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-2xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-md"
                            title={t('notifications.markRead')}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                          title={t('notifications.delete')}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {notification.actionUrl && (
                      <a
                        href={notification.actionUrl}
                        className="inline-block mt-3 text-sm text-indigo-600 hover:text-indigo-700"
                      >
                        {t('notifications.viewDetails')} →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <span className="text-6xl mb-4 block">🔔</span>
              <p className="text-gray-500">
                {filter === 'unread'
                  ? t('notifications.noUnread')
                  : t('notifications.noNotifications')}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {notifications?.pagination && notifications.pagination.pages > 1 && (
          <div className="mt-6 flex justify-center">
            <nav className="flex gap-2">
              {Array.from({ length: notifications.pagination.pages }, (_, i) => (
                <button
                  key={i + 1}
                  className={`px-4 py-2 rounded-md ${
                    notifications.pagination.page === i + 1
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};
