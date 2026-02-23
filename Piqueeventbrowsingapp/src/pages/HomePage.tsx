import { useState, useRef, useEffect } from 'react';
import { Search, User, Menu, MessageCircle, Plus, Bell, MapPin } from 'lucide-react';
import { mockEvents, mockSocialActivities, categories } from '../data/mockData';
import { mockNotifications } from '../data/mockNotifications';
import { EventCard } from '../components/EventCard';
import { SocialActivityCard } from '../components/SocialActivityCard';
import { BottomNavigation } from '../components/BottomNavigation';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { SearchOverlay } from '../components/SearchOverlay';
import { NotificationsModal } from '../components/NotificationsModal';
import piqueLogo from 'figma:asset/afb55437712c04a5403dab9b9f23ac22f6e37dfc.png';

interface HomePageProps {
  onNavigate: (page: string, eventId?: string, options?: { showPrice?: boolean; searchQuery?: string }) => void;
  onOpenMessages?: () => void;
  unreadMessageCount?: number;
  onSignOut?: () => void;
}

export function HomePage({ onNavigate, onOpenMessages, unreadMessageCount, onSignOut }: HomePageProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['All']);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('Los Angeles, CA');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const carouselRef = useRef<HTMLDivElement>(null);

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Filter out food-only events (keep activities only, including mixed activities like Paint & Sip)
  const activityEvents = mockEvents.filter(event => event.category !== 'Food & Drink');

  // Display all available categories from mockData
  const displayedCategories = categories;

  const filteredEvents = selectedCategories.includes('All')
    ? activityEvents 
    : activityEvents.filter(e => selectedCategories.includes(e.category));

  const handleCategoryClick = (category: string) => {
    if (category === 'All') {
      // If clicking "All", reset to just "All"
      setSelectedCategories(['All']);
    } else {
      // If clicking a specific category
      if (selectedCategories.includes(category)) {
        // If already selected, remove it
        const newCategories = selectedCategories.filter(c => c !== category);
        // If no categories left, default to "All"
        if (newCategories.length === 0) {
          setSelectedCategories(['All']);
        } else {
          setSelectedCategories(newCategories);
        }
      } else {
        // If not selected, add it (and remove "All" if present)
        const newCategories = selectedCategories.filter(c => c !== 'All');
        newCategories.push(category);
        setSelectedCategories(newCategories);
      }
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleNavigateToExplore = (category: string) => {
    onNavigate('explore', undefined, { category, searchQuery: category } as any);
  };

  return (
    <div className={`bg-[rgb(255,255,255)] h-[932px] relative ${isMenuOpen || isSearchOpen ? 'overflow-hidden' : 'overflow-y-auto overflow-x-hidden'}`}>
      {/* Backdrop Overlay */}
      {isMenuOpen && (
        <div 
          className="absolute inset-0 backdrop-blur-[2px] z-50 transition-opacity"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Slide-out Menu Panel */}
      <div 
        className={`absolute top-0 right-0 h-full w-[215px] bg-white shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-5 pt-[59px] h-full flex flex-col overflow-y-auto"> {/* Added notch padding and overflow */}
          {/* Close button */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setIsMenuOpen(false)}
              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
            >
              <span className="text-gray-700 text-xl">×</span>
            </button>
          </div>

          {/* Top Menu Options */}
          <div className="space-y-2">
            <button
              onClick={() => {
                setIsMenuOpen(false);
                onNavigate('settings');
              }}
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <p className="text-sm font-semibold text-gray-800">Settings</p>
            </button>

            <button
              onClick={() => {
                setIsMenuOpen(false);
                onNavigate('terms');
              }}
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <p className="text-sm font-semibold text-gray-800">Terms & Conditions</p>
            </button>

            <button
              onClick={() => {
                setIsMenuOpen(false);
                onNavigate('privacy');
              }}
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <p className="text-sm font-semibold text-gray-800">Privacy Policy</p>
            </button>
          </div>

          {/* Spacer to push bottom buttons down */}
          <div className="flex-1"></div>

          {/* Bottom Menu Options */}
          <div className="space-y-2">
            <button
              onClick={() => {
                setIsMenuOpen(false);
                // Add navigation or action here
              }}
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <p className="text-sm text-gray-800">Have questions? Contact us!</p>
            </button>

            <button
              onClick={() => {
                setIsMenuOpen(false);
                onSignOut && onSignOut();
              }}
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <p className="text-sm font-semibold text-gray-800">Sign Out</p>
            </button>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="px-[18px] pt-[52px]">
        {/* Logo, Messages, and Menu */}
        <div className="flex items-center justify-between mb-5">
          {/* Logo */}
          <img 
            src={piqueLogo} 
            alt="Pique" 
            className="h-[42px] w-auto"
          />
          
          <div className="flex items-center gap-1.5">
            {/* Create Button */}
            <button
              onClick={() => onNavigate('create')}
              className="w-[38px] h-[38px] rounded-[8px] bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
            >
              <Plus className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
            </button>

            {/* Notifications Button */}
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="relative w-[38px] h-[38px] rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
            >
              <Bell className="w-[18px] h-[18px] text-gray-700" />
              {unreadNotificationCount > 0 && (
                <div className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold px-1">
                  {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                </div>
              )}
            </button>

            {/* Messages Button */}
            <button
              onClick={onOpenMessages}
              className="relative w-[38px] h-[38px] rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
            >
              <MessageCircle className="w-[18px] h-[18px] text-gray-700" />
              {unreadMessageCount && unreadMessageCount > 0 && (
                <div className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold px-1">
                  {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                </div>
              )}
            </button>
            
            {/* Menu Button */}
            <button
              className="w-[38px] h-[38px] rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-[18px] h-[18px] text-gray-700" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-gray-300 rounded-[8px] px-4 py-3 mb-5 flex items-center gap-3">
          <Search className="w-4 h-4 text-[#4C4C4C] flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Search for events..."
            className="w-full bg-transparent text-[12px] outline-none placeholder:text-gray-600"
          />
        </div>
      </div>

      {/* Category Filters - Outside padding container for full-width scroll */}
      <div 
        className="category-filters flex gap-2.5 mb-5 overflow-x-auto pb-2 px-[18px]"
        style={{ 
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain'
        }}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          .category-filters::-webkit-scrollbar {
            height: 2px;
          }
          .category-filters::-webkit-scrollbar-track {
            background: transparent;
            border-radius: 10px;
            margin: 0 18px;
          }
          .category-filters::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 10px;
          }
          .category-filters::-webkit-scrollbar-thumb:hover {
            background: #9ca3af;
          }
          .category-filters {
            scrollbar-width: thin;
            scrollbar-color: #d1d5db transparent;
          }
        `}} />
        {displayedCategories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={`flex-shrink-0 px-5 py-2 rounded-full text-[13px] font-medium transition-all whitespace-nowrap ${
              selectedCategories.includes(category)
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Carousel */}
      <div 
        ref={carouselRef}
        className="flex gap-4 px-[18px] overflow-x-auto mb-4 pb-4 scrollbar-hide"
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}} />
        {filteredEvents.map((event) => (
          <div key={event.id} className="w-[200px] flex-shrink-0">
            <EventCard
              event={event}
              onClick={() => onNavigate('event', event.id)}
            />
          </div>
        ))}
      </div>

      {/* Social Activity Feed */}
      <div className="px-[34px] pb-[120px]">
        <h2 className="text-[14px] font-semibold mb-4">Activity Feed</h2>
        {mockSocialActivities.map((activity) => {
          const event = mockEvents.find(e => e.name === activity.eventName);
          return (
            <SocialActivityCard
              key={activity.id}
              activity={activity}
              onClick={() => event && onNavigate('event', event.id)}
              onFriendClick={(friendName) => onNavigate('friendProfile', undefined, { friendName })}
            />
          );
        })}
      </div>

      <BottomNavigation 
        currentPage="home"
        onNavigate={(page) => {
          if (page === 'explore') {
            onNavigate(page, undefined, { searchQuery });
          } else {
            onNavigate(page);
          }
        }}
        onOpenMessages={onOpenMessages || (() => {})}
        unreadMessageCount={unreadMessageCount}
      />

      {/* Search Overlay */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        initialQuery={searchQuery}
        onNavigateToExplore={handleNavigateToExplore}
        location={location}
        onLocationChange={setLocation}
      />

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        unreadCount={unreadNotificationCount}
      />
    </div>
  );
}