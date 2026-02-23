import { BottomNavigation } from '../components/BottomNavigation';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { EventCard } from '../components/EventCard';
import { mockEvents } from '../data/mockData';
import { useState, useMemo } from 'react';
import { FileText, Heart, Calendar, X, Pencil, Camera, Image, Plus } from 'lucide-react';
import { Event } from '../types/Event';

interface ProfilePageProps {
  onNavigate: (page: string, eventId?: string, options?: { showPrice?: boolean; activeTab?: 'posted' | 'liked' | 'booked' }) => void;
  initialTab?: 'posted' | 'liked' | 'booked';
  onOpenMessages?: () => void;
  unreadMessageCount?: number;
}

export function ProfilePage({ onNavigate, initialTab = 'posted', onOpenMessages, unreadMessageCount }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<'posted' | 'liked' | 'booked'>(initialTab);
  const [sortOption, setSortOption] = useState<string>('latest');
  const [likedSortOption, setLikedSortOption] = useState<string>('latest');
  const [bookedSortOption, setBookedSortOption] = useState<string>('latest');
  const [showFollowModal, setShowFollowModal] = useState<'followers' | 'following' | null>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  
  // Profile state
  const [userName, setUserName] = useState('Alex Rivera');
  const [profilePicture, setProfilePicture] = useState('https://images.unsplash.com/photo-1653771926391-d1b5608c90b2?w=400');
  const [bio, setBio] = useState('Event enthusiast | Foodie | Explorer 🌟');
  
  // Editing state
  const [editingName, setEditingName] = useState('');
  const [editingPicture, setEditingPicture] = useState('');
  const [editingBio, setEditingBio] = useState('');
  
  // Generate random follower/following counts (1-100)
  const followerCount = useMemo(() => Math.floor(Math.random() * 100) + 1, []);
  const followingCount = useMemo(() => Math.floor(Math.random() * 100) + 1, []);
  
  // Mock data for followers and following
  const mockFollowers = useMemo(() => {
    const names = ['Sarah Chen', 'Marcus Johnson', 'Emily Davis', 'Jordan Lee', 'Taylor Brown', 'Casey Wilson', 'Morgan Taylor', 'Riley Martinez', 'Quinn Anderson', 'Avery Thomas', 'Jamie Garcia', 'Drew Rodriguez', 'Skyler White', 'Cameron Harris', 'Dakota Moore'];
    const bios = ['Photography lover 📸', 'Adventure seeker 🏔️', 'Music enthusiast 🎵', 'Fitness junkie 💪', 'Coffee addict ☕', 'Travel blogger ✈️', 'Foodie explorer 🍜', 'Art collector 🎨', 'Book worm 📚', 'Nature lover 🌲'];
    
    return Array.from({ length: followerCount }, (_, i) => ({
      id: `follower-${i}`,
      name: names[i % names.length],
      username: `@${names[i % names.length].toLowerCase().replace(' ', '_')}${i > names.length - 1 ? i : ''}`,
      bio: bios[i % bios.length],
      avatar: `https://i.pravatar.cc/150?img=${(i % 70) + 1}`
    }));
  }, [followerCount]);
  
  const mockFollowing = useMemo(() => {
    const names = ['Alex Kim', 'Sam Patel', 'Jordan Cruz', 'Blake Foster', 'River Adams', 'Phoenix Wright', 'Sage Mitchell', 'Kai Roberts', 'Rowan Clark', 'Ember Scott', 'Ocean Lewis', 'Storm Walker', 'Luna Baker', 'Nova Green', 'Ash Cooper'];
    const bios = ['Event planner 🎉', 'Digital nomad 💻', 'Yoga instructor 🧘', 'Chef & baker 👨‍🍳', 'Marathon runner 🏃', 'DJ & producer 🎧', 'Photographer 📷', 'Writer ✍️', 'Gamer 🎮', 'Dancer 💃'];
    
    return Array.from({ length: followingCount }, (_, i) => ({
      id: `following-${i}`,
      name: names[i % names.length],
      username: `@${names[i % names.length].toLowerCase().replace(' ', '_')}${i > names.length - 1 ? i : ''}`,
      bio: bios[i % bios.length],
      avatar: `https://i.pravatar.cc/150?img=${((i + 30) % 70) + 1}`
    }));
  }, [followingCount]);

  // Mock data for user's posted events (subset of mockEvents) with mock dates
  const postedEventsRaw = [
    { ...mockEvents[0], datePosted: new Date('2025-01-25') },
    { ...mockEvents[3], datePosted: new Date('2025-01-20') },
    { ...mockEvents[5], datePosted: new Date('2025-01-27') }
  ];
  
  // Mock data for user's liked events
  const likedEventsRaw = [
    { ...mockEvents[1], dateLiked: new Date('2025-01-26') },
    { ...mockEvents[2], dateLiked: new Date('2025-01-22') },
    { ...mockEvents[4], dateLiked: new Date('2025-01-24') },
    { ...mockEvents[9], dateLiked: new Date('2025-01-28') },
    { ...mockEvents[10], dateLiked: new Date('2025-01-19') },
    { ...mockEvents[13], dateLiked: new Date('2025-01-21') },
    { ...mockEvents[16], dateLiked: new Date('2025-01-23') }
  ];

  // Mock data for user's booked events
  const bookedEventsRaw = [
    { ...mockEvents[6], dateBooked: new Date('2025-01-23') },
    { ...mockEvents[7], dateBooked: new Date('2025-01-21') },
    { ...mockEvents[8], dateBooked: new Date('2025-01-25') },
    { ...mockEvents[11], dateBooked: new Date('2025-01-27') },
    { ...mockEvents[12], dateBooked: new Date('2025-01-20') },
    { ...mockEvents[14], dateBooked: new Date('2025-01-24') },
    { ...mockEvents[15], dateBooked: new Date('2025-01-26') }
  ];

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
  const postedEvents = useMemo(() => sortEvents(postedEventsRaw, sortOption), [sortOption]);
  const likedEvents = useMemo(() => sortEvents(likedEventsRaw, likedSortOption), [likedSortOption]);
  const bookedEvents = useMemo(() => sortEvents(bookedEventsRaw, bookedSortOption), [bookedSortOption]);

  const handleEditClick = () => {
    setEditingName(userName);
    setEditingPicture(profilePicture);
    setEditingBio(bio);
    setShowEditProfile(true);
  };

  const handleSaveProfile = () => {
    setUserName(editingName);
    setProfilePicture(editingPicture);
    setBio(editingBio);
    setShowEditProfile(false);
  };

  const handleCancelEdit = () => {
    setShowEditProfile(false);
    setEditingName('');
    setEditingPicture('');
    setEditingBio('');
  };

  // Simulate photo selection from gallery
  const handleSelectFromGallery = () => {
    // Simulate selecting a photo by using a random profile image
    const randomProfileImages = [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
    ];
    const randomImage = randomProfileImages[Math.floor(Math.random() * randomProfileImages.length)];
    setEditingPicture(randomImage);
  };

  // Simulate taking a photo
  const handleTakePhoto = () => {
    // Simulate taking a photo by using a random profile image
    const randomProfileImages = [
      'https://images.unsplash.com/photo-1653771926391-d1b5608c90b2?w=400',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    ];
    const randomImage = randomProfileImages[Math.floor(Math.random() * randomProfileImages.length)];
    setEditingPicture(randomImage);
  };

  return (
    <div className="bg-white h-[932px] overflow-y-auto overflow-x-hidden">
      {/* Header Background with Create Button */}
      <div className="bg-gray-300 h-[110px] w-full pt-[59px] relative"> {/* Added notch padding */}
        {/* Create Button - Top Right */}
        <button
          onClick={() => onNavigate('create')}
          className="absolute top-[59px] right-[18px] w-[42px] h-[42px] rounded-full bg-gray-200 flex items-center justify-center"
        >
          <Plus className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Profile Info */}
      <div className="px-[26px] pb-[80px] relative">
        <div className="flex items-start gap-4 -mt-12 mb-3">
          {/* Profile Picture */}
          <div className="w-[103px] h-[102px] rounded-full bg-gray-300 border-4 border-white overflow-hidden flex-shrink-0">
            <ImageWithFallback
              src={profilePicture}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Name, Bio, and Stats combined */}
          <div className="flex-1 pt-12">
            <h1 className="text-lg font-bold mb-1">{userName}</h1>
            <p className="text-xs text-gray-600 mb-3">{bio}</p>
            
            {/* Stats inline with Edit Button */}
            <div className="flex items-center gap-6">
              <div
                onClick={() => setShowFollowModal('followers')}
                className="cursor-pointer"
              >
                <span className="text-sm font-semibold">{followerCount}</span>
                <span className="text-xs text-gray-600 ml-1">Followers</span>
              </div>
              <div
                onClick={() => setShowFollowModal('following')}
                className="cursor-pointer"
              >
                <span className="text-sm font-semibold">{followingCount}</span>
                <span className="text-xs text-gray-600 ml-1">Following</span>
              </div>
              
              {/* Edit Profile Button next to Following */}
              <button
                onClick={handleEditClick}
                className="w-7 h-7 rounded-full bg-gray-700 border border-gray-500 flex items-center justify-center hover:bg-gray-600 transition-colors shadow-md"
                aria-label="Edit profile"
              >
                <Pencil className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>
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
              <h2 className="text-lg font-semibold">Liked/Saved Events</h2>
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
                    hideBookmark={true}
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

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[400px] rounded-2xl overflow-hidden flex flex-col shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-bold">Edit Profile</h2>
              <button
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Name Section */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={50}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Profile Picture Section */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Profile Picture
                </label>
                
                {/* Preview */}
                <div className="flex justify-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200">
                    <ImageWithFallback
                      src={editingPicture || profilePicture}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                {/* Photo Selection Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleSelectFromGallery}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                  >
                    <Image className="w-5 h-5" />
                    <span>Choose Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleTakePhoto}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Take Photo</span>
                  </button>
                </div>
              </div>

              {/* Bio Section */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Bio
                </label>
                <textarea
                  value={editingBio}
                  onChange={(e) => setEditingBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  maxLength={150}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
                <p className="text-xs text-gray-500 text-right">
                  {editingBio.length}/150 characters
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleCancelEdit}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}