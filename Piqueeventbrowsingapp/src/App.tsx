import { useState, useMemo } from 'react';
import { SplashScreen } from './pages/SplashScreen';
import { LoginScreen } from './pages/LoginScreen';
import { SignUpScreen } from './pages/SignUpScreen';
import { HomePage } from './pages/HomePage';
import { EventDetailPage } from './pages/EventDetailPage';
import { ExplorePage } from './pages/ExplorePage';
import { ProfilePage } from './pages/ProfilePage';
import { FriendProfilePage } from './pages/FriendProfilePage';
import { CreateEventPage } from './pages/CreateEventPage';
import { PaymentPage } from './pages/PaymentPage';
import { PaymentSuccessPage } from './pages/PaymentSuccessPage';
import { CommunityPage } from './pages/CommunityPage';
import { LeaveReviewPage } from './pages/LeaveReviewPage';
import { SettingsPage } from './pages/SettingsPage';
import { TermsConditionsPage } from './pages/TermsConditionsPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { ReviewPostedPopup } from './components/ReviewPostedPopup';
import { EventCreatedPopup } from './components/EventCreatedPopup';
import { MessagingModal } from './components/MessagingModal';
import { mockEvents, mockConversations } from './data/mockData';

export default function App() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showSignUp, setShowSignUp] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [showPrice, setShowPrice] = useState<boolean>(true);
  const [previousPage, setPreviousPage] = useState<string>('home');
  const [profileTab, setProfileTab] = useState<'posted' | 'liked' | 'booked' | undefined>(undefined);
  const [isMessagingOpen, setIsMessagingOpen] = useState<boolean>(false);
  const [paymentDetails, setPaymentDetails] = useState<{ quantity: number; total: number } | null>(null);
  const [exploreCategory, setExploreCategory] = useState<string | undefined>(undefined);
  const [exploreSearchQuery, setExploreSearchQuery] = useState<string | undefined>(undefined);
  const [friendName, setFriendName] = useState<string>('');
  const [pageHistory, setPageHistory] = useState<string[]>([]);
  const [showReviewPostedPopup, setShowReviewPostedPopup] = useState<boolean>(false);
  const [showEventCreatedPopup, setShowEventCreatedPopup] = useState<boolean>(false);
  const [cameFromMessages, setCameFromMessages] = useState<boolean>(false);

  // Calculate total unread messages
  const unreadMessageCount = useMemo(() => {
    return mockConversations.reduce((total, conv) => total + conv.unreadCount, 0);
  }, []);

  const handleNavigate = (page: string, eventId?: string, options?: { showPrice?: boolean; activeTab?: 'posted' | 'liked' | 'booked'; category?: string; searchQuery?: string; friendName?: string; fromMessages?: boolean }) => {
    // Handle friend profile navigation
    if (page === 'friendProfile' && options?.friendName) {
      setFriendName(options.friendName);
      // Track if we're coming from messages
      if (options?.fromMessages) {
        setCameFromMessages(true);
        setPageHistory([...pageHistory, 'messages']);
      } else {
        setCameFromMessages(false);
        setPageHistory([...pageHistory, currentPage]);
      }
      setCurrentPage(page);
      if (eventId) {
        setSelectedEventId(eventId);
      }
      return;
    }
    
    // Handle explore page with category
    if (page === 'explore' && options?.category) {
      setExploreCategory(options.category);
    }
    
    // Handle explore page with search query
    if (page === 'explore' && options?.searchQuery) {
      setExploreSearchQuery(options.searchQuery);
    }
    
    // Track page history for pages that need back navigation
    // Push current page to history when navigating to event, payment, or review
    if (page === 'event' || page === 'payment' || page === 'review') {
      setPageHistory([...pageHistory, currentPage]);
      // Store the active tab if coming from profile page
      if (options?.activeTab) {
        setProfileTab(options.activeTab);
      }
    }
    
    // Clear history when navigating to main pages (home, explore, profile, create, leaderboard)
    if (['home', 'explore', 'profile', 'create', 'leaderboard'].includes(page)) {
      setPageHistory([]);
      setProfileTab(undefined);
    }
    
    setCurrentPage(page);
    if (eventId) {
      setSelectedEventId(eventId);
    }
    // Set showPrice based on options, defaulting to true
    setShowPrice(options?.showPrice ?? true);
  };

  const handleBackNavigation = () => {
    if (pageHistory.length > 0) {
      const lastPage = pageHistory[pageHistory.length - 1];
      setPageHistory(pageHistory.slice(0, -1));
      
      // If we came from messages, open the messages modal and return to home
      if (lastPage === 'messages') {
        setCurrentPage('home');
        setIsMessagingOpen(true);
        setCameFromMessages(false);
      } else {
        setCurrentPage(lastPage);
      }
    } else {
      setCurrentPage('home');
    }
  };

  const handlePaymentComplete = (quantity: number, total: number) => {
    // Store payment details and navigate to success page
    setPaymentDetails({ quantity, total });
    setCurrentPage('paymentSuccess');
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setCurrentPage('home');
  };

  const selectedEvent = selectedEventId 
    ? mockEvents.find(e => e.id === selectedEventId) 
    : null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900">
      {/* iPhone 16 Pro Max Container - 430x932px */}
      <div 
        className="relative bg-white overflow-hidden shadow-2xl"
        style={{
          width: '430px',
          height: '932px',
          maxWidth: '100vw',
          maxHeight: '100vh',
          margin: '0 auto'
        }}
      >
        {isLoading && (
          <SplashScreen onComplete={() => setIsLoading(false)} />
        )}

        {!isLoading && !isAuthenticated && !showSignUp && (
          <LoginScreen 
            onLogin={() => setIsAuthenticated(true)}
            onNavigateToSignUp={() => setShowSignUp(true)}
          />
        )}

        {!isLoading && !isAuthenticated && showSignUp && (
          <SignUpScreen 
            onSignUp={() => setIsAuthenticated(true)}
            onNavigateToLogin={() => setShowSignUp(false)}
          />
        )}

        {!isLoading && isAuthenticated && currentPage === 'home' && (
          <HomePage 
            onNavigate={handleNavigate}
            onOpenMessages={() => setIsMessagingOpen(true)}
            unreadMessageCount={unreadMessageCount}
            onSignOut={handleSignOut}
          />
        )}
        
        {!isLoading && isAuthenticated && currentPage === 'event' && selectedEvent && (
          <EventDetailPage 
            event={selectedEvent}
            onBack={handleBackNavigation}
            showPrice={showPrice}
            onNavigate={handleNavigate}
            activeTab={profileTab}
          />
        )}
        
        {!isLoading && isAuthenticated && currentPage === 'explore' && (
          <ExplorePage 
            onNavigate={handleNavigate}
            onOpenMessages={() => setIsMessagingOpen(true)}
            unreadMessageCount={unreadMessageCount}
            initialCategory={exploreCategory}
            initialSearchQuery={exploreSearchQuery}
          />
        )}
        
        {!isLoading && isAuthenticated && currentPage === 'profile' && (
          <ProfilePage 
            onNavigate={handleNavigate}
            initialTab={profileTab || 'posted'}
            onOpenMessages={() => setIsMessagingOpen(true)}
            unreadMessageCount={unreadMessageCount}
          />
        )}
        
        {!isLoading && isAuthenticated && currentPage === 'create' && (
          <CreateEventPage 
            onNavigate={handleNavigate}
            onOpenMessages={() => setIsMessagingOpen(true)}
            unreadMessageCount={unreadMessageCount}
            onEventCreated={() => setShowEventCreatedPopup(true)}
          />
        )}

        {!isLoading && isAuthenticated && currentPage === 'payment' && selectedEvent && (
          <PaymentPage 
            event={selectedEvent}
            onBack={handleBackNavigation}
            onPaymentComplete={handlePaymentComplete}
          />
        )}

        {!isLoading && isAuthenticated && currentPage === 'paymentSuccess' && selectedEvent && paymentDetails && (
          <PaymentSuccessPage 
            event={selectedEvent}
            quantity={paymentDetails.quantity}
            total={paymentDetails.total}
            onComplete={() => {
              setProfileTab('booked');
              setCurrentPage('profile');
            }}
            onReturnHome={() => {
              setCurrentPage('home');
            }}
          />
        )}

        {!isLoading && isAuthenticated && currentPage === 'leaderboard' && (
          <CommunityPage 
            onNavigate={handleNavigate}
            onOpenMessages={() => setIsMessagingOpen(true)}
            unreadMessageCount={unreadMessageCount}
          />
        )}

        {!isLoading && isAuthenticated && currentPage === 'friendProfile' && (
          <FriendProfilePage 
            friendName={friendName}
            onNavigate={handleNavigate}
            onBack={handleBackNavigation}
            onOpenMessages={() => setIsMessagingOpen(true)}
            unreadMessageCount={unreadMessageCount}
          />
        )}

        {!isLoading && isAuthenticated && currentPage === 'review' && selectedEvent && (
          <LeaveReviewPage 
            event={selectedEvent}
            onBack={handleBackNavigation}
            onReviewPosted={() => setShowReviewPostedPopup(true)}
          />
        )}

        {!isLoading && isAuthenticated && currentPage === 'settings' && (
          <SettingsPage onNavigate={handleNavigate} />
        )}

        {!isLoading && isAuthenticated && currentPage === 'terms' && (
          <TermsConditionsPage onNavigate={handleNavigate} />
        )}

        {!isLoading && isAuthenticated && currentPage === 'privacy' && (
          <PrivacyPolicyPage onNavigate={handleNavigate} />
        )}

        {/* Review Posted Popup */}
        <ReviewPostedPopup 
          isOpen={showReviewPostedPopup}
          onClose={() => setShowReviewPostedPopup(false)}
          onNavigate={handleNavigate}
        />

        {/* Event Created Popup */}
        <EventCreatedPopup 
          isOpen={showEventCreatedPopup}
          onClose={() => setShowEventCreatedPopup(false)}
          onNavigate={handleNavigate}
        />

        {/* Messaging Modal */}
        <MessagingModal 
          isOpen={isMessagingOpen}
          onClose={() => setIsMessagingOpen(false)}
          onBack={() => setIsMessagingOpen(false)}
          onNavigate={handleNavigate}
          unreadMessageCount={unreadMessageCount}
        />
      </div>
    </div>
  );
}