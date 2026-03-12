import { EventCard } from '@/components/EventCard';
import { NavigationBar } from '@/components/NavigationBar';
import { NotificationsModal } from '@/components/NotificationsModal';
import { SocialActivityCard } from '@/components/Placeholder';
import { SearchOverlay } from '@/components/SearchOverlay';
import { auth, db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Bell, Menu, MessageCircle, Plus, Search } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const mockSocialActivities: any[] = [];
const categories = ['All', 'Music', 'Sports', 'Arts', 'Food & Drink', 'Tech', 'Outdoors'];
const mockNotifications: any[] = [];

const logo = require('@/assets/images/temp_logo.png');

interface HomePageProps {
  onNavigate: (page: string, eventId?: string, options?: any) => void;
  onOpenMessages?: () => void;
  unreadMessageCount?: number;
  onSignOut?: () => void;
}

export function HomePage({ onNavigate, onOpenMessages, unreadMessageCount, onSignOut }: HomePageProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['All']);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('Los Angeles, CA');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [events, setEvents] = useState<any[]>([]);
  const insets = useSafeAreaInsets();

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

  useEffect(() => {
    if (!auth.currentUser) return;
    const fetchEvents = async () => {
      try {
        const eventDocs = await getDocs(collection(db, 'events'));
        console.log('HomePage: Fetched events count:', eventDocs.docs.length);
        const eventsList = eventDocs.docs.map(doc => {
          const d = doc.data();
          return {
            id: doc.id,
            ...d,
            lat: d.lat ?? d.latitude,
            lng: d.lng ?? d.longitude,
            category: d.category ?? (Array.isArray(d.categories) ? d.categories[0] : d.category),
          };
        });
        setEvents(eventsList);
      } catch (error: any) {
        console.error('HomePage: Error fetching events:', error?.code ?? error?.message ?? error);
      }
    };
    fetchEvents();
  }, []);

  const unreadNotificationCount = notifications.filter((n: any) => !n.read).length;

  const activityEvents = events.filter((e: any) => e.category !== 'Food & Drink');
  const filteredEvents = selectedCategories.includes('All')
    ? activityEvents
    : activityEvents.filter((e: any) => selectedCategories.includes(e.category));

  const handleCategoryClick = (category: string) => {
    if (category === 'All') {
      setSelectedCategories(['All']);
    } else {
      if (selectedCategories.includes(category)) {
        const updated = selectedCategories.filter(c => c !== category);
        setSelectedCategories(updated.length === 0 ? ['All'] : updated);
      } else {
        setSelectedCategories([...selectedCategories.filter(c => c !== 'All'), category]);
      }
    }
  };

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
          <View style={styles.menuContent}>
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
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Messages Button */}
              <TouchableOpacity style={styles.iconButton} onPress={onOpenMessages}>
                <MessageCircle size={18} color="#374151" />
                {unreadMessageCount && unreadMessageCount > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                    </Text>
                  </View>
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

          {/* Search Bar */}
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => setIsSearchOpen(true)}
            activeOpacity={1}
          >
            <Search size={16} color="#4C4C4C" />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search for events..."
              placeholderTextColor="#6b7280"
            />
          </TouchableOpacity>
        </View>

        {/* Category Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => handleCategoryClick(category)}
              style={[
                styles.categoryChip,
                selectedCategories.includes(category) && styles.categoryChipActive,
              ]}
            >
              <Text style={[
                styles.categoryText,
                selectedCategories.includes(category) && styles.categoryTextActive,
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Event Carousel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.carousel}
          contentContainerStyle={styles.carouselContent}
        >
          {filteredEvents.map((event: any) => {
            const dateVal = event.date ?? event.startDate;
            const startDateStr = formattoMMDD(dateVal);
            return (
              <View key={event.id} style={styles.carouselItem}>
                <EventCard
                  event={{
                    id: event.id,
                    name: event.name ?? '',
                    imageUrl: event.imageUrl ?? event.image,
                    startDate: startDateStr ?? event.startDate,
                    endDate: event.endDate,
                    category: event.category,
                    city: event.city ?? event.location,
                    pricePoint: event.pricePoint,
                    rating: event.rating,
                    distance: event.distance,
                  }}
                  onPress={() => onNavigate('event', event.id)}
                />
              </View>
            );
          })}
        </ScrollView>

        {/* Activity Feed — stub, will populate when SocialActivityCard is converted */}
        <View style={styles.feedContainer}>
          <Text style={styles.feedTitle}>Activity Feed</Text>
          {mockSocialActivities.map((activity: any) => (
            <SocialActivityCard
              key={activity.id}
              activity={activity}
              onClick={() => onNavigate('event')}
              onFriendClick={(friendName: string) =>
                onNavigate('friendProfile', undefined, { friendName })
              }
            />
          ))}
        </View>

      </ScrollView>

      {/* Bottom Navigation */}
      <NavigationBar
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

      {/* Stub overlays — will be replaced when converted */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        initialQuery={searchQuery}
        onNavigateToExplore={(category: string) =>
          onNavigate('explore', undefined, { category })
        }
        location={location}
        onLocationChange={setLocation}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={(id: string) =>
          setNotifications(prev =>
            prev.map((n: any) => n.id === id ? { ...n, read: true } : n)
          )
        }
        onMarkAllAsRead={() =>
          setNotifications(prev => prev.map((n: any) => ({ ...n, read: true })))
        }
        unreadCount={unreadNotificationCount}
      />

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
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ef4444',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#111827',
  },
  // Categories
  categoriesScroll: {
    marginBottom: 20,
  },
  categoriesContent: {
    paddingHorizontal: 18,
    gap: 10,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: '#eff6ff',
  },
  categoryChipActive: {
    backgroundColor: '#3b82f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#2563eb',
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  // Carousel
  carousel: {
    marginBottom: 16,
  },
  carouselContent: {
    paddingHorizontal: 18,
    gap: 16,
  },
  carouselItem: {
    width: 200,
  },
  // Feed
  feedContainer: {
    paddingHorizontal: 34,
  },
  feedTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
    color: '#111827',
  },
});

export default HomePage;