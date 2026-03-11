import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { CommunityPage } from '../screens/CommunityPage';
import { CreateEventPage } from '../screens/CreateEventPage';
import { EventPostedPage } from '../screens/EventPostedPage';
import { ExplorePage } from '../screens/ExplorePage';
import { HomePage } from '../screens/HomePage';
import { LoginScreen } from '../screens/LoginScreen';
import { MessagingScreen } from '../screens/MessagingScreen';
import { ProfilePage } from '../screens/ProfilePage';
import { SettingsScreen } from '../screens/SettingsPage';
import { SignUpScreen } from '../screens/SignUpScreen';
import { SplashScreen } from '../screens/SplashScreen';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [postedEventName, setPostedEventName] = useState('');

  const handleNavigate = (page: string, param?: string) => {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('handleNavigate called:', page, param);
    }
    // Be explicit: an empty/whitespace route is a bug and should be surfaced.
    if (typeof page !== 'string' || page.trim().length === 0) {
      throw new Error(`handleNavigate received an invalid page: ${JSON.stringify(page)}`);
    }
    if (page === 'event-posted' && param) setPostedEventName(param);
    setCurrentPage(page);
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
        {!isLoading && isAuthenticated && currentPage === 'event-posted' && (
          <EventPostedPage eventName={postedEventName} onNavigate={handleNavigate} />
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