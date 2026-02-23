import { Home, MapPin, Plus, Users, User } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface BottomNavigationProps {
  currentPage: 'home' | 'explore' | 'profile' | 'create' | 'leaderboard';
  onNavigate: (page: 'home' | 'explore' | 'profile' | 'create' | 'leaderboard') => void;
  onOpenMessages: () => void;
  unreadMessageCount?: number;
}

// Custom Community Icon Component
function CommunityIcon({ className, isActive }: { className?: string; isActive: boolean }) {
  const color = isActive ? 'currentColor' : 'currentColor';
  
  return (
    <svg 
      width="30" 
      height="30" 
      viewBox="0 0 30 30" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Left person (smaller) */}
      <circle cx="7" cy="8" r="3.5" stroke={color} strokeWidth="2" fill="none"/>
      <path d="M1 22C1 17.5 3.5 15 7 15C8.5 15 9.5 15.5 10.5 16.5" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
      
      {/* Center person (larger) */}
      <circle cx="15" cy="7" r="4.5" stroke={color} strokeWidth="2" fill="none"/>
      <path d="M7 26C7 20.5 10 17 15 17C20 17 23 20.5 23 26" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
      
      {/* Right person (smaller) */}
      <circle cx="23" cy="8" r="3.5" stroke={color} strokeWidth="2" fill="none"/>
      <path d="M29 22C29 17.5 26.5 15 23 15C21.5 15 20.5 15.5 19.5 16.5" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

export function BottomNavigation({ currentPage, onNavigate, onOpenMessages, unreadMessageCount = 0 }: BottomNavigationProps) {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 flex items-center justify-center z-50 pb-4 w-[414px]">
      <div className="bg-white h-[70px] flex items-center justify-center rounded-[24px] shadow-[0_-4px_12px_rgba(0,0,0,0.08)] w-full mx-[18px]">
        <div className="flex items-center justify-between w-full px-[32px]">
          {/* Home */}
          <button
            onClick={() => onNavigate('home')}
            className="flex flex-col items-center justify-center gap-0.5 transition-all"
          >
            <Home className={`w-[30px] h-[30px] ${currentPage === 'home' ? 'text-black' : 'text-gray-400'}`} />
            <span className={`text-[9px] ${currentPage === 'home' ? 'text-black' : 'text-gray-400'}`}>Home</span>
          </button>
          
          {/* Map */}
          <button
            onClick={() => onNavigate('explore')}
            className="flex flex-col items-center justify-center gap-0.5 transition-all"
          >
            <MapPin className={`w-[30px] h-[30px] ${currentPage === 'explore' ? 'text-black' : 'text-gray-400'}`} />
            <span className={`text-[9px] ${currentPage === 'explore' ? 'text-black' : 'text-gray-400'}`}>Explore</span>
          </button>
          
          {/* Community */}
          <button
            onClick={() => onNavigate('leaderboard')}
            className="flex flex-col items-center justify-center gap-0.5 transition-all"
          >
            <CommunityIcon className={`w-[30px] h-[30px] ${currentPage === 'leaderboard' ? 'text-black' : 'text-gray-400'}`} isActive={currentPage === 'leaderboard'} />
            <span className={`text-[9px] ${currentPage === 'leaderboard' ? 'text-black' : 'text-gray-400'}`}>Community</span>
          </button>
          
          {/* Profile */}
          <button
            onClick={() => onNavigate('profile')}
            className="flex flex-col items-center justify-center gap-0.5 transition-all"
          >
            <div className="w-[30px] h-[30px] rounded-full overflow-hidden">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1653771926391-d1b5608c90b2?w=400"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <span className={`text-[9px] ${currentPage === 'profile' ? 'text-black' : 'text-gray-400'}`}>My Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}