import React from 'react';
import { useI18n } from '../contexts/I18nContext';

interface SettingsPageProps {}

export const SettingsPage: React.FC<SettingsPageProps> = () => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = React.useState('general');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {t('settings.title')}
        </h1>

        <div className="bg-white shadow rounded-lg">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {['general', 'notifications', 'privacy', 'security', 'account'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    py-4 px-6 text-sm font-medium border-b-2
                    ${activeTab === tab
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {t(`settings.tabs.${tab}`)}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'general' && <GeneralSettings />}
            {activeTab === 'notifications' && <NotificationSettings />}
            {activeTab === 'privacy' && <PrivacySettings />}
            {activeTab === 'security' && <SecuritySettings />}
            {activeTab === 'account' && <AccountSettings />}
          </div>
        </div>
      </div>
    </div>
  );
};

const GeneralSettings: React.FC = () => {
  const { t, language, setLanguage } = useI18n();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t('settings.general.title')}
        </h3>

        <div className="space-y-4">
          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('settings.general.language')}
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="bn">বাংলা (Bengali)</option>
            </select>
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('settings.general.timezone')}
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="Asia/Kolkata">India (IST)</option>
              <option value="Asia/Dubai">Dubai (GST)</option>
              <option value="America/New_York">New York (EST)</option>
            </select>
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('settings.general.currency')}
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="INR">₹ INR - Indian Rupee</option>
              <option value="USD">$ USD - US Dollar</option>
              <option value="EUR">€ EUR - Euro</option>
            </select>
          </div>
        </div>
      </div>

      <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
        {t('common.save')}
      </button>
    </div>
  );
};

const NotificationSettings: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">
        {t('settings.notifications.title')}
      </h3>

      <div className="space-y-4">
        {/* Email Notifications */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">
              {t('settings.notifications.email')}
            </p>
            <p className="text-sm text-gray-500">
              {t('settings.notifications.emailDesc')}
            </p>
          </div>
          <input type="checkbox" className="h-5 w-5 text-indigo-600" defaultChecked />
        </div>

        {/* SMS Notifications */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">
              {t('settings.notifications.sms')}
            </p>
            <p className="text-sm text-gray-500">
              {t('settings.notifications.smsDesc')}
            </p>
          </div>
          <input type="checkbox" className="h-5 w-5 text-indigo-600" />
        </div>

        {/* Push Notifications */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">
              {t('settings.notifications.push')}
            </p>
            <p className="text-sm text-gray-500">
              {t('settings.notifications.pushDesc')}
            </p>
          </div>
          <input type="checkbox" className="h-5 w-5 text-indigo-600" defaultChecked />
        </div>

        {/* Order Updates */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">
              {t('settings.notifications.orders')}
            </p>
            <p className="text-sm text-gray-500">
              {t('settings.notifications.ordersDesc')}
            </p>
          </div>
          <input type="checkbox" className="h-5 w-5 text-indigo-600" defaultChecked />
        </div>

        {/* Marketing */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">
              {t('settings.notifications.marketing')}
            </p>
            <p className="text-sm text-gray-500">
              {t('settings.notifications.marketingDesc')}
            </p>
          </div>
          <input type="checkbox" className="h-5 w-5 text-indigo-600" />
        </div>
      </div>

      <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
        {t('common.save')}
      </button>
    </div>
  );
};

const PrivacySettings: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">
        {t('settings.privacy.title')}
      </h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">
              {t('settings.privacy.showEmail')}
            </p>
            <p className="text-sm text-gray-500">
              {t('settings.privacy.showEmailDesc')}
            </p>
          </div>
          <input type="checkbox" className="h-5 w-5 text-indigo-600" />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">
              {t('settings.privacy.showPhone')}
            </p>
            <p className="text-sm text-gray-500">
              {t('settings.privacy.showPhoneDesc')}
            </p>
          </div>
          <input type="checkbox" className="h-5 w-5 text-indigo-600" />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">
              {t('settings.privacy.showOnline')}
            </p>
            <p className="text-sm text-gray-500">
              {t('settings.privacy.showOnlineDesc')}
            </p>
          </div>
          <input type="checkbox" className="h-5 w-5 text-indigo-600" defaultChecked />
        </div>
      </div>

      <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
        {t('common.save')}
      </button>
    </div>
  );
};

const SecuritySettings: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">
        {t('settings.security.title')}
      </h3>

      <div className="space-y-4">
        {/* Change Password */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">
            {t('settings.security.changePassword')}
          </h4>
          <div className="space-y-3">
            <input
              type="password"
              placeholder={t('settings.security.currentPassword')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              type="password"
              placeholder={t('settings.security.newPassword')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              type="password"
              placeholder={t('settings.security.confirmPassword')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <button className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            {t('settings.security.updatePassword')}
          </button>
        </div>

        {/* Two-Factor Authentication */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">
                {t('settings.security.twoFactor')}
              </p>
              <p className="text-sm text-gray-500">
                {t('settings.security.twoFactorDesc')}
              </p>
            </div>
            <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
              {t('settings.security.enable')}
            </button>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="pt-4 border-t">
          <h4 className="font-medium text-gray-900 mb-3">
            {t('settings.security.activeSessions')}
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div>
                <p className="font-medium">Chrome on Windows</p>
                <p className="text-sm text-gray-500">Mumbai, India • Active now</p>
              </div>
              <button className="text-red-600 hover:text-red-700">
                {t('settings.security.revoke')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AccountSettings: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">
        {t('settings.account.title')}
      </h3>

      <div className="space-y-4">
        {/* Export Data */}
        <div className="p-4 border border-gray-200 rounded-md">
          <h4 className="font-medium text-gray-900 mb-2">
            {t('settings.account.exportData')}
          </h4>
          <p className="text-sm text-gray-500 mb-3">
            {t('settings.account.exportDataDesc')}
          </p>
          <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
            {t('settings.account.downloadData')}
          </button>
        </div>

        {/* Deactivate Account */}
        <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-md">
          <h4 className="font-medium text-gray-900 mb-2">
            {t('settings.account.deactivate')}
          </h4>
          <p className="text-sm text-gray-500 mb-3">
            {t('settings.account.deactivateDesc')}
          </p>
          <button className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700">
            {t('settings.account.deactivateButton')}
          </button>
        </div>

        {/* Delete Account */}
        <div className="p-4 border border-red-200 bg-red-50 rounded-md">
          <h4 className="font-medium text-red-900 mb-2">
            {t('settings.account.delete')}
          </h4>
          <p className="text-sm text-red-700 mb-3">
            {t('settings.account.deleteDesc')}
          </p>
          <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
            {t('settings.account.deleteButton')}
          </button>
        </div>
      </div>
    </div>
  );
};
