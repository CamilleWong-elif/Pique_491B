import { ArrowLeft } from 'lucide-react';
import { mockFriendRatedEvents } from '../data/friendRatedEvents';
import { mockEvents } from '../data/mockData';
import { BottomNavigation } from '../components/BottomNavigation';

interface LeaderboardPageProps {
  onNavigate: (page: string, eventId?: string, options?: { friendName?: string }) => void;
  onOpenMessages?: () => void;
  unreadMessageCount?: number;
}

export function LeaderboardPage({ onNavigate, onOpenMessages, unreadMessageCount }: LeaderboardPageProps) {
  // Sort by rating (highest first), then by timestamp (most recent first)
  const sortedEvents = [...mockFriendRatedEvents].sort((a, b) => {
    if (b.rating !== a.rating) {
      return b.rating - a.rating;
    }
    return b.timestamp.getTime() - a.timestamp.getTime();
  });

  const handleEventClick = (eventId: string) => {
    onNavigate('event', eventId);
  };

  return (
    <div className="bg-white h-[932px] overflow-y-auto overflow-x-hidden">
      {/* Header */}
      <div className="px-[18px] pt-[52px] pb-4 bg-white sticky top-0 z-10">
        <div className="flex items-center mb-4">
          <button
            onClick={() => onNavigate('home')}
            className="mr-3"
          >
            <ArrowLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Leaderboard</h1>
        </div>
        <p className="text-sm text-gray-600">Events your friends have attended and rated</p>
      </div>

      {/* List View */}
      <div className="px-[18px] pb-[120px]">
        {sortedEvents.map((ratedEvent, index) => {
          const event = mockEvents.find(e => e.id === ratedEvent.eventId);
          if (!event) return null;

          // Calculate rating colors
          const getRatingColors = (rating: number) => {
            if (rating >= 4) {
              // Green scale: 4.0 = faint green, 5.0 = strong green
              const intensity = ((rating - 4) / 1) * 100; // 0-100%
              return {
                bg: intensity > 66 ? 'bg-green-100' : intensity > 33 ? 'bg-green-50' : 'bg-green-50',
                border: intensity > 66 ? 'border-green-500' : intensity > 33 ? 'border-green-400' : 'border-green-300',
                text: intensity > 66 ? 'text-green-800' : intensity > 33 ? 'text-green-700' : 'text-green-600'
              };
            } else if (rating >= 2) {
              // Yellow (current styling)
              return {
                bg: 'bg-yellow-100',
                border: 'border-yellow-400',
                text: 'text-yellow-700'
              };
            } else {
              // Red scale: 0.0 = strong red, 2.0 = faint red
              const intensity = (rating / 2) * 100; // 0-100%
              return {
                bg: intensity < 33 ? 'bg-red-100' : intensity < 66 ? 'bg-red-50' : 'bg-red-50',
                border: intensity < 33 ? 'border-red-500' : intensity < 66 ? 'border-red-400' : 'border-red-300',
                text: intensity < 33 ? 'text-red-800' : intensity < 66 ? 'text-red-700' : 'text-red-600'
              };
            }
          };

          const colors = getRatingColors(ratedEvent.rating);

          return (
            <div
              key={ratedEvent.id}
              className="w-full flex items-center justify-between py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                {/* Friend Avatar */}
                <div 
                  className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 cursor-pointer"
                  onClick={() => onNavigate('friendProfile', undefined, { friendName: ratedEvent.friendName })}
                >
                  <img
                    src={ratedEvent.friendAvatar}
                    alt={ratedEvent.friendName}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Event Info */}
                <div className="flex-1 text-left cursor-pointer" onClick={() => handleEventClick(ratedEvent.eventId)}>
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('friendProfile', undefined, { friendName: ratedEvent.friendName });
                      }}
                      className="hover:underline"
                    >
                      {ratedEvent.friendName}
                    </button>
                    <span> rated </span>
                    <span className="hover:underline">{ratedEvent.eventName}</span>
                  </h3>
                  {ratedEvent.reviewText && (
                    <p className="text-xs text-gray-500 line-clamp-1 pt-[0px] pr-[60px] pb-[0px] pl-[0px]">
                      {ratedEvent.reviewText}
                    </p>
                  )}
                </div>
              </div>

              {/* Rating */}
              <div 
                className={`w-[45px] h-[45px] rounded-full ${colors.bg} flex items-center justify-center flex-shrink-0 border-2 ${colors.border} cursor-pointer`}
                onClick={() => handleEventClick(ratedEvent.eventId)}
              >
                <span className={`text-[16px] font-bold ${colors.text}`}>{ratedEvent.rating.toFixed(1)}</span>
              </div>
            </div>
          );
        })}

        {sortedEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No rated events yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Check back when your friends rate events!
            </p>
          </div>
        )}
      </div>

      <BottomNavigation
        currentPage="leaderboard"
        onNavigate={onNavigate}
        onOpenMessages={onOpenMessages || (() => {})}
        unreadMessageCount={unreadMessageCount}
      />
    </div>
  );
}