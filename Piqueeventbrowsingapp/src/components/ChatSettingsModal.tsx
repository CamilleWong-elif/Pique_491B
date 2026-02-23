import { X, Bell, BellOff, UserX, Flag, Trash2, Settings, Volume2, VolumeX, Info, Palette } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState } from 'react';

interface ChatSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  friendName: string;
  friendAvatar: string;
  isMuted: boolean;
  isBlocked: boolean;
  muteEndTime?: Date | null;
  chatTheme: string;
  onToggleMute: (duration?: number) => void;
  onToggleBlock: () => void;
  onDeleteChat: () => void;
  onReport: () => void;
  onChangeTheme: (theme: string) => void;
}

const chatThemes = [
  { id: 'default', name: 'Default', colors: { sent: 'bg-blue-500', received: 'bg-white', bg: 'bg-gray-50' } },
  { id: 'purple', name: 'Purple', colors: { sent: 'bg-purple-500', received: 'bg-white', bg: 'bg-purple-50' } },
  { id: 'green', name: 'Green', colors: { sent: 'bg-green-500', received: 'bg-white', bg: 'bg-green-50' } },
  { id: 'pink', name: 'Pink', colors: { sent: 'bg-pink-500', received: 'bg-white', bg: 'bg-pink-50' } },
  { id: 'orange', name: 'Orange', colors: { sent: 'bg-orange-500', received: 'bg-white', bg: 'bg-orange-50' } },
  { id: 'dark', name: 'Dark', colors: { sent: 'bg-gray-800', received: 'bg-gray-700', bg: 'bg-gray-900' } },
];

export function ChatSettingsModal({
  isOpen,
  onClose,
  friendName,
  friendAvatar,
  isMuted,
  isBlocked,
  muteEndTime,
  chatTheme,
  onToggleMute,
  onToggleBlock,
  onDeleteChat,
  onReport,
  onChangeTheme,
}: ChatSettingsModalProps) {
  const [showMuteOptions, setShowMuteOptions] = useState(false);
  const [showThemeOptions, setShowThemeOptions] = useState(false);

  if (!isOpen) return null;

  const handleMuteClick = () => {
    if (isMuted) {
      onToggleMute();
    } else {
      setShowMuteOptions(true);
    }
  };

  const handleMuteSelection = (duration?: number) => {
    onToggleMute(duration);
    setShowMuteOptions(false);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-[430px] bg-white rounded-t-3xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Chat Settings</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full overflow-hidden">
              <ImageWithFallback
                src={friendAvatar}
                alt={friendName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{friendName}</p>
              <p className="text-sm text-gray-500">View Profile</p>
            </div>
          </div>
        </div>

        {/* Settings Options */}
        <div className="px-4 py-2 max-h-[500px] overflow-y-auto">
          {/* Mute Notifications */}
          <button
            onClick={handleMuteClick}
            className="w-full flex items-center gap-4 px-4 py-4 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isMuted ? 'bg-gray-100' : 'bg-sky-100'
            }`}>
              {isMuted ? (
                <BellOff className="w-5 h-5 text-gray-600" />
              ) : (
                <Bell className="w-5 h-5 text-sky-600" />
              )}
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900">
                {isMuted ? 'Unmute Notifications' : 'Mute Notifications'}
              </p>
              <p className="text-sm text-gray-500">
                {isMuted 
                  ? muteEndTime 
                    ? `Muted until ${muteEndTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
                    : 'Muted indefinitely'
                  : 'Stop receiving notifications'
                }
              </p>
            </div>
          </button>

          {/* Mute Duration Options */}
          {showMuteOptions && (
            <div className="ml-14 mr-4 mb-2 bg-blue-50 rounded-xl overflow-hidden border border-blue-200">
              <p className="px-4 pt-3 pb-2 text-sm font-medium text-gray-700">Mute for:</p>
              <button
                onClick={() => handleMuteSelection(30)}
                className="w-full px-4 py-3 text-left hover:bg-blue-100 transition-colors border-t border-blue-200"
              >
                <p className="font-medium text-gray-900">30 minutes</p>
              </button>
              <button
                onClick={() => handleMuteSelection(60)}
                className="w-full px-4 py-3 text-left hover:bg-blue-100 transition-colors border-t border-blue-200"
              >
                <p className="font-medium text-gray-900">1 hour</p>
              </button>
              <button
                onClick={() => handleMuteSelection(120)}
                className="w-full px-4 py-3 text-left hover:bg-blue-100 transition-colors border-t border-blue-200"
              >
                <p className="font-medium text-gray-900">2 hours</p>
              </button>
              <button
                onClick={() => handleMuteSelection(300)}
                className="w-full px-4 py-3 text-left hover:bg-blue-100 transition-colors border-t border-blue-200"
              >
                <p className="font-medium text-gray-900">5 hours</p>
              </button>
              <button
                onClick={() => handleMuteSelection(undefined)}
                className="w-full px-4 py-3 text-left hover:bg-blue-100 transition-colors border-t border-blue-200"
              >
                <p className="font-medium text-gray-900">Until I turn it back on</p>
              </button>
            </div>
          )}

          {/* Chat Info */}
          <button
            className="w-full flex items-center gap-4 px-4 py-4 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Info className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900">Chat Info</p>
              <p className="text-sm text-gray-500">View shared media and links</p>
            </div>
          </button>

          {/* Theme/Appearance */}
          <button
            onClick={() => setShowThemeOptions(!showThemeOptions)}
            className="w-full flex items-center gap-4 px-4 py-4 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
              <Settings className="w-5 h-5 text-pink-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900">Theme</p>
              <p className="text-sm text-gray-500">Customize chat appearance</p>
            </div>
          </button>

          {showThemeOptions && (
            <div className="ml-14 mr-4 mb-2 bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
              <p className="px-4 pt-3 pb-2 text-sm font-medium text-gray-700">Select Theme:</p>
              {chatThemes.map(theme => {
                const isSelected = chatTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => {
                      onChangeTheme(theme.id);
                      setShowThemeOptions(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors border-t border-gray-200 flex items-center justify-between ${
                      isSelected ? 'bg-gray-100' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${theme.colors.sent}`} />
                      <p className="font-medium text-gray-900">{theme.name}</p>
                    </div>
                    {isSelected && (
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <div className="h-px bg-gray-200 my-2" />

          {/* Block User */}
          <button
            onClick={onToggleBlock}
            className="w-full flex items-center gap-4 px-4 py-4 hover:bg-red-50 rounded-xl transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <UserX className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-red-600">
                {isBlocked ? 'Unblock User' : 'Block User'}
              </p>
              <p className="text-sm text-gray-500">
                {isBlocked ? 'Allow messages from this person' : 'Stop receiving messages'}
              </p>
            </div>
          </button>

          {/* Report */}
          <button
            onClick={onReport}
            className="w-full flex items-center gap-4 px-4 py-4 hover:bg-orange-50 rounded-xl transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <Flag className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-orange-600">Report</p>
              <p className="text-sm text-gray-500">Report this conversation</p>
            </div>
          </button>

          {/* Delete Chat */}
          <button
            onClick={onDeleteChat}
            className="w-full flex items-center gap-4 px-4 py-4 hover:bg-red-50 rounded-xl transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-red-600">Delete Chat</p>
              <p className="text-sm text-gray-500">Clear all messages and delete</p>
            </div>
          </button>
        </div>

        {/* Bottom padding for safe area */}
        <div className="h-8" />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}} />
    </div>
  );
}