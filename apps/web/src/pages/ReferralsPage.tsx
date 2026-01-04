import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useI18n } from '../contexts/I18nContext';

export const ReferralsPage: React.FC = () => {
  const { t } = useI18n();

  const { data: referralData } = useQuery({
    queryKey: ['referrals', 'my-code'],
    queryFn: async () => {
      const res = await fetch('/api/referrals/my-code', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return res.json();
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['referrals', 'stats'],
    queryFn: async () => {
      const res = await fetch('/api/referrals/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return res.json();
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Show toast notification
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {t('referrals.title')}
        </h1>

        {/* Referral Code Card */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-8 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-4">{t('referrals.shareAndEarn')}</h2>
          <p className="mb-6 opacity-90">{t('referrals.description')}</p>

          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-4">
            <p className="text-sm mb-2">{t('referrals.yourCode')}</p>
            <div className="flex items-center gap-3">
              <code className="text-2xl font-mono font-bold tracking-wider">
                {referralData?.data?.code}
              </code>
              <button
                onClick={() => copyToClipboard(referralData?.data?.code)}
                className="px-4 py-2 bg-white text-indigo-600 rounded-md hover:bg-gray-100"
              >
                {t('common.copy')}
              </button>
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <p className="text-sm mb-2">{t('referrals.shareLink')}</p>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={referralData?.data?.referralLink}
                readOnly
                className="flex-1 px-3 py-2 bg-white/30 rounded-md text-white placeholder-white/70"
              />
              <button
                onClick={() => copyToClipboard(referralData?.data?.referralLink)}
                className="px-4 py-2 bg-white text-indigo-600 rounded-md hover:bg-gray-100"
              >
                {t('common.copy')}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                {t('referrals.totalReferrals')}
              </h3>
              <span className="text-2xl">👥</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats?.data?.totalReferrals || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                {t('referrals.completedReferrals')}
              </h3>
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-3xl font-bold text-green-600">
              {stats?.data?.completedReferrals || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                {t('referrals.totalRewards')}
              </h3>
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-3xl font-bold text-indigo-600">
              ₹{stats?.data?.totalRewards || 0}
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {t('referrals.howItWorks')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📤</span>
              </div>
              <h3 className="font-semibold mb-2">{t('referrals.step1Title')}</h3>
              <p className="text-sm text-gray-600">{t('referrals.step1Desc')}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🛒</span>
              </div>
              <h3 className="font-semibold mb-2">{t('referrals.step2Title')}</h3>
              <p className="text-sm text-gray-600">{t('referrals.step2Desc')}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎁</span>
              </div>
              <h3 className="font-semibold mb-2">{t('referrals.step3Title')}</h3>
              <p className="text-sm text-gray-600">{t('referrals.step3Desc')}</p>
            </div>
          </div>
        </div>

        {/* Referral History */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">
              {t('referrals.history')}
            </h2>
          </div>
          <div className="divide-y">
            {stats?.data?.referrals?.length > 0 ? (
              stats.data.referrals.map((referral: any) => (
                <div key={referral.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {referral.referred.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(referral.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          referral.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : referral.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {t(`referrals.status.${referral.status}`)}
                      </span>
                      {referral.rewardAmount && (
                        <p className="text-sm font-medium text-indigo-600 mt-1">
                          +₹{referral.rewardAmount}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <span className="text-6xl mb-4 block">👥</span>
                <p className="text-gray-500">{t('referrals.noReferrals')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
