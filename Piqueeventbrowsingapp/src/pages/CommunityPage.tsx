import { useState } from 'react';
import { ArrowLeft, Trophy, Info, X, Plus, Globe, Users } from 'lucide-react';
import { mockFriendRatedEvents } from '../data/friendRatedEvents';
import { mockEvents, mockFriends } from '../data/mockData';
import { globalLeaderboardUsers } from '../data/globalLeaderboard';
import { BottomNavigation } from '../components/BottomNavigation';

interface CommunityPageProps {
  onNavigate: (page: string, eventId?: string, options?: { friendName?: string }) => void;
  onOpenMessages?: () => void;
  unreadMessageCount?: number;
}

// Mock data for friends who are "going" to events (2 points each)
const mockFriendGoing = [
  { friendId: 'f1', friendName: 'Sarah', eventId: '1' },
  { friendId: 'f1', friendName: 'Sarah', eventId: '5' },
  { friendId: 'f2', friendName: 'Javier', eventId: '3' },
  { friendId: 'f3', friendName: 'Mike', eventId: '2' },
  { friendId: 'f3', friendName: 'Mike', eventId: '4' },
  { friendId: 'f3', friendName: 'Mike', eventId: '7' },
  { friendId: 'f3', friendName: 'Mike', eventId: '8' },
  { friendId: 'f4', friendName: 'Emma', eventId: '6' },
  { friendId: 'f5', friendName: 'Alex', eventId: '10' },
  { friendId: 'f6', friendName: 'Maya', eventId: '3' },
  { friendId: 'f6', friendName: 'Maya', eventId: '5' },
  { friendId: 'f7', friendName: 'Carlos', eventId: '1' },
  { friendId: 'f8', friendName: 'Lily', eventId: '2' },
  { friendId: 'f8', friendName: 'Lily', eventId: '6' },
  { friendId: 'f9', friendName: 'Ryan', eventId: '7' },
  { friendId: 'f10', friendName: 'Nina', eventId: '9' },
  { friendId: 'f11', friendName: 'David', eventId: '8' },
  { friendId: 'f12', friendName: 'Sophia', eventId: '11' },
  { friendId: 'f13', friendName: 'Marcus', eventId: '13' },
  { friendId: 'f14', friendName: 'Isabella', eventId: '14' },
  { friendId: 'f15', friendName: 'Tyler', eventId: '15' },
  { friendId: 'f16', friendName: 'Olivia', eventId: '16' },
  { friendId: 'f17', friendName: 'Jake', eventId: '17' },
  { friendId: 'f18', friendName: 'Chloe', eventId: '18' },
  { friendId: 'f19', friendName: 'Ethan', eventId: '1' },
  { friendId: 'f20', friendName: 'Ava', eventId: '2' },
  { friendId: 'f21', friendName: 'Lucas', eventId: '3' },
  { friendId: 'f22', friendName: 'Mia', eventId: '4' },
  { friendId: 'f23', friendName: 'Noah', eventId: '5' },
  { friendId: 'f24', friendName: 'Emily', eventId: '6' },
  { friendId: 'f25', friendName: 'Liam', eventId: '7' },
  { friendId: 'f26', friendName: 'Zoe', eventId: '8' },
];

type Tab = 'leaderboard' | 'reviews';
type LeaderboardMode = 'global' | 'friends';

