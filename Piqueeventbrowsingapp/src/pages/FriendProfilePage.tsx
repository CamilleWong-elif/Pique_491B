import { BottomNavigation } from '../components/BottomNavigation';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { EventCard } from '../components/EventCard';
import { mockEvents, mockFriends } from '../data/mockData';
import { getAvatarWithFallback } from '../data/avatarMapping';
import { useState, useMemo } from 'react';
import { FileText, Heart, Calendar, X, ArrowLeft } from 'lucide-react';
import { Event } from '../types/Event';

interface FriendProfilePageProps {
  friendName: string;
  onNavigate: (page: string, eventId?: string, options?: { showPrice?: boolean; activeTab?: 'posted' | 'liked' | 'booked'; friendName?: string }) => void;
  onBack: () => void;
  onOpenMessages?: () => void;
  unreadMessageCount?: number;
}

export function FriendProfilePage({ friendName, onNavigate, onBack, onOpenMessages, unreadMessageCount }: FriendProfilePageProps) {
  const [activeTab, setActiveTab] = useState<'posted' | 'liked' | 'booked'>('posted');
  const [sortOption, setSortOption] = useState<string>('latest');
  const [likedSortOption, setLikedSortOption] = useState<string>('latest');
  const [bookedSortOption, setBookedSortOption] = useState<string>('latest');
  const [showFollowModal, setShowFollowModal] = useState<'followers' | 'following' | null>(null);
  const [isFollowing, setIsFollowing] = useState<boolean>(Math.random() > 0.5);
  
  // Get friend data from centralized avatar mapping
  const friendData = useMemo(() => {
    const bios = [
      'Event enthusiast | Foodie | Explorer 🌟',
      'Adventure seeker 🏔️ | Coffee lover ☕',
      'Music lover 🎵 | Travel addict ✈️',
      'Fitness junkie 💪 | Nature lover 🌲',
      'Art enthusiast 🎨 | Photographer 📸',
      'Bookworm 📚 | Movie buff 🎬',
      'Foodie explorer 🍜 | Chef wannabe 👨‍🍳',
      'Party animal 🎉 | Social butterfly 🦋',
      'Yoga instructor 🧘 | Wellness advocate 💚',
      'Gamer 🎮 | Tech geek 💻'
    ];
    
    const hash = friendName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    return {
      name: friendName,
      bio: bios[hash % bios.length],
      avatar: getAvatarWithFallback(friendName),
      followerCount: Math.floor(Math.random() * 100) + 1,
      followingCount: Math.floor(Math.random() * 100) + 1
    };
  }, [friendName]);
  
  // Mock data for followers and following
  const mockFollowers = useMemo(() => {
    const names = ['Sarah Chen', 'Marcus Johnson', 'Emily Davis', 'Jordan Lee', 'Taylor Brown', 'Casey Wilson', 'Morgan Taylor', 'Riley Martinez', 'Quinn Anderson', 'Avery Thomas', 'Jamie Garcia', 'Drew Rodriguez', 'Skyler White', 'Cameron Harris', 'Dakota Moore'];
    const bios = ['Photography lover 📸', 'Adventure seeker 🏔️', 'Music enthusiast 🎵', 'Fitness junkie 💪', 'Coffee addict ☕', 'Travel blogger ✈️', 'Foodie explorer 🍜', 'Art collector 🎨', 'Book worm 📚', 'Nature lover 🌲'];
    
    return Array.from({ length: friendData.followerCount }, (_, i) => ({
      id: `follower-${i}`,
      name: names[i % names.length],
      username: `@${names[i % names.length].toLowerCase().replace(' ', '_')}${i > names.length - 1 ? i : ''}`,
      bio: bios[i % bios.length],
      avatar: `https://i.pravatar.cc/150?img=${(i % 70) + 1}`
    }));
  }, [friendData.followerCount]);
  
  const mockFollowing = useMemo(() => {
    const names = ['Alex Kim', 'Sam Patel', 'Jordan Cruz', 'Blake Foster', 'River Adams', 'Phoenix Wright', 'Sage Mitchell', 'Kai Roberts', 'Rowan Clark', 'Ember Scott', 'Ocean Lewis', 'Storm Walker', 'Luna Baker', 'Nova Green', 'Ash Cooper'];
    const bios = ['Event planner 🎉', 'Digital nomad 💻', 'Yoga instructor 🧘', 'Chef & baker 👨‍🍳', 'Marathon runner 🏃', 'DJ & producer 🎧', 'Photographer 📷', 'Writer ✍️', 'Gamer 🎮', 'Dancer 💃'];
    
    return Array.from({ length: friendData.followingCount }, (_, i) => ({
      id: `following-${i}`,
      name: names[i % names.length],
      username: `@${names[i % names.length].toLowerCase().replace(' ', '_')}${i > names.length - 1 ? i : ''}`,
      bio: bios[i % bios.length],
      avatar: `https://i.pravatar.cc/150?img=${((i + 30) % 70) + 1}`
    }));
  }, [friendData.followingCount]);

  // Mock data for friend's posted events (subset of mockEvents) with mock dates
  const postedEventsRaw = useMemo(() => [
    { ...mockEvents[1], datePosted: new Date('2025-01-25') },
    { ...mockEvents[4], datePosted: new Date('2025-01-20') },
    { ...mockEvents[2], datePosted: new Date('2025-01-27') }
  ], []);
  
  // Mock data for friend's liked events
  const likedEventsRaw = useMemo(() => [
    { ...mockEvents[0], dateLiked: new Date('2025-01-26') },
    { ...mockEvents[3], dateLiked: new Date('2025-01-22') },
    { ...mockEvents[5], dateLiked: new Date('2025-01-24') }
  ], []);

  // Mock data for friend's booked events
  const bookedEventsRaw = useMemo(() => [
    { ...mockEvents[2], dateBooked: new Date('2025-01-23') },
    { ...mockEvents[1], dateBooked: new Date('2025-01-21') },
    { ...mockEvents[4], dateBooked: new Date('2025-01-25') }
  ], []);

  // Sorting function
  const sortEvents = (events: any[], sortBy: string) => {
    const sorted = [...events];
    
    switch (sortBy) {
      case 'latest':
        return sorted.sort((a, b) => {
          const dateA = a.datePosted || a.dateLiked || a.dateBooked;
          const dateB = b.datePosted || b.dateLiked || b.dateBooked;
          return dateB.getTime() - dateA.getTime();
        });
      case 'oldest':
        return sorted.sort((a, b) => {
          const dateA = a.datePosted || a.dateLiked || a.dateBooked;
          const dateB = b.datePosted || b.dateLiked || b.dateBooked;
          return dateA.getTime() - dateB.getTime();
        });
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      default:
        return sorted;
    }
  };

  // Apply sorting using useMemo for optimization
  const postedEvents = useMemo(() => sortEvents(postedEventsRaw, sortOption), [postedEventsRaw, sortOption]);
  const likedEvents = useMemo(() => sortEvents(likedEventsRaw, likedSortOption), [likedEventsRaw, likedSortOption]);
  const bookedEvents = useMemo(() => sortEvents(bookedEventsRaw, bookedSortOption), [bookedEventsRaw, bookedSortOption]);

  return (
    <div className="bg-white h-[932px] overflow-y-auto overflow-x-hidden relative">
      {/* Header Background */}
      <div className="bg-gray-300 h-[110px] w-full pt-[59px]"> {/* Added notch padding */}</div>

      {/* Back Button */}
      <button
        onClick={onBack}
        className="absolute top-[59px] left-4 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100"> {/* Adjusted top position for notch */}
        <ArrowLeft className="w-5 h-5 text-gray-700" />
      </button>

      {/* Profile Info */}
      <div className="px-[26px] pb-[80px] relative">
        <div className="flex items-start gap-4 -mt-12 mb-3">
          {/* Profile Picture */}
          <div className="w-[103px] h-[102px] rounded-full bg-gray-300 border-4 border-white overflow-hidden flex-shrink-0">
            <img
              src={friendData.avatar}
              alt={friendData.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Name, Bio, and Stats combined */}
          <div className="flex-1 pt-12">
            <h1 className="text-lg font-bold mb-1">{friendData.name}</h1>
            <p className="text-xs text-gray-600 mb-3">{friendData.bio}</p>
            
            {/* Stats inline */}
            <div className="flex items-center gap-6">
              <div
                onClick={() => setShowFollowModal('followers')}
                className="cursor-pointer"
              >
                <span className="text-sm font-semibold">{friendData.followerCount}</span>
                <span className="text-xs text-gray-600 ml-1">Followers</span>
              </div>
              <div
                onClick={() => setShowFollowModal('following')}
                className="cursor-pointer"
              >
                <span className="text-sm font-semibold">{friendData.followingCount}</span>
                <span className="text-xs text-gray-600 ml-1">Following</span>
              </div>
            </div>
          </div>
        </div>

        {/* Follow/Message Buttons */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => setIsFollowing(!isFollowing)}
            className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
              isFollowing
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-sky-500 text-white hover:bg-sky-600'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
          <button
            onClick={onOpenMessages}
            className="flex-1 py-2 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            Message
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center items-center gap-10 mb-4 border-t-2 border-black pt-4">
          <button 
            onClick={() => setActiveTab('posted')}
            className={`w-[42px] h-[42px] rounded transition-colors flex items-center justify-center ${
              activeTab === 'posted' ? 'bg-blue-500' : 'bg-gray-300'
            }`}
            aria-label="Posted events"
          >
            <FileText className="w-5 h-5 text-white" />
          </button>
          <button 
            onClick={() => setActiveTab('liked')}
            className={`w-[42px] h-[42px] rounded transition-colors flex items-center justify-center ${
              activeTab === 'liked' ? 'bg-blue-500' : 'bg-gray-300'
            }`}
            aria-label="Liked events"
          >
            <Heart className="w-5 h-5 text-white" />
          </button>
          <button 
            onClick={() => setActiveTab('booked')}
            className={`w-[42px] h-[42px] rounded transition-colors flex items-center justify-center ${
              activeTab === 'booked' ? 'bg-blue-500' : 'bg-gray-300'
            }`}
            aria-label="Booked events"
          >
            <Calendar className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content Area - Changes based on active tab */}
        {activeTab === 'posted' && (
          <div>
            {/* Header with title and filter */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Events Posted</h2>
              <select 
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded-md text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="latest">Latest Date</option>
                <option value="oldest">Oldest First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="rating">Highest Rating</option>
              </select>
            </div>
            
            {/* 2 Column Grid with proper spacing */}
            <div className="grid grid-cols-2 gap-4">
              {postedEvents.map((event) => (
                <div key={event.id} className="flex justify-center">
                  <EventCard
                    event={event}
                    onClick={() => onNavigate('event', event.id, { showPrice: false, activeTab: 'posted' })}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'liked' && (
          <div>
            {/* Header with title and filter */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Liked Events</h2>
              <select 
                value={likedSortOption}
                onChange={(e) => setLikedSortOption(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded-md text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="latest">Latest Date</option>
                <option value="oldest">Oldest First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="rating">Highest Rating</option>
              </select>
            </div>
            
            {/* 2 Column Grid with proper spacing */}
            <div className="grid grid-cols-2 gap-4">
              {likedEvents.map((event) => (
                <div key={event.id} className="flex justify-center">
                  <EventCard
                    event={event}
                    onClick={() => onNavigate('event', event.id, { showPrice: false, activeTab: 'liked' })}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'booked' && (
          <div>
            {/* Header with title and filter */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Booked Events</h2>
              <select 
                value={bookedSortOption}
                onChange={(e) => setBookedSortOption(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded-md text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="latest">Latest Date</option>
                <option value="oldest">Oldest First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="rating">Highest Rating</option>
              </select>
            </div>
            
            {/* 2 Column Grid with proper spacing */}
            <div className="grid grid-cols-2 gap-4">
              {bookedEvents.map((event) => (
                <div key={event.id} className="flex justify-center">
                  <EventCard
                    event={event}
                    onClick={() => onNavigate('event', event.id, { showPrice: true, activeTab: 'booked' })}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNavigation 
        currentPage="profile"
        onNavigate={onNavigate}
        onOpenMessages={onOpenMessages || (() => {})}
        unreadMessageCount={unreadMessageCount}
      />

      {/* Followers/Following Modal */}
      {showFollowModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white w-[380px] max-h-[600px] rounded-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold">
                {showFollowModal === 'followers' ? 'Followers' : 'Following'}
              </h2>
              <button
                onClick={() => setShowFollowModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {(showFollowModal === 'followers' ? mockFollowers : mockFollowing).map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Avatar */}
                  <div 
                    className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 cursor-pointer"
                    onClick={() => {
                      setShowFollowModal(null);
                      onNavigate('friendProfile', undefined, { friendName: user.name });
                    }}
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* User Info */}
                  <div 
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => {
                      setShowFollowModal(null);
                      onNavigate('friendProfile', undefined, { friendName: user.name });
                    }}
                  >
                    <h3 className="text-sm font-semibold text-gray-900 truncate hover:underline">
                      {user.name}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">{user.username}</p>
                    <p className="text-xs text-gray-600 truncate">{user.bio}</p>
                  </div>

                  {/* Follow/Following Button */}
                  <button
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0 ${
                      showFollowModal === 'followers'
                        ? 'bg-sky-500 text-white hover:bg-sky-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {showFollowModal === 'followers' ? 'Follow' : 'Following'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}