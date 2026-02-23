import { X, TrendingUp, Heart, MessageSquare, UserPlus, Trophy, Star, Calendar } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'rank_up' | 'friend_request' | 'event_reminder' | 'achievement' | 'friend_activity';
  userName?: string;
  userAvatar?: string;
  message: string;
  timestamp: string;
  read: boolean;
  eventName?: string;
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  unreadCount: number;
}

export function NotificationsModal({ 
  isOpen, 
  onClose, 
  notifications, 
  onMarkAsRead,
  onMarkAllAsRead,
  unreadCount 
}: NotificationsModalProps) {
  if (!isOpen) return null;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" fill="currentColor" />;
      case 'comment':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'rank_up':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'friend_request':
        return <UserPlus className="w-5 h-5 text-purple-500" />;
      case 'event_reminder':
        return <Calendar className="w-5 h-5 text-orange-500" />;
      case 'achievement':
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'friend_activity':
        return <Star className="w-5 h-5 text-sky-500" />;
      default:
        return <Star className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-[430px] h-full bg-white shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 pt-[59px]">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          {unreadCount > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
              <button
                onClick={onMarkAllAsRead}
                className="text-sm text-sky-600 hover:text-sky-700 font-medium"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Star className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-center px-8">No notifications yet</p>
              <p className="text-sm text-gray-400 text-center px-8 mt-2">
                You'll see updates about your posts, friends, and rankings here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => onMarkAsRead(notification.id)}
                  className={`w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-sky-50' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    {/* User Avatar or Icon */}
                    <div className="flex-shrink-0">
                      {notification.userAvatar ? (
                        <div className="w-12 h-12 rounded-full overflow-hidden">
                          <ImageWithFallback
                            src={notification.userAvatar}
                            alt={notification.userName || 'User'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 leading-snug">
                        {notification.userName && (
                          <span className="font-semibold">{notification.userName} </span>
                        )}
                        {notification.message}
                      </p>
                      {notification.eventName && (
                        <p className="text-xs text-gray-600 mt-1">
                          Event: {notification.eventName}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
                    </div>

                    {/* Unread Indicator */}
                    {!notification.read && (
                      <div className="flex-shrink-0 pt-2">
                        <div className="w-2 h-2 rounded-full bg-sky-500" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}