export function CommunityPage({ onNavigate, onOpenMessages, unreadMessageCount }: CommunityPageProps) {
  const [activeTab, setActiveTab] = useState<Tab>('leaderboard');
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [leaderboardMode, setLeaderboardMode] = useState<LeaderboardMode>('friends');

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowPointsModal(false);
      setIsClosing(false);
    }, 300); // Match animation duration
  };

  // Calculate points for each friend
  const calculatePoints = () => {
    const pointsMap = new Map<string, { name: string; avatar: string; points: number }>();

    // Initialize all friends with 0 points
    mockFriends.forEach(friend => {
      // Check if friend exists in global leaderboard
      const globalFriend = globalLeaderboardUsers.find(u => u.id === friend.id);
      
      pointsMap.set(friend.id, {
        name: friend.name,
        avatar: friend.avatar,
        points: globalFriend ? globalFriend.points : 0
      });
    });

    // Convert to array and sort by points (descending)
    return Array.from(pointsMap.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.points - a.points);
  };

  const leaderboard = calculatePoints();

  // Sort events for recent reviews tab
  const sortedEvents = [...mockFriendRatedEvents].sort((a, b) => {
    if (b.rating !== a.rating) {
      return b.rating - a.rating;
    }
    return b.timestamp.getTime() - a.timestamp.getTime();
  });

  const handleEventClick = (eventId: string) => {
    onNavigate('event', eventId);
  };

  // Calculate rating colors (for reviews tab)
  const getRatingColors = (rating: number) => {
    if (rating >= 4) {
      const intensity = ((rating - 4) / 1) * 100;
      return {
        bg: intensity > 66 ? 'bg-green-100' : intensity > 33 ? 'bg-green-50' : 'bg-green-50',
        border: intensity > 66 ? 'border-green-500' : intensity > 33 ? 'border-green-400' : 'border-green-300',
        text: intensity > 66 ? 'text-green-800' : intensity > 33 ? 'text-green-700' : 'text-green-600'
      };
    } else if (rating >= 2) {
      return {
        bg: 'bg-yellow-100',
        border: 'border-yellow-400',
        text: 'text-yellow-700'
      };
    } else {
      const intensity = (rating / 2) * 100;
      return {
        bg: intensity < 33 ? 'bg-red-100' : intensity < 66 ? 'bg-red-50' : 'bg-red-50',
        border: intensity < 33 ? 'border-red-500' : intensity < 66 ? 'border-red-400' : 'border-red-300',
        text: intensity < 33 ? 'text-red-800' : intensity < 66 ? 'text-red-700' : 'text-red-600'
      };
    }
  };

  const getTrophyColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-500'; // Gold
      case 2: return 'text-gray-400'; // Silver
      case 3: return 'text-orange-600'; // Bronze
      default: return '';
    }
  };

  return (
    <div className="bg-white h-[932px] overflow-y-auto overflow-x-hidden">
      {/* Blur overlay when modal is open */}
      <div className={`transition-all duration-300 ${showPointsModal ? 'blur-sm' : ''}`}>
        {/* Header */}
        <div className="px-[18px] pt-[59px] pb-4 bg-white sticky top-0 z-10"> {/* Added notch padding */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <button
                onClick={() => onNavigate('home')}
                className="mr-3"
              >
                <ArrowLeft className="w-6 h-6 text-gray-800" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Community</h1>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-colors ${
                activeTab === 'leaderboard'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Leaderboard
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-colors ${
                activeTab === 'reviews'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Friend Reviews
            </button>
          </div>
        </div>

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div className="px-[18px] pb-[120px]">
            {/* Toggle Between Global and Friends */}
            <div className="mb-4 flex items-center gap-3">
              <div className="flex-1 bg-gray-100 rounded-lg p-1 flex gap-1">
                <button
                  onClick={() => setLeaderboardMode('friends')}
                  className={`flex-1 py-2 px-3 rounded-md font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                    leaderboardMode === 'friends'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Friends</span>
                </button>
                <button
                  onClick={() => setLeaderboardMode('global')}
                  className={`flex-1 py-2 px-3 rounded-md font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                    leaderboardMode === 'global'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span>Global</span>
                </button>
              </div>
              <button
                onClick={() => setShowPointsModal(true)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              >
                <Info className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="mb-3">
              <p className="text-sm text-gray-600">
                {leaderboardMode === 'friends' 
                  ? 'Your friends ranked by activity points'
                  : 'Everyone ranked by activity points'}
              </p>
            </div>

            {/* Leaderboard List */}
            <div className="space-y-2">
              {(leaderboardMode === 'friends' ? leaderboard : globalLeaderboardUsers).map((user, index) => {
                const rank = index + 1;
                const showTrophy = rank <= 3;
                const isFriend = leaderboardMode === 'global' && 'isFriend' in user && user.isFriend;
                
                return (
                  <div
                    key={user.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      isFriend ? 'bg-sky-50 hover:bg-sky-100' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    {/* Rank or Trophy */}
                    <div className="w-8 flex items-center justify-center flex-shrink-0">
                      {showTrophy ? (
                        <Trophy className={`w-5 h-5 ${getTrophyColor(rank)}`} fill="currentColor" />
                      ) : (
                        <span className="text-lg font-bold text-gray-500">#{rank}</span>
                      )}
                    </div>

                    {/* User Avatar */}
                    <div 
                      className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 cursor-pointer relative"
                      onClick={() => leaderboardMode === 'friends' || isFriend ? onNavigate('friendProfile', undefined, { friendName: user.name }) : undefined}
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                      {isFriend && (
                        <div className="absolute inset-0 ring-2 ring-sky-400 rounded-full" />
                      )}
                    </div>

                    {/* User Name */}
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      {leaderboardMode === 'friends' || isFriend ? (
                        <button
                          onClick={() => onNavigate('friendProfile', undefined, { friendName: user.name })}
                          className="text-base font-semibold text-gray-900 hover:underline truncate text-left"
                        >
                          {user.name}
                        </button>
                      ) : (
                        <span className="text-base font-semibold text-gray-900 truncate">
                          {user.name}
                        </span>
                      )}
                      {isFriend && (
                        <span className="text-xs bg-sky-200 text-sky-800 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                          Friend
                        </span>
                      )}
                    </div>

                    {/* Points */}
                    <div className="flex flex-col items-end flex-shrink-0 min-w-[60px]">
                      <span className={`text-2xl font-bold ${isFriend ? 'text-sky-600' : 'text-blue-600'}`}>
                        {user.points}
                      </span>
                      <span className="text-xs text-gray-500 whitespace-nowrap">points</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="px-[18px] pb-[120px]">
            <div className="mb-4">
              <p className="text-sm text-gray-600">Events your friends have attended and rated</p>
            </div>

            {sortedEvents.map((ratedEvent) => {
              const event = mockEvents.find(e => e.id === ratedEvent.eventId);
              if (!event) return null;

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
        )}

        <BottomNavigation
          currentPage="leaderboard"
          onNavigate={onNavigate}
          onOpenMessages={onOpenMessages || (() => {})}
          unreadMessageCount={unreadMessageCount}
        />
      </div>

      {/* Points Info Modal */}
      {showPointsModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-6">
          <div 
            className={`bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl transform transition-all duration-300 ${
              isClosing 
                ? 'translate-y-full opacity-0' 
                : 'translate-y-0 opacity-100'
            }`}
            style={{
              animation: isClosing ? 'slideDown 0.3s ease-out' : 'slideUp 0.3s ease-out'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">How Points Work</h3>
              <button
                onClick={handleCloseModal}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-gray-700">Write a review</span>
                <span className="text-lg font-bold text-blue-600">+5 pts</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-gray-700">Rate an event</span>
                <span className="text-lg font-bold text-blue-600">+3 pts</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-gray-700">Mark "Going" to event</span>
                <span className="text-lg font-bold text-blue-600">+2 pts</span>
              </div>
            </div>

            <button
              onClick={handleCloseModal}
              className="w-full mt-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes slideDown {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(100%);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}