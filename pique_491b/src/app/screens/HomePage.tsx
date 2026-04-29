import { EventCard } from '@/components/EventCard';
import { NavigationBar } from '@/components/NavigationBar';
import { Notification as NotificationItem, NotificationsModal } from '@/components/NotificationsModal';
import { SocialActivity, SocialActivityCard } from '@/components/SocialActivityCard';
import { SearchOverlay } from '@/components/SearchOverlay';
import { useAuth } from '@/context/AuthContext';
import { apiDeleteReview, apiDismissFeedActivity, apiGetFriendReviews, apiGetNotifications, apiGetRecommendations, apiGetReviewComments, apiMarkAllNotificationsRead, apiMarkNotificationRead, apiPostActivityComment, apiPostReviewComment, apiToggleActivityLike, apiToggleLike, apiToggleReviewLike } from '@/api';
import { resolveAvatarUrl } from '@/utils/avatar';
import { Bell, Menu, MessageCircle, Plus, Search, SlidersHorizontal, X } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, FlatList, Image, Modal, Platform, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';


import { ALL_CATEGORIES } from '@/constants/categories';

const logo = require('@/assets/images/temp_logo.png');

function formatRelativeTime(value: string): string {
  const ts = new Date(value).getTime();
  if (!Number.isFinite(ts)) return 'Just now';
  const diffMs = Date.now() - ts;
  if (diffMs < 60_000) return 'Just now';
  const diffMinutes = Math.floor(diffMs / 60_000);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 5) return `${diffWeeks}w ago`;
  return new Date(ts).toLocaleDateString();
}

interface HomePageProps {
  onNavigate: (page: string, eventId?: string, options?: any) => void;
  onOpenMessages?: () => void;
  unreadMessageCount?: number;
  onSignOut?: () => void;
}

