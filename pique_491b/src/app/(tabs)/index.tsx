import { useAuth } from '@/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
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
import { ChangePasswordScreen } from '../screens/ChangePasswordPage';
import { DeleteAccountScreen } from '../screens/DeleteAccountPage';
import { SettingsScreen } from '../screens/SettingsPage';
import { SignUpScreen } from '../screens/SignUpScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { TermsConditionsScreen } from '../screens/TermsConditionsPage';
import { EventCard } from '@/components/EventCard';
import { NavigationBar } from '@/components/NavigationBar';
import { EventDetailScreen } from '../screens/EventDetailPage';
import { LeaveReviewScreen } from '../screens/LeaveReviewPage';
import { SurveyScreen } from '../screens/SurveyScreen';

const NAV_STATE_KEY = '@pique_nav_state';

/** Intro splash only once per JS runtime so remounts (OAuth, activity restore) do not replay it. */
let introSplashCompleted = false;

export default function App() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(() => !introSplashCompleted);
  const [showSignUp, setShowSignUp] = useState(false);
  const [navHydrated, setNavHydrated] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [postedEventName, setPostedEventName] = useState('');
  const [selectedFriendName, setSelectedFriendName] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [messageRecipientId, setMessageRecipientId] = useState<string | undefined>(undefined);
  const [exploreInitialCategory, setExploreInitialCategory] = useState<string | undefined>(undefined);
  const [exploreInitialSearchQuery, setExploreInitialSearchQuery] = useState<string | undefined>(undefined);
  const [communityInitialTab, setCommunityInitialTab] = useState<'leaderboard' | 'reviews' | 'find' | undefined>(undefined);
  const [authSessionKey, setAuthSessionKey] = useState(0);
  const prevUidRef = useRef<string | null | undefined>(undefined);

  const isAuthenticated = !!user;

  const completeIntroSplash = useCallback(() => {
    introSplashCompleted = true;
    setIsLoading(false);
  }, []);

  const resetToHomeForLogin = useCallback(() => {
    setShowSignUp(false);
    setCurrentPage('home');
    setSelectedEventId('');
    setSelectedFriendName('');
    setPostedEventName('');
    setExploreInitialCategory(undefined);
    setExploreInitialSearchQuery(undefined);
    setCommunityInitialTab(undefined);
    setAuthSessionKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(NAV_STATE_KEY);
        if (raw && !cancelled) {
          const s = JSON.parse(raw) as Record<string, unknown>;
          if (typeof s.currentPage === 'string' && s.currentPage.trim().length > 0) {
            setCurrentPage(s.currentPage);
          }
          if (typeof s.selectedEventId === 'string') setSelectedEventId(s.selectedEventId);
          if (typeof s.selectedFriendName === 'string') setSelectedFriendName(s.selectedFriendName);
          if (typeof s.postedEventName === 'string') setPostedEventName(s.postedEventName);
        }
      } catch {
        /* ignore corrupt storage */
      } finally {
        if (!cancelled) setNavHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const uid = user?.uid ?? null;
    const previousUid = prevUidRef.current;
    const isInitialSavedLogin = previousUid === undefined && uid !== null;
    const isFreshLogin = previousUid === null && uid !== null;
    const isLoginTransition = isInitialSavedLogin || isFreshLogin;

    if (isLoginTransition) {
      resetToHomeForLogin();
    }

    if (prevUidRef.current === undefined) {
      prevUidRef.current = uid;
      return;
    }
    if (prevUidRef.current !== null && uid === null) {
      setShowSignUp(false);
      setCurrentPage('home');
      setSelectedEventId('');
      setSelectedFriendName('');
      setPostedEventName('');
      setExploreInitialCategory(undefined);
      setExploreInitialSearchQuery(undefined);
      setCommunityInitialTab(undefined);
      void AsyncStorage.removeItem(NAV_STATE_KEY);
    }
    prevUidRef.current = uid;
  }, [user, resetToHomeForLogin]);

  useEffect(() => {
    if (!navHydrated || !user) return;
    void AsyncStorage.setItem(
      NAV_STATE_KEY,
      JSON.stringify({
        currentPage,
        selectedEventId,
        selectedFriendName,
        postedEventName,
      })
    );
  }, [navHydrated, user, currentPage, selectedEventId, selectedFriendName, postedEventName]);

  const handleNavigate = (page: string, param?: string, options?: any) => {
    // Be explicit: an empty/whitespace route is a bug and should be surfaced.
    if (typeof page !== 'string' || page.trim().length === 0) {
      throw new Error(`handleNavigate received an invalid page: ${JSON.stringify(page)}`);
    }
    if (page === 'event-posted' && param) setPostedEventName(param);
    if ((page === 'event' || page === 'review') && param) setSelectedEventId(param);
    if (page === 'friendProfile') {
      const friendName = options?.friendName || param || '';
      setSelectedFriendName(friendName);
    }
    if (page === 'explore') {
      setExploreInitialCategory(options?.category);
      setExploreInitialSearchQuery(options?.searchQuery);
    }
    if (page === 'leaderboard') {
      setCommunityInitialTab(options?.tab);
    }
    setCurrentPage(page);
  };

  const handleSignOut = async () => {
    setShowSignUp(false);
    try {
      await signOut();
    } catch (e) {
      console.error('Sign out failed:', e);
    }
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

  const gateReady = !isLoading && navHydrated;
  /** After intro, wait for saved route + Firebase before showing login or main UI. */
  const showBootstrapLoader = !isLoading && (!navHydrated || authLoading);
  const showLoginStack = gateReady && !authLoading && !isAuthenticated && !showSignUp;
  const showSignUpStack = gateReady && !authLoading && !isAuthenticated && showSignUp;
  const showApp = gateReady && !authLoading && isAuthenticated;
  const needsSurvey = showApp && profile?.surveyCompleted !== true;

  return (
    <SafeAreaProvider>
      <ErrorBoundary onReset={() => setCurrentPage('home')}>
        <View style={styles.container}>
        {isLoading && <SplashScreen onComplete={completeIntroSplash} />}

        {showBootstrapLoader && (
          <View style={styles.authLoading}>
            <ActivityIndicator size="large" color="#298cf4" />
          </View>
        )}

        {showLoginStack && (
          <LoginScreen
            onLogin={() => {}}
            onNavigateToSignUp={() => setShowSignUp(true)}
          />
        )}

        {showSignUpStack && (
          <SignUpScreen
            onSignUp={() => {}}
            onNavigateToLogin={() => setShowSignUp(false)}
          />
        )}

        {needsSurvey && (
          <SurveyScreen onComplete={() => {}} />
        )}

        {showApp && !needsSurvey && (
          <View
            style={[StyleSheet.absoluteFill, { zIndex: currentPage === 'home' ? 1 : 0, opacity: currentPage === 'home' ? 1 : 0 }]}
            pointerEvents={currentPage === 'home' ? 'auto' : 'none'}
          >
            <HomePage
              key={`home-${user?.uid ?? 'anon'}-${authSessionKey}`}
              onNavigate={handleNavigate}
              onSignOut={handleSignOut}
              onOpenMessages={() => handleNavigate('messages')}
            />
          </View>
        )}
        {showApp && !needsSurvey && (
          <View
            style={[StyleSheet.absoluteFill, { zIndex: currentPage === 'explore' ? 1 : 0, opacity: currentPage === 'explore' ? 1 : 0 }]}
            pointerEvents={currentPage === 'explore' ? 'auto' : 'none'}
          >
            <ExplorePage
              key={`explore-${user?.uid ?? 'anon'}-${authSessionKey}`}
              onNavigate={handleNavigate}
              initialCategory={exploreInitialCategory}
              initialSearchQuery={exploreInitialSearchQuery}
            />
          </View>
        )}
        {showApp && !needsSurvey && (
          <View
            style={[StyleSheet.absoluteFill, { zIndex: currentPage === 'leaderboard' ? 1 : 0, opacity: currentPage === 'leaderboard' ? 1 : 0 }]}
            pointerEvents={currentPage === 'leaderboard' ? 'auto' : 'none'}
          >
            <CommunityPage
              onNavigate={handleNavigate}
              initialTab={communityInitialTab}
            />
          </View>
        )}
        {showApp && !needsSurvey && (
          <View
            style={[StyleSheet.absoluteFill, { zIndex: currentPage === 'profile' ? 1 : 0, opacity: currentPage === 'profile' ? 1 : 0 }]}
            pointerEvents={currentPage === 'profile' ? 'auto' : 'none'}
          >
            <ProfilePage onNavigate={handleNavigate} />
          </View>
        )}
        {showApp && !needsSurvey && currentPage === 'create' && (
          <CreateEventPage onNavigate={handleNavigate} />
        )}
        {showApp && !needsSurvey && currentPage === 'messages' && (
          <MessagingScreen
            onBack={() => { setMessageRecipientId(undefined); handleNavigate('home'); }}
            openWithUserId={messageRecipientId}
            onNavigate={handleNavigate}
          />
        )}
        {showApp && !needsSurvey && currentPage === 'settings' && (
          <SettingsScreen onNavigate={handleNavigate} />
        )}
        {showApp && !needsSurvey && currentPage === 'changePassword' && (
          <ChangePasswordScreen onNavigate={handleNavigate} />
        )}
        {showApp && !needsSurvey && currentPage === 'deleteAccount' && (
          <DeleteAccountScreen onNavigate={handleNavigate} />
        )}
        {showApp && !needsSurvey && currentPage === 'contact' && (
          <ContactUsPage onNavigate={handleNavigate} />
        )}
        {showApp && !needsSurvey && currentPage === 'terms' && (
          <TermsConditionsScreen onNavigate={handleNavigate} />
        )}
        {showApp && !needsSurvey && currentPage === 'privacy' && (
          <PrivacyPolicyScreen onNavigate={handleNavigate} />
        )}
        {showApp && !needsSurvey && currentPage === 'event' && !!selectedEventId && (
          <EventDetailScreen
            eventId={selectedEventId}
            onBack={() => handleNavigate('home')}
            onNavigate={handleNavigate}
          />
        )}
        {showApp && !needsSurvey && currentPage === 'review' && !!selectedEventId && (
          <LeaveReviewScreen
            event={{ id: selectedEventId, imageUrl: '', businessName: '', location: '' }}
            onBack={() => handleNavigate('event', selectedEventId)}
            onReviewPosted={() => handleNavigate('event', selectedEventId)}
          />
        )}
        {showApp && !needsSurvey && currentPage === 'event-posted' && (
          <EventPostedPage eventName={postedEventName} onNavigate={handleNavigate} />
        )}
        {showApp && !needsSurvey && currentPage === 'friendProfile' && selectedFriendName.length > 0 && (
          <FriendProfileScreen
            friendName={selectedFriendName}
            onNavigate={handleNavigate}
            onBack={() => handleNavigate('leaderboard')}
            onOpenMessages={(friendId?: string) => { setMessageRecipientId(friendId); handleNavigate('messages'); }}
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
  authLoading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
});