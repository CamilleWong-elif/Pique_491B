import { useState } from 'react';
import { ChevronLeft, Bell, Lock, Eye, Globe, HelpCircle, Shield } from 'lucide-react';

interface SettingsPageProps {
  onNavigate: (page: string) => void;
}

export function SettingsPage({ onNavigate }: SettingsPageProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [eventReminders, setEventReminders] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [privateProfile, setPrivateProfile] = useState(false);
  const [showActivity, setShowActivity] = useState(true);
  const [language, setLanguage] = useState('English');

  return (
    <div className="bg-white h-[932px] overflow-y-auto overflow-x-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-[18px] pt-[59px] pb-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="w-[42px] h-[42px] rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-[18px] pb-20">
        {/* Notifications Section */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold">Notifications</h2>
          </div>
          
          <div className="space-y-4 bg-gray-50 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">Push Notifications</p>
                <p className="text-xs text-gray-600">Receive notifications on your device</p>
              </div>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`w-12 h-7 rounded-full transition-colors ${
                  notificationsEnabled ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                    notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">Event Reminders</p>
                <p className="text-xs text-gray-600">Get reminded about upcoming events</p>
              </div>
              <button
                onClick={() => setEventReminders(!eventReminders)}
                className={`w-12 h-7 rounded-full transition-colors ${
                  eventReminders ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                    eventReminders ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">Messages</p>
                <p className="text-xs text-gray-600">Notifications for new messages</p>
              </div>
              <button
                onClick={() => setMessageNotifications(!messageNotifications)}
                className={`w-12 h-7 rounded-full transition-colors ${
                  messageNotifications ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                    messageNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold">Privacy</h2>
          </div>
          
          <div className="space-y-4 bg-gray-50 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">Private Profile</p>
                <p className="text-xs text-gray-600">Only followers can see your profile</p>
              </div>
              <button
                onClick={() => setPrivateProfile(!privateProfile)}
                className={`w-12 h-7 rounded-full transition-colors ${
                  privateProfile ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                    privateProfile ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">Show Activity Status</p>
                <p className="text-xs text-gray-600">Let others see when you're active</p>
              </div>
              <button
                onClick={() => setShowActivity(!showActivity)}
                className={`w-12 h-7 rounded-full transition-colors ${
                  showActivity ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                    showActivity ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* App Preferences Section */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold">App Preferences</h2>
          </div>
          
          <div className="space-y-3 bg-gray-50 rounded-2xl p-4">
            <div>
              <p className="text-sm font-medium text-gray-800 mb-2">Language</p>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="English">English</option>
                <option value="Spanish">Español</option>
                <option value="French">Français</option>
                <option value="German">Deutsch</option>
                <option value="Italian">Italiano</option>
                <option value="Portuguese">Português</option>
              </select>
            </div>
          </div>
        </div>

        {/* Account Section */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold">Account</h2>
          </div>
          
          <div className="space-y-3 bg-gray-50 rounded-2xl p-4">
            <button className="w-full text-left px-3 py-3 rounded-lg hover:bg-white transition-colors">
              <p className="text-sm font-medium text-gray-800">Change Password</p>
              <p className="text-xs text-gray-600">Update your account password</p>
            </button>

            <button className="w-full text-left px-3 py-3 rounded-lg hover:bg-white transition-colors">
              <p className="text-sm font-medium text-gray-800">Blocked Users</p>
              <p className="text-xs text-gray-600">Manage your blocked list</p>
            </button>

            <button className="w-full text-left px-3 py-3 rounded-lg hover:bg-white transition-colors">
              <p className="text-sm font-medium text-red-600">Delete Account</p>
              <p className="text-xs text-gray-600">Permanently delete your account</p>
            </button>
          </div>
        </div>

        {/* About Section */}
        <div className="mt-8 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold">About</h2>
          </div>
          
          <div className="space-y-3 bg-gray-50 rounded-2xl p-4">
            <button className="w-full text-left px-3 py-3 rounded-lg hover:bg-white transition-colors">
              <p className="text-sm font-medium text-gray-800">App Version</p>
              <p className="text-xs text-gray-600">v1.0.0</p>
            </button>

            <button className="w-full text-left px-3 py-3 rounded-lg hover:bg-white transition-colors">
              <p className="text-sm font-medium text-gray-800">Help Center</p>
              <p className="text-xs text-gray-600">Get help and support</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}