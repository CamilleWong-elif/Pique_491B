import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { CommunityPage } from '../screens/CommunityPage';
import ContactUsPage from '../screens/ContactUsPage';
import { CreateEventPage } from '../screens/CreateEventPage';
import { EventPostedPage } from '../screens/EventPostedPage';
import { ExplorePage } from '../screens/ExplorePage';
import { FriendProfileScreen } from '../screens/FriendProfilePage';
import { HomePage } from '../screens/HomePage';
import { LoginScreen } from '../screens/LoginScreen';
import { MessagingScreen } from '../screens/MessagingScreen';
import { ProfilePage } from '../screens/ProfilePage';
import { PrivacyPolicyScreen } from '../screens/PrivacyPolicyPage';
import { SettingsScreen } from '../screens/SettingsPage';
import { SignUpScreen } from '../screens/SignUpScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { TermsConditionsScreen } from '../screens/TermsConditionsPage';
import { EventCard } from '@/components/EventCard';
import { NavigationBar } from '@/components/NavigationBar';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [postedEventName, setPostedEventName] = useState('');
  const [selectedFriendName, setSelectedFriendName] = useState('');

  const handleNavigate = (page: string, param?: string, options?: any) => {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('handleNavigate called:', page, param, options);
    }
    // Be explicit: an empty/whitespace route is a bug and should be surfaced.
    if (typeof page !== 'string' || page.trim().length === 0) {
      throw new Error(`handleNavigate received an invalid page: ${JSON.stringify(page)}`);
    }
    if (page === 'event-posted' && param) setPostedEventName(param);
    if (page === 'friendProfile') {
      const friendName = options?.friendName || param || '';
      setSelectedFriendName(friendName);
    }
    setCurrentPage(page);
  };

  const getAvatarWithFallback = (name: string) => {
    const seed = encodeURIComponent(name || 'friend');
    return `https://api.dicebear.com/7.x/initials/png?seed=${seed}`;
  };

  const BottomNavigationAdapter = ({
    currentPage,
    onNavigate,
    onOpenMessages,
    unreadMessageCount,
  }: {
    currentPage: string;
    onNavigate: (page: string, eventId?: string, options?: any) => void;
    onOpenMessages: () => void;
    unreadMessageCount?: number;
  }) => {
    const page = currentPage === 'home' || currentPage === 'explore' || currentPage === 'leaderboard' || currentPage === 'profile'
      ? currentPage
      : 'profile';

    return (
      <NavigationBar
        currentPage={page}
        onNavigate={(nextPage) => onNavigate(nextPage)}
        onOpenMessages={onOpenMessages}
        unreadMessageCount={unreadMessageCount}
      />
    );
  };

  return (
    <SafeAreaProvider>
      <ErrorBoundary onReset={() => setCurrentPage('home')}>
        <View style={styles.container}>
        {/* Show splash screen on launch */}
        {isLoading && (
          <SplashScreen onComplete={() => setIsLoading(false)} />
        )}

        {/* Show login if not authenticated and not signing up */}
        {!isLoading && !isAuthenticated && !showSignUp && (
          <LoginScreen
            onLogin={() => setIsAuthenticated(true)}
            onNavigateToSignUp={() => setShowSignUp(true)}
          />
        )}

        {/* Show sign up if user tapped "Sign Up" on login */}
        {!isLoading && !isAuthenticated && showSignUp && (
          <SignUpScreen
            onSignUp={() => setIsAuthenticated(true)}
            onNavigateToLogin={() => setShowSignUp(false)}
          />
        )}

        {/* Show main app once authenticated */}
        {!isLoading && isAuthenticated && currentPage === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onSignOut={() => { setIsAuthenticated(false); setShowSignUp(false); }}
            onOpenMessages={() => handleNavigate('messages')}
          />
        )}
        {/* Explore page upon action */}
        {!isLoading && isAuthenticated && currentPage === 'explore' && (
          <ExplorePage onNavigate={handleNavigate} />
        )}
        {!isLoading && isAuthenticated && currentPage === 'leaderboard' && (
          <CommunityPage onNavigate={handleNavigate} />
        )}
        {!isLoading && isAuthenticated && currentPage === 'profile' && (
          <ProfilePage onNavigate={handleNavigate} />
        )}
        {!isLoading && isAuthenticated && currentPage === 'create' && (
          <CreateEventPage onNavigate={handleNavigate} />
        )}
        {!isLoading && isAuthenticated && currentPage === 'messages' && (
          <MessagingScreen onBack={() => handleNavigate('home')} />
        )}
        {!isLoading && isAuthenticated && currentPage === 'settings' && (
          <SettingsScreen onNavigate={handleNavigate} />
        )}
        {!isLoading && isAuthenticated && currentPage === 'contact' && (
          <ContactUsPage onNavigate={handleNavigate} />
        )}
        {!isLoading && isAuthenticated && currentPage === 'terms' && (
          <TermsConditionsScreen onNavigate={handleNavigate} />
        )}
        {!isLoading && isAuthenticated && currentPage === 'privacy' && (
          <PrivacyPolicyScreen onNavigate={handleNavigate} />
        )}
        {!isLoading && isAuthenticated && currentPage === 'event-posted' && (
          <EventPostedPage eventName={postedEventName} onNavigate={handleNavigate} />
        )}
        {!isLoading && isAuthenticated && currentPage === 'friendProfile' && selectedFriendName.length > 0 && (
          <FriendProfileScreen
            friendName={selectedFriendName}
            onNavigate={handleNavigate}
            onBack={() => handleNavigate('home')}
            onOpenMessages={() => handleNavigate('messages')}
            unreadMessageCount={0}
            mockEvents={[]}
            getAvatarWithFallback={getAvatarWithFallback}
            BottomNavigation={BottomNavigationAdapter}
            EventCard={EventCard}
          />
        )}
        </View>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});