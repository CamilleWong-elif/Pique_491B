import { NavigationBar } from '@/components/NavigationBar';
import * as Location from 'expo-location';
import { ArrowLeft, CircleHelp, Crosshair, Star, Users, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, PanResponder, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Placeholder data — replace with real mockData imports when ready
const mockEvents: any[] = [];
const mockFriends: any[] = [];
const categories = ['All', 'Music', 'Sports', 'Arts', 'Tech', 'Outdoors'];

interface ExplorePageProps {
  onNavigate: (page: string, eventId?: string, options?: any) => void;
  onOpenMessages?: () => void;
  unreadMessageCount?: number;
  initialCategory?: string;
  initialSearchQuery?: string;
}

export function ExplorePage({ onNavigate, onOpenMessages, unreadMessageCount, initialCategory, initialSearchQuery, }: ExplorePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'All');
  const [showLegend, setShowLegend] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
      }
    })();
  }, []);

  // Draggable bottom sheet
  const MIN_HEIGHT = 200;
  const MAX_HEIGHT = 650;
  const DEFAULT_HEIGHT = 450;
  const sheetHeight = useRef(new Animated.Value(DEFAULT_HEIGHT)).current;
  const currentHeight = useRef(DEFAULT_HEIGHT);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {},
      onPanResponderMove: (_, gestureState) => {
        const newHeight = Math.min(
          Math.max(currentHeight.current - gestureState.dy, MIN_HEIGHT),
          MAX_HEIGHT
        );
        sheetHeight.setValue(newHeight);
      },
      onPanResponderRelease: (_, gestureState) => {
        const newHeight = Math.min(
          Math.max(currentHeight.current - gestureState.dy, MIN_HEIGHT),
          MAX_HEIGHT
        );
        currentHeight.current = newHeight;
        Animated.spring(sheetHeight, {
          toValue: newHeight,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  // Filtered events
  const activityEvents = mockEvents.filter((e: any) => e.category !== 'Food & Drink');
  const filteredEvents = selectedCategory === 'All'
    ? activityEvents
    : activityEvents.filter((e: any) => e.category === selectedCategory);

  return (
    <View style={styles.container}>
      <View style={[styles.topUI, { paddingTop: insets.top }]}></View>

    {/* Tentative Google Maps API */}
    <MapView
      // TBD: Removed PROVIDER_GOOGLE due to Expo Go limitation.
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      initialRegion={{
        latitude: 33.8366,    // Los Angeles area — update to match your mockData
        longitude: -118.3257,
        latitudeDelta: 0.15,  // controls zoom level (smaller = more zoomed in)
        longitudeDelta: 0.15,
      }}
      showsUserLocation={true}  // shows the blue dot for the user's real location
      showsMyLocationButton={false}
    >
      {/* Event Markers */}
      {filteredEvents.map((event: any) => (
        <Marker
          key={event.id}
          coordinate={{ latitude: event.lat, longitude: event.lng }}
          title={event.name}
          description={event.city}
          onPress={() => onNavigate('event', event.id)}
        />
      ))}

      {/* Friend Markers */}
      {mockFriends.map((friend: any) => (
        <Marker
          key={friend.id}
          coordinate={{ latitude: friend.lat, longitude: friend.lng }}
          title={friend.name}
          onPress={() => onNavigate('friendProfile', undefined, { friendName: friend.name })}
        />
      ))}
    </MapView>

      {/* Top Search UI */}
      <View style={styles.topUI}>
        <View style={styles.searchRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => onNavigate('home')}
          >
            <ArrowLeft size={20} color="#111827" />
          </TouchableOpacity>

          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search for events..."
              placeholderTextColor="#6b7280"
            />
          </View>
        </View>

        {/* Category Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        >
          <TouchableOpacity
            onPress={() => { setSelectedCategory('All'); setSearchQuery('All'); }}
            style={[styles.categoryChip, selectedCategory === 'All' && styles.categoryChipActive]}
          >
            <Text style={[styles.categoryText, selectedCategory === 'All' && styles.categoryTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          {categories.filter(c => c !== 'All' && c !== 'Food & Drink').map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => { setSelectedCategory(category); setSearchQuery(category); }}
              style={[styles.categoryChip, selectedCategory === category && styles.categoryChipActive]}
            >
              <Text style={[styles.categoryText, selectedCategory === category && styles.categoryTextActive]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Map Controls */}
      <View style={styles.mapControls}>
        <TouchableOpacity style={styles.mapControlButton}>
          <Crosshair size={20} color="#374151" />
        </TouchableOpacity>
        {showLegend ? (
          <View style={styles.legend}>
            <View style={styles.legendHeader}>
              <Text style={styles.legendTitle}>Map Legend</Text>
              <TouchableOpacity onPress={() => setShowLegend(false)}>
                <X size={16} color="#6b7280" />
              </TouchableOpacity>
            </View>
            {[
              { color: '#3b82f6', label: 'You' },
              { color: '#4ade80', label: 'Friends' },
              { color: '#c084fc', label: 'Midpoint' },
              { color: '#facc15', label: 'Suggested' },
            ].map((item) => (
              <View key={item.label} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>{item.label}</Text>
              </View>
            ))}
          </View>
        ) : (
          <TouchableOpacity
            style={styles.mapControlButton}
            onPress={() => setShowLegend(true)}
          >
            <CircleHelp size={20} color="#374151" />
          </TouchableOpacity>
        )}
      </View>

      {/* Draggable Bottom Sheet */}
      <Animated.View style={[styles.sheet, { height: sheetHeight }]}>
        {/* Drag Handle */}
        <View {...panResponder.panHandlers} style={styles.dragHandle}>
          <View style={styles.dragPill} />
        </View>

        <ScrollView
          style={styles.sheetScroll}
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Meet in the Middle Section */}
          <View style={styles.suggestedSection}>
            <View style={styles.suggestedHeader}>
              <Users size={20} color="#7c3aed" />
              <Text style={styles.suggestedTitle}>Meet in the Middle</Text>
            </View>
            <Text style={styles.suggestedSubtitle}>
              Events closest to you and your {mockFriends.length} friends
            </Text>
            {filteredEvents.slice(0, 3).map((event: any, index: number) => (
              <TouchableOpacity
                key={event.id}
                style={styles.suggestedEvent}
                onPress={() => onNavigate('event', event.id)}
              >
                <View style={styles.suggestedEventContent}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>#{index + 1}</Text>
                  </View>
                  <Text style={styles.suggestedEventName}>{event.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
            {filteredEvents.length === 0 && (
              <Text style={styles.emptyText}>No suggested events</Text>
            )}
          </View>

          {/* All Events List */}
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'All' ? 'Nearby Events' : `${selectedCategory} Events`}
          </Text>
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event: any) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventRow}
                onPress={() => onNavigate('event', event.id)}
              >
                <View style={styles.eventRowLeft}>
                  <Text style={styles.eventRowName}>{event.name}</Text>
                  <View style={styles.eventRowMeta}>
                    <Text style={styles.eventRowCity}>{event.city}, {event.state}</Text>
                    <Text style={styles.eventRowDot}>•</Text>
                    <Text style={styles.eventRowPrice}>
                      {'$'.repeat(event.pricePoint)}
                    </Text>
                  </View>
                </View>
                <View style={styles.eventRowRight}>
                  <Text style={styles.eventRowDate}>{event.startDate}</Text>
                  <View style={styles.ratingRow}>
                    <Star size={14} color="#facc15" fill="#facc15" />
                    <Text style={styles.ratingText}>
                      {event.rating} ({event.reviewCount})
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>No events found in this category</Text>
          )}
        </ScrollView>
      </Animated.View>

      <NavigationBar
        currentPage="explore"
        onNavigate={(page) => onNavigate(page)}
        onOpenMessages={onOpenMessages || (() => {})}
        unreadMessageCount={unreadMessageCount}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  // Map
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  // Top UI
  topUI: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 21,
    paddingVertical: 60,
    zIndex: 30,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  searchBar: {
    flex: 1,
    backgroundColor: '#d1d5db',
    borderRadius: 5,
    paddingHorizontal: 16,
    paddingVertical: 5,
  },
  searchInput: {
    fontSize: 11,
    color: '#111827',
  },
  categoriesContent: {
    gap: 12,
    paddingBottom: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 5,
    backgroundColor: '#d1d5db',
  },
  categoryChipActive: {
    backgroundColor: '#3b82f6',
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  // Map Controls
  mapControls: {
    position: 'absolute',
    right: 21,
    bottom: 470,
    zIndex: 30,
    gap: 12,
  },
  mapControlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  legend: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    minWidth: 140,
  },
  legendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  legendText: {
    fontSize: 10,
    color: '#374151',
  },
  // Bottom Sheet
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 20,
  },
  dragHandle: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
  },
  dragPill: {
    width: 40,
    height: 5,
    backgroundColor: '#d1d5db',
    borderRadius: 9999,
  },
  sheetScroll: {
    flex: 1,
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  // Suggested Section
  suggestedSection: {
    backgroundColor: '#faf5ff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e9d5ff',
    marginBottom: 24,
  },
  suggestedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  suggestedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4c1d95',
  },
  suggestedSubtitle: {
    fontSize: 12,
    color: '#6d28d9',
    marginBottom: 12,
  },
  suggestedEvent: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e9d5ff',
    marginBottom: 8,
  },
  suggestedEventContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rankBadge: {
    backgroundColor: '#eab308',
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  rankText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  suggestedEventName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  // Event Row
  eventRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  eventRowLeft: {
    flex: 1,
  },
  eventRowName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  eventRowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventRowCity: {
    fontSize: 12,
    color: '#6b7280',
  },
  eventRowDot: {
    fontSize: 12,
    color: '#6b7280',
  },
  eventRowPrice: {
    fontSize: 12,
    color: '#6b7280',
  },
  eventRowRight: {
    alignItems: 'flex-end',
    marginLeft: 16,
  },
  eventRowDate: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#4b5563',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 32,
  },
});