export function HomePage({ onNavigate, onOpenMessages, unreadMessageCount, onSignOut }: HomePageProps) {
  const { user, profile } = useAuth();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedSearchQuery, setSubmittedSearchQuery] = useState('');
  const [location, setLocation] = useState('Los Angeles, CA');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [likedEventIds, setLikedEventIds] = useState<Set<string>>(new Set());
  const [feedActivities, setFeedActivities] = useState<SocialActivity[]>([]);
  const [isFeedLoading, setIsFeedLoading] = useState(true);
  const [recommendedEvents, setRecommendedEvents] = useState<any[]>([]);
  const [isRecsLoading, setIsRecsLoading] = useState(true);
  const [isRefreshingHome, setIsRefreshingHome] = useState(false);
  const skeletonPulse = useRef(new Animated.Value(0.45)).current;
  const insets = useSafeAreaInsets();

  // Filter state
  const [pendingCategories, setPendingCategories] = useState<string[]>([]);
  const [quickDate, setQuickDate] = useState<'today' | 'week' | 'month' | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [sortOrder, setSortOrder] = useState<'soonest' | 'latest'>('soonest');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Applied filter state
  const [appliedCategories, setAppliedCategories] = useState<string[]>([]);
  const [appliedQuickDate, setAppliedQuickDate] = useState<'today' | 'week' | 'month' | null>(null);
  const [appliedStartDate, setAppliedStartDate] = useState<Date | null>(null);
  const [appliedEndDate, setAppliedEndDate] = useState<Date | null>(null);
  const [appliedSortOrder, setAppliedSortOrder] = useState<'soonest' | 'latest'>('soonest');

  const isFiltered = appliedCategories.length > 0 || appliedQuickDate !== null || appliedStartDate !== null || appliedEndDate !== null;
  const isHomeLoading = isFeedLoading;

  useEffect(() => {
    if (!isHomeLoading) return;
    skeletonPulse.setValue(0.45);
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(skeletonPulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(skeletonPulse, {
          toValue: 0.45,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
      { iterations: -1 },
    );
    animation.start();
    return () => {
      animation.stop();
      skeletonPulse.setValue(0.45);
    };
  }, [isHomeLoading, skeletonPulse]);

  // Sync liked events from profile
  useEffect(() => {
    const liked: string[] = (profile as any)?.likedEvents ?? [];
    setLikedEventIds(new Set(liked));
  }, [(profile as any)?.likedEvents]);

  const handleBookmarkPress = async (eventId?: string) => {
    if (!eventId || !user?.uid) return;
    const wasLiked = likedEventIds.has(eventId);
    try {
      // Optimistic update
      if (wasLiked) {
        setLikedEventIds(prev => { const next = new Set(prev); next.delete(eventId); return next; });
      } else {
        setLikedEventIds(prev => new Set(prev).add(eventId));
      }
      await apiToggleLike(eventId);
    } catch (err) {
      // Revert on failure
      if (wasLiked) {
        setLikedEventIds(prev => new Set(prev).add(eventId));
      } else {
        setLikedEventIds(prev => { const next = new Set(prev); next.delete(eventId); return next; });
      }
      console.error('Bookmark error:', err);
    }
  };

  const formattoMMDD = (startValue: any, endValue?: any): string | undefined => {
    const toDate = (value: any): Date | undefined => {
      if (!value) return undefined;
      if (typeof value?.toDate === 'function') return value.toDate();
      if (value instanceof Date) return value;
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? undefined : d;
    };

    const start = toDate(startValue);
    if (!start) return undefined;
    const mm = start.getMonth() + 1;  // 1–12
    const dd = start.getDate();       // 1–31
    const startStr = `${mm}/${dd}`;
    const end = toDate(endValue);

    if (!end) return startStr;
    const mm2 = end.getMonth() + 1;
    const dd2 = end.getDate();
    const endStr = `${mm2}/${dd2}`;
    return `${startStr} ~ ${endStr}`;
  };

  const fetchRecs = useCallback(async (showLoading = true) => {
    if (showLoading) setIsRecsLoading(true);
    try {
      const recs = await apiGetRecommendations(10);
      setRecommendedEvents(recs || []);
    } catch (err: any) {
      console.error('HomePage: Error fetching recommendations:', err?.message ?? err);
    } finally {
      if (showLoading) setIsRecsLoading(false);
    }
  }, []);

  const fetchFeedReviews = useCallback(async (showLoading = true) => {
    if (showLoading) setIsFeedLoading(true);
    try {
      const data = await apiGetFriendReviews();
      const activities = await Promise.all((data || []).map(async (r: any) => {
        const sourceType = r.action === 'interested' ? 'bookmark' : 'review';
        let comments: any[] = Array.isArray(r.comments) ? r.comments : [];
        if (sourceType === 'review') {
          try {
            comments = await apiGetReviewComments(r.id);
          } catch {
            comments = Array.isArray(r.comments) ? r.comments : [];
          }
        }
        return {
          id: r.id,
          action: r.action === 'interested' ? 'interested' : 'rated',
          sourceType,
          userName: r.friendName || r.authorUsername || r.username || 'Anonymous',
          userAvatar: resolveAvatarUrl(r),
          authorId: r.author || r.authorId || r.userId || r.uid || r.authorUid || '',
          eventId: r.event || r.eventId || '',
          eventName: r.eventName || '',
          rating: sourceType === 'review' ? r.rating : undefined,
          reviewText: sourceType === 'review' ? (r.comment || '') : '',
          reviewImages: sourceType === 'review' ? (r.images || []) : [],
          timestamp: r.createdAt,
          isLiked: (r.likedBy || []).includes(user?.uid ?? ''),
          likes: r.likes || 0,
          comments,
        };
      })) as SocialActivity[];
      setFeedActivities(activities);
    } catch (error: any) {
      console.error('HomePage: Error fetching activity feed reviews:', error?.message ?? error);
      setFeedActivities([]);
    } finally {
      if (showLoading) setIsFeedLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    void fetchRecs(true);
  }, [fetchRecs]);

  useEffect(() => {
    void fetchFeedReviews(true);
  }, [fetchFeedReviews]);

  const handleRefreshHome = useCallback(async () => {
    setIsRefreshingHome(true);
    try {
      await Promise.all([
        fetchRecs(false),
        fetchFeedReviews(false),
      ]);
    } finally {
      setIsRefreshingHome(false);
    }
  }, [fetchFeedReviews, fetchRecs]);

  const fetchNotifications = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const rows = await apiGetNotifications(60);
      setNotifications(
        (Array.isArray(rows) ? rows : []).map((row: any) => ({
          id: String(row?.id ?? `${row?.type || 'notification'}_${Math.random().toString(36).slice(2, 8)}`),
          type: row?.type ?? 'friend_activity',
          userId: row?.userId ?? undefined,
          userName: row?.userName ?? undefined,
          userAvatar: row?.userAvatar ?? undefined,
          message: row?.message ?? 'sent you a notification',
          eventName: row?.eventName ?? undefined,
          timestamp: formatRelativeTime(String(row?.timestamp ?? '')),
          read: Boolean(row?.read),
        }))
      );
    } catch (error: any) {
      console.error('HomePage: Error fetching notifications:', error?.message ?? error);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      return;
    }
    void fetchNotifications();
    const intervalId = setInterval(() => {
      void fetchNotifications();
    }, 60_000);
    return () => clearInterval(intervalId);
  }, [fetchNotifications, user?.uid]);

  useEffect(() => {
    if (!isNotificationsOpen) return;
    void fetchNotifications();
  }, [fetchNotifications, isNotificationsOpen]);

  const handleFeedReviewLike = async (activityId: string) => {
    const current = feedActivities.find((a) => a.id === activityId);
    if (!current) return;
    const nextLiked = !current.isLiked;

    setFeedActivities((prev) =>
      prev.map((a) =>
        a.id === activityId
          ? {
            ...a,
            isLiked: nextLiked,
            likes: Math.max(0, (a.likes || 0) + (nextLiked ? 1 : -1)),
          }
          : a
      )
    );

    try {
      if (current.sourceType === 'bookmark') {
        await apiToggleActivityLike(activityId);
      } else {
        await apiToggleReviewLike(activityId);
      }
    } catch (error: any) {
      setFeedActivities((prev) =>
        prev.map((a) =>
          a.id === activityId
            ? {
              ...a,
              isLiked: !nextLiked,
              likes: Math.max(0, (a.likes || 0) + (nextLiked ? -1 : 1)),
            }
            : a
        )
      );
      console.error('HomePage: Failed to toggle review like:', error?.message ?? error);
    }
  };

  const handleFeedReviewComment = async (activityId: string, text: string) => {
    const current = feedActivities.find((a) => a.id === activityId);
    if (!current) return;
    try {
      const posted = current.sourceType === 'bookmark'
        ? await apiPostActivityComment(activityId, text)
        : await apiPostReviewComment(activityId, text);
      setFeedActivities((prev) =>
        prev.map((a) =>
          a.id === activityId
            ? { ...a, comments: [...(a.comments || []), posted] }
            : a
        )
      );
    } catch (error: any) {
      console.error('HomePage: Failed to post review comment:', error?.message ?? error);
    }
  };

  const handleFeedDelete = async (activityId: string) => {
    const activity = feedActivities.find((a) => a.id === activityId);
    if (!activity) return;
    try {
      if (activity.sourceType === 'bookmark') {
        await apiDismissFeedActivity(activityId);
      } else {
        await apiDeleteReview(activityId);
      }
      setFeedActivities((prev) => prev.filter((a) => a.id !== activityId));
    } catch (error: any) {
      console.error('HomePage: Failed to delete activity:', error?.message ?? error);
    }
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  const getEventDate = (e: any): Date => {
    const val = e.date ?? e.startDate;
    if (!val) return new Date(0);
    if (typeof val?.toDate === 'function') return val.toDate();
    if (val instanceof Date) return val;
    return new Date(val);
  };

  const applyFilters = (evts: any[]) => {
    let result = [...evts];
    if (appliedCategories.length > 0) {
      result = result.filter((e: any) => appliedCategories.includes(e.category));
    }
    const now = new Date();
    if (appliedQuickDate === 'today') {
      result = result.filter((e: any) => {
        const d = getEventDate(e);
        return d.toDateString() === now.toDateString();
      });
    } else if (appliedQuickDate === 'week') {
      const weekEnd = new Date(now); weekEnd.setDate(now.getDate() + 7);
      result = result.filter((e: any) => { const d = getEventDate(e); return d >= now && d <= weekEnd; });
    } else if (appliedQuickDate === 'month') {
      const monthEnd = new Date(now); monthEnd.setMonth(now.getMonth() + 1);
      result = result.filter((e: any) => { const d = getEventDate(e); return d >= now && d <= monthEnd; });
    }
    if (appliedStartDate) result = result.filter((e: any) => getEventDate(e) >= appliedStartDate!);
    if (appliedEndDate) result = result.filter((e: any) => getEventDate(e) <= appliedEndDate!);
    result.sort((a, b) => {
      const da = getEventDate(a).getTime();
      const db = getEventDate(b).getTime();
      return appliedSortOrder === 'soonest' ? da - db : db - da;
    });
    return result;
  };

  const filteredRecommendedEvents = applyFilters(recommendedEvents);

  const openFilter = () => {
    setPendingCategories(appliedCategories);
    setQuickDate(appliedQuickDate);
    setStartDate(appliedStartDate);
    setEndDate(appliedEndDate);
    setSortOrder(appliedSortOrder);
    setIsFilterOpen(true);
  };

  const handleApplyFilter = () => {
    setAppliedCategories(pendingCategories);
    setAppliedQuickDate(quickDate);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setAppliedSortOrder(sortOrder);
    setIsFilterOpen(false);
  };

  const handleClearFilter = () => {
    setPendingCategories([]);
    setQuickDate(null);
    setStartDate(null);
    setEndDate(null);
    setSortOrder('soonest');
  };

  const togglePendingCategory = (cat: string) => {
    setPendingCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const formatDate = (d: Date | null) => d ? `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}` : null;

  return (
    <View style={styles.container}>
      {/* Header for Android UI */ }
      <View style={{ paddingTop: insets.top }}></View>

      {/* Slide-out Menu Modal */}
      <Modal visible={isMenuOpen} transparent animationType="none">
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setIsMenuOpen(false)}
        />
        <View style={styles.menuPanel}>
          <View style={[styles.menuContent, { paddingTop: insets.top + 12 }]}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsMenuOpen(false)}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>

            {/* Top Menu Items */}
            <View style={styles.menuItems}>
              {[
                { label: 'Settings', page: 'settings' },
                { label: 'Terms & Conditions', page: 'terms' },
                { label: 'Privacy Policy', page: 'privacy' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.page}
                  style={styles.menuItem}
                  onPress={() => { setIsMenuOpen(false); onNavigate(item.page); }}
                >
                  <Text style={styles.menuItemText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Spacer */}
            <View style={{ flex: 1 }} />

            {/* Bottom Menu Items */}
            <View style={styles.menuItems}>
              <TouchableOpacity style={styles.menuItem} onPress={() => { setIsMenuOpen(false); onNavigate('contact'); }}>
                <Text style={styles.menuItemTextSmall}>Have questions? Contact us!</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => { setIsMenuOpen(false); onSignOut && onSignOut(); }}
              >
                <Text style={styles.menuItemText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshingHome}
            onRefresh={() => { void handleRefreshHome(); }}
            tintColor="#3b82f6"
            colors={['#3b82f6']}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          {/* Logo + Action Buttons */}
          <View style={styles.headerRow}>
            <Image source={logo} style={styles.logo} resizeMode="contain" />

            <View style={styles.headerActions}>
              {/* Create Button */}
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => onNavigate('create')}
              >
                <Plus size={18} color="#ffffff" strokeWidth={2.5} />
              </TouchableOpacity>

              {/* Notifications Button */}
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setIsNotificationsOpen(true)}
              >
                <Bell size={18} color="#374151" />
                {unreadNotificationCount > 0 && (
                  <View style={styles.badgeDot} />
                )}
              </TouchableOpacity>

              {/* Messages Button */}
              <TouchableOpacity style={styles.iconButton} onPress={onOpenMessages}>
                <MessageCircle size={18} color="#374151" />
                {Number(unreadMessageCount ?? 0) > 0 ? (
                  <View style={styles.badgeDot} />
                ) : null}
              </TouchableOpacity>

              {/* Menu Button */}
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setIsMenuOpen(true)}
              >
                <Menu size={18} color="#374151" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search + Filter Card */}
          <View style={styles.searchCard}>
            <Search size={14} color="#9ca3af" />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => {
                const committed = searchQuery.trim();
                if (!committed) return;
                setSubmittedSearchQuery(committed);
                onNavigate('explore', undefined, { searchQuery: committed });
              }}
              returnKeyType="search"
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search events, places..."
              placeholderTextColor="#9ca3af"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => { setSearchQuery(''); setSubmittedSearchQuery(''); }}>
                <X size={14} color="#9ca3af" />
              </TouchableOpacity>
            )}
            <View style={styles.searchDivider} />
            <TouchableOpacity style={styles.filterInlineButton} onPress={openFilter}>
              <SlidersHorizontal size={16} color={isFiltered ? '#3b82f6' : '#374151'} />
              {isFiltered && <View style={styles.filterActiveDot} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Recommended For You */}
        {!isRecsLoading && isFiltered && filteredRecommendedEvents.length === 0 && (
          <Text style={styles.emptyFeedText}>No recommended events match the selected filters.</Text>
        )}
        {!isRecsLoading && filteredRecommendedEvents.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recommended For You</Text>
            <FlatList
              horizontal
              data={filteredRecommendedEvents}
              keyExtractor={(event: any) => `rec-${event.id}`}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContent}
              style={styles.carousel}
              initialNumToRender={4}
              maxToRenderPerBatch={4}
              windowSize={5}
              removeClippedSubviews
              renderItem={({ item: event }: { item: any }) => {
                const dateVal = event.date ?? event.startDate;
                const startDateStr = formattoMMDD(dateVal);
                return (
                  <View style={styles.carouselItem}>
                    <EventCard
                      event={{
                        id: event.id,
                        name: event.name ?? '',
                        imageUrl:
                          event.imageUrl ??
                          event.image ??
                          (Array.isArray(event.imageUrls) ? event.imageUrls[0] : undefined) ??
                          (Array.isArray(event.photos) ? event.photos[0] : undefined),
                        startDate: startDateStr ?? event.startDate,
                        endDate: event.endDate,
                        category: event.category ?? (Array.isArray(event.categories) ? event.categories[0] : undefined),
                        city: event.city ?? event.location,
                        pricePoint: event.pricePoint,
                        rating: event.rating,
                        distance: event.distance,
                      }}
                      onPress={() => onNavigate('event', event.id)}
                      isBookmarked={likedEventIds.has(event.id)}
                      onBookmarkPress={handleBookmarkPress}
                    />
                  </View>
                );
              }}
            />
          </>
        )}

        {/* Activity Feed */}
        <View style={styles.feedContainer}>
          <Text style={styles.feedTitle}>Activity Feed</Text>
          {isFeedLoading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <Animated.View key={`home-feed-skeleton-${idx}`} style={[styles.feedSkeletonCard, { opacity: skeletonPulse }]}>
                <View style={styles.feedSkeletonHeader}>
                  <View style={[styles.skeletonBlock, styles.feedSkeletonAvatar]} />
                  <View style={[styles.skeletonBlock, styles.feedSkeletonHeaderLine]} />
                </View>
                <View style={styles.feedSkeletonActionsRow}>
                  <View style={styles.feedSkeletonLeftActions}>
                    <View style={[styles.skeletonBlock, styles.feedSkeletonIcon]} />
                    <View style={[styles.skeletonBlock, styles.feedSkeletonIcon]} />
                  </View>
                  <View style={[styles.skeletonBlock, styles.feedSkeletonDelete]} />
                </View>
                <View style={styles.feedSkeletonFooterRow}>
                  <View style={[styles.skeletonBlock, styles.feedSkeletonMetaLine]} />
                  <View style={[styles.skeletonBlock, styles.feedSkeletonDate]} />
                </View>
              </Animated.View>
            ))
          ) : (
            feedActivities.map((activity) => ({ ...activity, isSaved: likedEventIds.has(activity.eventId || '') })).map((activity) => (
              <SocialActivityCard
                key={activity.id}
                activity={activity}
                onClick={() => onNavigate('event', activity.eventId || activity.eventName)}
                onFriendClick={(userIdOrUsername: string) =>
                  onNavigate('friendProfile', undefined, { friendName: userIdOrUsername })
                }
                onLike={handleFeedReviewLike}
                onSave={async (_activityId, saved) => {
                  const eventId = activity.eventId;
                  if (!eventId) return;
                  try {
                    await apiToggleLike(eventId);
                    setLikedEventIds(prev => {
                      const next = new Set(prev);
                      if (saved) next.add(eventId); else next.delete(eventId);
                      return next;
                    });
                  } catch (err) {
                    console.error('Feed bookmark error:', err);
                  }
                }}
                onPostComment={handleFeedReviewComment}
                onDelete={handleFeedDelete}
              />
            ))
          )}
          {!isFeedLoading && feedActivities.length === 0 && (
            <Text style={styles.emptyFeedText}>No review activity yet. Follow friends or leave a review on an event.</Text>
          )}
        </View>

      </ScrollView>

      {/* Bottom Navigation */}
      <NavigationBar
        currentPage="home"
        onNavigate={(page) => {
          if (page === 'explore') {
            onNavigate(page, undefined, { searchQuery: submittedSearchQuery });
          } else {
            onNavigate(page);
          }
        }}
        onOpenMessages={onOpenMessages || (() => {})}
        unreadMessageCount={unreadMessageCount}
      />

      {/* Stub overlays — will be replaced when converted */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        initialQuery={searchQuery}
        onNavigateToExplore={(term: string) => {
          const committed = term.trim();
          setSearchQuery(committed);
          setSubmittedSearchQuery(committed);
          onNavigate('explore', undefined, { searchQuery: committed });
        }}
        onNavigateToFindPeople={() => {
          onNavigate('leaderboard', undefined, { tab: 'find' });
        }}
        location={location}
        onLocationChange={setLocation}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={(id: string) => {
          setNotifications(prev =>
            prev.map((n) => n.id === id ? { ...n, read: true } : n)
          );
          void apiMarkNotificationRead(id).catch((error: any) => {
            console.error('HomePage: Error marking notification as read:', error?.message ?? error);
          });
        }}
        onMarkAllAsRead={() => {
          setNotifications(prev => prev.map((n) => ({ ...n, read: true })));
          void apiMarkAllNotificationsRead().catch((error: any) => {
            console.error('HomePage: Error marking all notifications as read:', error?.message ?? error);
          });
        }}
        unreadCount={unreadNotificationCount}
        onPressUser={(notification) => {
          if (!notification.userId) return;
          setIsNotificationsOpen(false);
          onNavigate('friendProfile', undefined, { friendName: notification.userId });
          setNotifications(prev =>
            prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
          );
          void apiMarkNotificationRead(notification.id).catch((error: any) => {
            console.error('HomePage: Error marking notification as read:', error?.message ?? error);
          });
        }}
      />

      {/* Filter & Sort Modal */}
      <Modal visible={isFilterOpen} transparent animationType="slide">
        <View style={styles.filterModalOverlay}>
          <TouchableOpacity style={styles.filterModalBackdrop} onPress={() => setIsFilterOpen(false)} />
          <View style={styles.filterModalSheet}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={styles.filterModalHeader}>
                <Text style={styles.filterModalTitle}>Filter & Sort</Text>
                <TouchableOpacity onPress={() => setIsFilterOpen(false)}>
                  <X size={22} color="#374151" />
                </TouchableOpacity>
              </View>

              {/* Category */}
              <Text style={styles.filterSectionLabel}>CATEGORY</Text>
              <View style={styles.filterChipsWrap}>
                {ALL_CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.filterChip, pendingCategories.includes(cat) && styles.filterChipActive]}
                    onPress={() => togglePendingCategory(cat)}
                  >
                    <Text style={[styles.filterChipText, pendingCategories.includes(cat) && styles.filterChipTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Quick Date */}
              <Text style={styles.filterSectionLabel}>QUICK DATE</Text>
              <View style={styles.filterChipsRow}>
                {(['today', 'week', 'month'] as const).map(q => (
                  <TouchableOpacity
                    key={q}
                    style={[styles.filterChip, quickDate === q && styles.filterChipActive]}
                    onPress={() => setQuickDate(quickDate === q ? null : q)}
                  >
                    <Text style={[styles.filterChipText, quickDate === q && styles.filterChipTextActive]}>
                      {q === 'today' ? 'Today' : q === 'week' ? 'This Week' : 'This Month'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Date Range */}
              <Text style={styles.filterSectionLabel}>DATE RANGE</Text>
              <View style={styles.dateRangeRow}>
                <TouchableOpacity style={styles.dateInput} onPress={() => setShowStartPicker(true)}>
                  <Text style={styles.dateInputText}>{formatDate(startDate) ?? 'Start date'}</Text>
                </TouchableOpacity>
                <Text style={styles.dateArrow}>→</Text>
                <TouchableOpacity style={styles.dateInput} onPress={() => setShowEndPicker(true)}>
                  <Text style={styles.dateInputText}>{formatDate(endDate) ?? 'End date'}</Text>
                </TouchableOpacity>
              </View>
              {showStartPicker && (
                <DateTimePicker
                  value={startDate ?? new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(_, d) => { setShowStartPicker(false); if (d) setStartDate(d); }}
                />
              )}
              {showEndPicker && (
                <DateTimePicker
                  value={endDate ?? new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(_, d) => { setShowEndPicker(false); if (d) setEndDate(d); }}
                />
              )}

              {/* Sort By */}
              <Text style={styles.filterSectionLabel}>SORT BY</Text>
              <View style={styles.filterChipsRow}>
                <TouchableOpacity
                  style={[styles.filterChip, sortOrder === 'soonest' && styles.filterChipActive]}
                  onPress={() => setSortOrder('soonest')}
                >
                  <Text style={[styles.filterChipText, sortOrder === 'soonest' && styles.filterChipTextActive]}>Soonest First</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterChip, sortOrder === 'latest' && styles.filterChipActive]}
                  onPress={() => setSortOrder('latest')}
                >
                  <Text style={[styles.filterChipText, sortOrder === 'latest' && styles.filterChipTextActive]}>Latest First</Text>
                </TouchableOpacity>
              </View>

              {/* Actions */}
              <View style={styles.filterActions}>
                <TouchableOpacity style={styles.clearButton} onPress={handleClearFilter}>
                  <Text style={styles.clearButtonText}>Clear All</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilter}>
                  <Text style={styles.applyButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  // Menu
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  menuPanel: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 215,
    height: '100%',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  menuContent: {
    flex: 1,
    padding: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#374151',
    lineHeight: 22,
  },
  menuItems: {
    gap: 4,
  },
  menuItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  menuItemTextSmall: {
    fontSize: 14,
    color: '#1f2937',
  },
  // Header
  header: {
    paddingHorizontal: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  logo: {
    height: 50,
    width: 120,
    borderRadius: 8,
    marginTop: 5
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  createButton: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#ef4444',
    borderRadius: 5,
    width: 10,
    height: 10,
    borderWidth: 1.5,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Search
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 20,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
    paddingVertical: 0,
  },
  searchDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#e5e7eb',
  },
  filterInlineButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  filterActiveDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  // Carousel
  carousel: {
    marginBottom: 16,
    overflow: 'visible',
  },
  carouselContent: {
    paddingHorizontal: 18,
    paddingBottom: 6,
    gap: 12,
  },
  carouselItem: {
    width: 200,
  },
  skeletonBlock: {
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
  },
  // Feed
  feedContainer: {
    paddingHorizontal: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    paddingHorizontal: 18,
    marginTop: 8,
    marginBottom: 6,
  },
  feedTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
    color: '#111827',
  },
  feedSkeletonCard: {
    borderRadius: 14,
    backgroundColor: '#ffffff',
    padding: 12,
    marginBottom: 12,
  },
  feedSkeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  feedSkeletonAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  feedSkeletonHeaderLine: {
    height: 14,
    width: '62%',
    borderRadius: 7,
  },
  feedSkeletonActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  feedSkeletonLeftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  feedSkeletonIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  feedSkeletonDelete: {
    width: 14,
    height: 18,
    borderRadius: 4,
  },
  feedSkeletonFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  feedSkeletonMetaLine: {
    height: 10,
    width: 118,
  },
  feedSkeletonDate: {
    height: 10,
    width: 42,
  },
  emptyFeedText: {
    color: '#6b7280',
    fontSize: 13,
    marginBottom: 12,
  },
  // Filter Modal
  filterModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  filterModalBackdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  filterModalSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '85%',
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  filterSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b7280',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 16,
  },
  filterChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9999,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterChipActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  dateRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f9fafb',
  },
  dateInputText: {
    fontSize: 13,
    color: '#6b7280',
  },
  dateArrow: {
    fontSize: 16,
    color: '#9ca3af',
  },
  filterActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 8,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default HomePage;