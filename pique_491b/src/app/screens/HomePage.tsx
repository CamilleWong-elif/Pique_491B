import { EventCard } from '@/components/EventCard';
import { NavigationBar } from '@/components/NavigationBar';
import { NotificationsModal } from '@/components/NotificationsModal';
import { SocialActivityCard } from '@/components/Placeholder';
import { SearchOverlay } from '@/components/SearchOverlay';
import { auth, db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Bell, Calendar, Menu, MessageCircle, Plus, Search, SlidersHorizontal, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Image, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const mockSocialActivities: any[] = [];
const categories = [
  'Music', 'Sports', 'Arts', 'Food & Drink', 'Tech', 'Outdoors',
  'Comedy', 'Film', 'Theater', 'Gaming', 'Fitness', 'Nightlife',
  'Family', 'Education', 'Fashion', 'Business', 'Health & Wellness',
  'Travel', 'Charity', 'Religion',
];
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

  // Date filter state
  const [dateChip, setDateChip] = useState<'today' | 'week' | 'month' | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('oldest');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

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
  const categoryFiltered = selectedCategories.includes('All')
    ? activityEvents
    : activityEvents.filter((e: any) => selectedCategories.includes(e.category));

  const getEventDate = (event: any): Date | null => {
    const val = event.date ?? event.startDate;
    if (!val) return null;
    if (typeof val?.toDate === 'function') return val.toDate();
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };

  const applyDateFilters = (list: any[]) => {
    let result = [...list];
    const now = new Date();

    if (dateChip === 'today') {
      result = result.filter(e => {
        const d = getEventDate(e);
        return d && d.toDateString() === now.toDateString();
      });
    } else if (dateChip === 'week') {
      const weekEnd = new Date(now); weekEnd.setDate(now.getDate() + 7);
      result = result.filter(e => { const d = getEventDate(e); return d && d >= now && d <= weekEnd; });
    } else if (dateChip === 'month') {
      const monthEnd = new Date(now); monthEnd.setMonth(now.getMonth() + 1);
      result = result.filter(e => { const d = getEventDate(e); return d && d >= now && d <= monthEnd; });
    }

    if (rangeStart) result = result.filter(e => { const d = getEventDate(e); return d && d >= rangeStart; });
    if (rangeEnd) {
      const endOfDay = new Date(rangeEnd); endOfDay.setHours(23, 59, 59);
      result = result.filter(e => { const d = getEventDate(e); return d && d <= endOfDay; });
    }

    result.sort((a, b) => {
      const da = getEventDate(a)?.getTime() ?? 0;
      const db = getEventDate(b)?.getTime() ?? 0;
      if (sortOrder === 'oldest') {
        return da - db;
      } else {
        return db - da;
      }
    });

    return result;
  };

  const filteredEvents = applyDateFilters(categoryFiltered);

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

  const hasActiveFilters = !selectedCategories.includes('All') || dateChip !== null || rangeStart !== null || rangeEnd !== null;
  const activeFilterCount = (selectedCategories.includes('All') ? 0 : selectedCategories.length) + (dateChip ? 1 : 0) + (rangeStart || rangeEnd ? 1 : 0);

  const handleClearAll = () => {
    setSelectedCategories(['All']);
    setDateChip(null);
    setRangeStart(null);
    setRangeEnd(null);
    setSortOrder('oldest');
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

        {/* Filter Button Row */}
        <View style={styles.filterButtonRow}>
          <TouchableOpacity
            style={[styles.filterToggleBtn, hasActiveFilters && styles.filterToggleBtnActive]}
            onPress={() => setShowFilterPanel(true)}
          >
            <SlidersHorizontal size={15} color={hasActiveFilters ? '#ffffff' : '#3b82f6'} />
            <Text style={[styles.filterToggleText, hasActiveFilters && styles.filterToggleTextActive]}>
              Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </Text>
          </TouchableOpacity>
          {!selectedCategories.includes('All') && (
            <Text style={styles.activeFilterLabel}>{selectedCategories.join(', ')}</Text>
          )}
        </View>

        {/* Filter Modal */}
        <Modal visible={showFilterPanel} transparent animationType="slide">
          <TouchableOpacity style={styles.filterModalBackdrop} activeOpacity={1} onPress={() => setShowFilterPanel(false)} />
          <View style={styles.filterModalSheet}>
            {/* Header */}
            <View style={styles.filterModalHeader}>
              <Text style={styles.filterModalTitle}>Filter & Sort</Text>
              <TouchableOpacity onPress={() => setShowFilterPanel(false)}>
                <X size={22} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Categories */}
              <Text style={styles.filterLabel}>Category</Text>
              <TouchableOpacity
                style={[styles.chip, styles.allChip, selectedCategories.includes('All') && styles.chipActive]}
                onPress={() => handleCategoryClick('All')}
              >
                <Text style={[styles.chipText, selectedCategories.includes('All') && styles.chipTextActive]}>
                  All Categories
                </Text>
              </TouchableOpacity>
              <View style={[styles.chipRow, { marginTop: 8 }]}>
                {categories.map(category => (
                  <TouchableOpacity
                    key={category}
                    style={[styles.chip, selectedCategories.includes(category) && styles.chipActive]}
                    onPress={() => handleCategoryClick(category)}
                  >
                    <Text style={[styles.chipText, selectedCategories.includes(category) && styles.chipTextActive]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Quick Date */}
              <Text style={styles.filterLabel}>Quick Date</Text>
              <View style={styles.chipRow}>
                {(['today', 'week', 'month'] as const).map(chip => (
                  <TouchableOpacity
                    key={chip}
                    style={[styles.chip, dateChip === chip && styles.chipActive]}
                    onPress={() => setDateChip(dateChip === chip ? null : chip)}
                  >
                    <Text style={[styles.chipText, dateChip === chip && styles.chipTextActive]}>
                      {chip === 'today' ? 'Today' : chip === 'week' ? 'This Week' : 'This Month'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Date Range */}
              <Text style={styles.filterLabel}>Date Range</Text>
              <View style={styles.dateRangeRow}>
                <TouchableOpacity style={styles.dateRangeBtn} onPress={() => { setDateChip(null); setShowStartPicker(true); }}>
                  <Calendar size={14} color="#6b7280" />
                  <Text style={styles.dateRangeBtnText}>{rangeStart ? rangeStart.toLocaleDateString() : 'Start date'}</Text>
                </TouchableOpacity>
                <Text style={styles.dateRangeSep}>→</Text>
                <TouchableOpacity style={styles.dateRangeBtn} onPress={() => { setDateChip(null); setShowEndPicker(true); }}>
                  <Calendar size={14} color="#6b7280" />
                  <Text style={styles.dateRangeBtnText}>{rangeEnd ? rangeEnd.toLocaleDateString() : 'End date'}</Text>
                </TouchableOpacity>
                {(rangeStart || rangeEnd) && (
                  <TouchableOpacity onPress={() => { setRangeStart(null); setRangeEnd(null); }} style={styles.clearBtn}>
                    <Text style={styles.clearBtnText}>Clear</Text>
                  </TouchableOpacity>
                )}
              </View>
              {showStartPicker && (
                <DateTimePicker
                  value={rangeStart ?? new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  onChange={(_, date) => { setShowStartPicker(false); if (date) setRangeStart(date); }}
                />
              )}
              {showEndPicker && (
                <DateTimePicker
                  value={rangeEnd ?? new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  onChange={(_, date) => { setShowEndPicker(false); if (date) setRangeEnd(date); }}
                />
              )}

              {/* Sort */}
              <Text style={styles.filterLabel}>Sort By</Text>
              <View style={styles.chipRow}>
                {(['oldest', 'newest'] as const).map(opt => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.chip, sortOrder === opt && styles.chipActive]}
                    onPress={() => setSortOrder(opt)}
                  >
                    <Text style={[styles.chipText, sortOrder === opt && styles.chipTextActive]}>
                      {opt === 'oldest' ? 'Soonest First' : 'Latest First'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Footer buttons */}
            <View style={styles.filterModalFooter}>
              <TouchableOpacity style={styles.clearAllBtn} onPress={handleClearAll}>
                <Text style={styles.clearAllBtnText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyBtn} onPress={() => setShowFilterPanel(false)}>
                <Text style={styles.applyBtnText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Event Carousel (shown when "All" is selected) */}
        {selectedCategories.includes('All') && (
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
        )}

        {/* Category Event List (shown when a specific category is selected) */}
        {!selectedCategories.includes('All') && (
          <View style={styles.categoryList}>
            {filteredEvents.length === 0 ? (
              <Text style={styles.categoryListEmpty}>No events found for this category.</Text>
            ) : (
              filteredEvents.map((event: any) => {
                const dateVal = event.date ?? event.startDate;
                const startDateStr = formattoMMDD(dateVal);
                return (
                  <View key={event.id} style={styles.categoryListItem}>
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
              })
            )}
          </View>
        )}

        {/* Activity Feed — only shown when no category filter is active */}
        {selectedCategories.includes('All') && <View style={styles.feedContainer}>
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
        </View>}

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
  // Filter button row
  filterButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 16,
    gap: 10,
  },
  filterToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  filterToggleBtnActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3b82f6',
  },
  filterToggleTextActive: {
    color: '#ffffff',
  },
  activeFilterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    flexShrink: 1,
  },
  // Filter Modal
  filterModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  filterModalSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
    maxHeight: '80%',
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  filterModalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  clearAllBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  clearAllBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  applyBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
  },
  applyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  allChip: {
    alignSelf: 'flex-start',
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  chipActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  dateRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  dateRangeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    flex: 1,
  },
  dateRangeBtnText: {
    fontSize: 12,
    color: '#374151',
    flex: 1,
  },
  dateRangeSep: {
    fontSize: 14,
    color: '#9ca3af',
  },
  clearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
  },
  clearBtnText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '600',
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
  // Category List
  categoryList: {
    paddingHorizontal: 18,
    marginBottom: 16,
  },
  categoryListEmpty: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 24,
  },
  categoryListItem: {
    marginBottom: 14,
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