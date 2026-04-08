import { EventCard } from '@/components/EventCard';
import { NavigationBar } from '@/components/NavigationBar';
import { auth } from "@/firebase";
import { apiGetEvents, apiGetUsers, apiGetFollowing } from '@/api';
import * as Location from 'expo-location';
import { ArrowLeft, CircleHelp, Crosshair, Star, Users, X } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Image, PanResponder, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Calculate distance between two lat/lng points in miles using Haversine formula
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const IN_RANGE_DISTANCE_MILES = 50;
const MIDPOINT_MAX_DISTANCE_MILES = 10;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const categories = ['All', 'Music', 'Sports', 'Arts', 'Tech', 'Outdoors'];


interface ExplorePageProps {
  onNavigate: (page: string, eventId?: string, options?: any) => void;
  onOpenMessages?: () => void;
  unreadMessageCount?: number;
  initialCategory?: string;
  initialSearchQuery?: string;
}

export function ExplorePage({ onNavigate, onOpenMessages, unreadMessageCount, initialCategory, initialSearchQuery, }: ExplorePageProps) {
  const MEET_IN_MIDDLE_PAGE_SIZE = 3;
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'All');
  const [showLegend, setShowLegend] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [cityCoordsCache, setCityCoordsCache] = useState<Record<string, { lat: number; lng: number }>>({});
  const [selectedEventPreview, setSelectedEventPreview] = useState<any | null>(null);
  const [selectedFriendPreview, setSelectedFriendPreview] = useState<any | null>(null);
  const [previewAnchor, setPreviewAnchor] = useState<{ x: number; y: number } | null>(null);
  const [mapSize, setMapSize] = useState<{ width: number; height: number } | null>(null);
  const [visibleMeetInMiddleCount, setVisibleMeetInMiddleCount] = useState(MEET_IN_MIDDLE_PAGE_SIZE);
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

  const clearPreviews = () => {
    setSelectedEventPreview(null);
    setSelectedFriendPreview(null);
    setPreviewAnchor(null);
  };

  // Fetch raw events from Firestore (normalize latitude/longitude -> lat/lng, categories -> category)
  useEffect(() => {
    if (!auth.currentUser) return;
    const fetchEvents = async () => {
      try {
        const eventsList = await apiGetEvents();
        console.log('ExplorePage: Fetched events count:', eventsList.length);
        const normalized = eventsList.map((e: any) => ({
          ...e,
          lat: e.lat ?? e.latitude,
          lng: e.lng ?? e.longitude,
          category: e.category ?? (Array.isArray(e.categories) ? e.categories[0] : e.category),
        }));
        setEvents(normalized as any[]);
      } catch (error: any) {
        console.error('ExplorePage: Error fetching events:', error?.code ?? error?.message ?? error);
      }
    };

    fetchEvents();
  }, [auth.currentUser]);

  const getCityKey = (event: any): string | null => {
    const rawCity = (event?.city ?? event?.location ?? '').toString().trim();
    if (!rawCity) return null;
    const city = rawCity.split(',')[0]?.trim() || rawCity;
    const state = (event?.state ?? '').toString().trim();
    return state ? `${city}, ${state}` : city;
  };

  const getEventCoords = (event: any): { lat: number; lng: number } | null => {
    const lat = event?.lat;
    const lng = event?.lng;
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    const cityKey = getCityKey(event);
    if (!cityKey) return null;
    return cityCoordsCache[cityKey] ?? null;
  };

  // If an event has no coordinates, try to geocode its city as a fallback.
  useEffect(() => {
    const toGeocode = new Set<string>();
    for (const e of events) {
      if (Number.isFinite(e?.lat) && Number.isFinite(e?.lng)) continue;
      const key = getCityKey(e);
      if (key && !cityCoordsCache[key]) toGeocode.add(key);
    }
    if (toGeocode.size === 0) return;

    let cancelled = false;
    (async () => {
      for (const key of toGeocode) {
        try {
          const results = await Location.geocodeAsync(key);
          const first = results?.[0];
          if (!first || cancelled) continue;
          setCityCoordsCache(prev =>
            prev[key] ? prev : { ...prev, [key]: { lat: first.latitude, lng: first.longitude } }
          );
        } catch (err) {
          // Swallow geocoding errors; events will just remain un-mappable.
          console.log('ExplorePage: geocodeAsync failed for', key, err);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [events, cityCoordsCache]);

  // Fetch raw friends from Firestore (only users you're following)
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const followingList = await apiGetFollowing();
        console.log('ExplorePage: following retrieved count:', followingList.length);
        const mapped = followingList.map((u: any) => ({
          id: u.id,
          name: u.name || u.displayName || 'Unknown',
          lat: u.lat || 0,
          lng: u.lng || 0,
          photoURL: u.photoURL ?? u.avatar ?? u.avatarDataUrl ?? null,
        }));

        setFriends(mapped);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching following:", error);
        setLoading(false);
      }
    };

    fetchFriends();
  }, [auth.currentUser]);

  // Get user's current location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        lat: location.coords.latitude,
        lng: location.coords.longitude
      });
    })();
  }, []);

  // Map ref for programmatic control
  const mapRef = useRef<MapView>(null);

  const updatePreviewAnchor = async (coords: { lat: number; lng: number }) => {
    try {
      const point = await mapRef.current?.pointForCoordinate({
        latitude: coords.lat,
        longitude: coords.lng,
      });
      if (!point) return;
      setPreviewAnchor({ x: point.x, y: point.y });
    } catch {
      // ignore
    }
  };

  // Recenter map to user's location
  const handleRecenterMap = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 500);
    }
  };

  // Draggable bottom sheet
  const MIN_HEIGHT = 200;
  const MAX_HEIGHT = 725;
  const DEFAULT_HEIGHT = 450;
  const sheetHeight = useRef(new Animated.Value(DEFAULT_HEIGHT)).current;
  const currentHeight = useRef(DEFAULT_HEIGHT);
  const startHeight = useRef(DEFAULT_HEIGHT);
  const [controlsVisible, setControlsVisible] = useState(true);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startHeight.current = currentHeight.current;
      },
      onPanResponderMove: (_, gestureState) => {
        const newHeight = Math.min(
          Math.max(startHeight.current - gestureState.dy, MIN_HEIGHT),
          MAX_HEIGHT
        );
        sheetHeight.setValue(newHeight);
      },
      onPanResponderRelease: (_, gestureState) => {
        const newHeight = Math.min(
          Math.max(startHeight.current - gestureState.dy, MIN_HEIGHT),
          MAX_HEIGHT
        );
        currentHeight.current = newHeight;
        setControlsVisible(newHeight < MAX_HEIGHT);
        Animated.spring(sheetHeight, {
          toValue: newHeight,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  const {
    filteredEvents,
    filteredFriends,
    meetInMiddlePoint,
    meetInMiddleRadiusMiles,
    meetInMiddleEvents,
    meetInMiddleParticipantCount,
  } = useMemo(() => {
    const withinDistance = (coords: { lat: number; lng: number } | null) => {
      if (!coords) return false;
      if (!userLocation) return true;
      return calculateDistance(userLocation.lat, userLocation.lng, coords.lat, coords.lng) <= IN_RANGE_DISTANCE_MILES;
    };

    const normalizedQuery = searchQuery.trim().toLowerCase();

    const eventsWithoutFood = events.filter((event: any) => event.category !== 'Food & Drink');
    const eventsByCategory = selectedCategory === 'All'
      ? eventsWithoutFood
      : eventsWithoutFood.filter((event: any) => event.category === selectedCategory);

    const eventsBySearch = normalizedQuery
      ? eventsByCategory.filter((event: any) => {
          const name = String(event.name || '').toLowerCase();
          const city = String(event.city || '').toLowerCase();
          const state = String(event.state || '').toLowerCase();
          const category = String(event.category || '').toLowerCase();
          return (
            name.includes(normalizedQuery) ||
            city.includes(normalizedQuery) ||
            state.includes(normalizedQuery) ||
            category.includes(normalizedQuery)
          );
        })
      : eventsByCategory;

    const eventsInRange = eventsBySearch.filter((event: any) => withinDistance(getEventCoords(event)));

    const friendsInRange = friends.filter((friend: any) =>
      withinDistance(
        Number.isFinite(friend?.lat) && Number.isFinite(friend?.lng)
          ? { lat: friend.lat, lng: friend.lng }
          : null
      )
    );
    const friendsBySearch = normalizedQuery
      ? friendsInRange.filter((friend: any) => String(friend.name || '').toLowerCase().includes(normalizedQuery))
      : friendsInRange;

    const friendsWithinMidpointDistance = friends.filter((friend: any) => {
      if (!userLocation) return false;
      if (!Number.isFinite(friend?.lat) || !Number.isFinite(friend?.lng)) return false;
      return calculateDistance(userLocation.lat, userLocation.lng, friend.lat, friend.lng) <= MIDPOINT_MAX_DISTANCE_MILES;
    });

    const participantCoords: Array<{ lat: number; lng: number }> = friendsWithinMidpointDistance
      .filter((friend: any) => Number.isFinite(friend?.lat) && Number.isFinite(friend?.lng))
      .map((friend: any) => ({ lat: friend.lat, lng: friend.lng }));

    if (userLocation) {
      participantCoords.push({ lat: userLocation.lat, lng: userLocation.lng });
    }

    let midpoint: { lat: number; lng: number } | null = null;
    let midpointRadiusMiles = 0;
    let midpointEvents: any[] = [];

    if (participantCoords.length > 0) {
      const midpointLat = participantCoords.reduce((sum, p) => sum + p.lat, 0) / participantCoords.length;
      const midpointLng = participantCoords.reduce((sum, p) => sum + p.lng, 0) / participantCoords.length;
      midpoint = { lat: midpointLat, lng: midpointLng };

      const distancesFromMidpoint = participantCoords.map((p) =>
        calculateDistance(midpointLat, midpointLng, p.lat, p.lng)
      );
      const furthestDistance = distancesFromMidpoint.length > 0 ? Math.max(...distancesFromMidpoint) : 0;
      midpointRadiusMiles = Math.min(furthestDistance, MIDPOINT_MAX_DISTANCE_MILES);

      midpointEvents = eventsBySearch
        .map((event: any) => {
          const coords = getEventCoords(event);
          if (!coords) return null;
          const distanceFromMidpoint = calculateDistance(midpointLat, midpointLng, coords.lat, coords.lng);
          const distanceFromUser = userLocation
            ? calculateDistance(userLocation.lat, userLocation.lng, coords.lat, coords.lng)
            : null;
          const rawRating = Number(event?.rating);
          return {
            ...event,
            midpointDistanceMiles: distanceFromMidpoint,
            userDistanceMiles: distanceFromUser,
            midpointRating: Number.isFinite(rawRating) ? rawRating : null,
          };
        })
        .filter((event: any) => event && event.midpointDistanceMiles <= midpointRadiusMiles)
        .sort((a: any, b: any) => {
          const ratingA = a.midpointRating ?? -1;
          const ratingB = b.midpointRating ?? -1;
          if (ratingB !== ratingA) return ratingB - ratingA;
          return a.midpointDistanceMiles - b.midpointDistanceMiles;
        });
    }

    return {
      filteredEvents: eventsInRange,
      filteredFriends: friendsBySearch,
      meetInMiddlePoint: midpoint,
      meetInMiddleRadiusMiles: midpointRadiusMiles,
      meetInMiddleEvents: midpointEvents,
      meetInMiddleParticipantCount: participantCoords.length,
    };
  }, [events, friends, searchQuery, selectedCategory, userLocation, cityCoordsCache]);

  useEffect(() => {
    setVisibleMeetInMiddleCount(MEET_IN_MIDDLE_PAGE_SIZE);
  }, [meetInMiddleEvents, MEET_IN_MIDDLE_PAGE_SIZE]);

  return (
    <View style={styles.container}>
      <View style={[styles.topUI, { paddingTop: insets.top }]} pointerEvents="none"></View>

    {/* Tentative Google Maps API */}
    <MapView
      ref={mapRef}
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setMapSize({ width, height });
      }}
      initialRegion={{
        latitude: userLocation?.lat || 33.8366,
        longitude: userLocation?.lng || -118.3257,
        latitudeDelta: 0.15,
        longitudeDelta: 0.15,
      }}
      showsUserLocation={true}
      showsMyLocationButton={false}
      onPress={clearPreviews}
      onRegionChangeComplete={() => {
        const coords = selectedEventPreview ? getEventCoords(selectedEventPreview) : null;
        const friendCoords = selectedFriendPreview && Number.isFinite(selectedFriendPreview?.lat) && Number.isFinite(selectedFriendPreview?.lng)
          ? { lat: selectedFriendPreview.lat, lng: selectedFriendPreview.lng }
          : null;
        const active = coords ?? friendCoords;
        if (active) updatePreviewAnchor(active);
      }}
    >
      {/* Event Markers — only render when we have valid coordinates */}
      {filteredEvents
        .map((event: any) => {
          const coords = getEventCoords(event);
          if (!coords) return null;
          const isMeetInMiddleEvent =
            !!meetInMiddlePoint &&
            meetInMiddleRadiusMiles > 0 &&
            calculateDistance(
              meetInMiddlePoint.lat,
              meetInMiddlePoint.lng,
              coords.lat,
              coords.lng
            ) <= meetInMiddleRadiusMiles;
          const eventImageUri =
            event?.imageUrl ??
            event?.image ??
            (Array.isArray(event?.photos) ? event.photos[0] : undefined);
          const eventInitial = String(event?.name || 'E').trim().slice(0, 1).toUpperCase();
          return (
        <Marker
          key={event.id}
          coordinate={{ latitude: coords.lat, longitude: coords.lng }}
          zIndex={isMeetInMiddleEvent ? 3 : 1}
          onPress={(e) => {
            (e as any)?.stopPropagation?.();
            setSelectedFriendPreview(null);
            setSelectedEventPreview(event);
            updatePreviewAnchor(coords);
          }}
        >
          <View
            style={[
              styles.markerCircle,
              styles.markerEvent,
              isMeetInMiddleEvent && styles.markerEventMidpointMatch,
            ]}
          >
            {eventImageUri ? (
              <Image source={{ uri: eventImageUri }} style={styles.markerImage} />
            ) : (
              <Text style={styles.markerFallbackText}>{eventInitial}</Text>
            )}
          </View>
        </Marker>
          );
        })
        .filter(Boolean)}

      {/* Friend Markers — only render when we have valid coordinates */}
      {filteredFriends
        .filter((friend: any) => friend.lat != null && friend.lng != null && Number.isFinite(friend.lat) && Number.isFinite(friend.lng))
        .map((friend: any) => {
          const friendImageUri = friend?.photoURL ?? friend?.avatar ?? friend?.photoUrl;
          const friendInitial = String(friend?.name || 'U').trim().slice(0, 1).toUpperCase();
          return (
        <Marker
          key={friend.id}
          coordinate={{ latitude: friend.lat, longitude: friend.lng }}
          onPress={(e) => {
            (e as any)?.stopPropagation?.();
            setSelectedEventPreview(null);
            setSelectedFriendPreview(friend);
            updatePreviewAnchor({ lat: friend.lat, lng: friend.lng });
          }}
        >
          <View style={[styles.markerCircle, styles.markerFriend]}>
            {friendImageUri ? (
              <Image source={{ uri: friendImageUri }} style={styles.markerImage} />
            ) : (
              <Text style={styles.markerFallbackText}>{friendInitial}</Text>
            )}
          </View>
        </Marker>
          );
        })}

      {meetInMiddlePoint && meetInMiddleRadiusMiles > 0 ? (
        <>
          <Circle
            center={{ latitude: meetInMiddlePoint.lat, longitude: meetInMiddlePoint.lng }}
            radius={meetInMiddleRadiusMiles * 1609.34}
            strokeColor="rgba(192, 132, 252, 0.8)"
            fillColor="rgba(192, 132, 252, 0.18)"
            strokeWidth={2}
          />
          <Marker
            coordinate={{ latitude: meetInMiddlePoint.lat, longitude: meetInMiddlePoint.lng }}
            anchor={{ x: 0.5, y: 0.5 }}
            onPress={(e) => {
              (e as any)?.stopPropagation?.();
              clearPreviews();
            }}
          >
            <View style={[styles.markerCircle, styles.markerMidpoint]}>
              <Text style={styles.markerFallbackText}>M</Text>
            </View>
          </Marker>
        </>
      ) : null}
    </MapView>

    {/* Marker preview overlay (anchored beside marker) */}
    {selectedEventPreview && previewAnchor && mapSize ? (() => {
      const windowW = Dimensions.get('window').width;
      // Make the preview card a bit wider than it is tall,
      // and closer to the proportions in the design mock.
      const CARD_W = Math.max(160, Math.floor(windowW * 0.42));
      const CARD_H = Math.floor(CARD_W * 0.9);
      const GAP = 10;
      const PAD = 8;
      const side =
        previewAnchor.x + GAP + CARD_W + PAD <= mapSize.width ? 'right' : 'left';
      const rawLeft =
        side === 'right'
          ? previewAnchor.x + GAP
          : previewAnchor.x - GAP - CARD_W;
      const rawTop = previewAnchor.y - CARD_H / 2;
      const left = Math.max(PAD, Math.min(rawLeft, mapSize.width - CARD_W - PAD));
      const top = Math.max(PAD, Math.min(rawTop, mapSize.height - CARD_H - PAD));
      const dateVal = selectedEventPreview?.date ?? selectedEventPreview?.startDate;
      const startDateStr = formattoMMDD(dateVal);
      const eventForCard = {
        id: selectedEventPreview?.id,
        name: selectedEventPreview?.name ?? '',
        imageUrl:
          selectedEventPreview?.imageUrl ??
          selectedEventPreview?.image ??
          (Array.isArray(selectedEventPreview?.photos) ? selectedEventPreview.photos[0] : undefined),
        startDate: startDateStr ?? selectedEventPreview?.startDate,
        endDate: selectedEventPreview?.endDate,
        category: selectedEventPreview?.category,
        city: selectedEventPreview?.city ?? selectedEventPreview?.location,
        pricePoint: selectedEventPreview?.pricePoint,
        rating: selectedEventPreview?.rating,
        distance: selectedEventPreview?.distance,
      } as any;

      return (
        <View style={[styles.previewCard, { left, top, width: CARD_W }]}>
          <EventCard
            event={eventForCard}
            onPress={() => onNavigate('event', selectedEventPreview.id)}
            hideBookmark
          />
        </View>
      );
    })() : null}

    {selectedFriendPreview && previewAnchor && mapSize ? (() => {
      const windowW = Dimensions.get('window').width;
      const CARD_W = Math.max(120, Math.floor(windowW / 3));
      const CARD_H = 112;
      const GAP = 10;
      const PAD = 8;
      const side =
        previewAnchor.x + GAP + CARD_W + PAD <= mapSize.width ? 'right' : 'left';
      const rawLeft =
        side === 'right'
          ? previewAnchor.x + GAP
          : previewAnchor.x - GAP - CARD_W;
      const rawTop = previewAnchor.y - CARD_H / 2;
      const left = Math.max(PAD, Math.min(rawLeft, mapSize.width - CARD_W - PAD));
      const top = Math.max(PAD, Math.min(rawTop, mapSize.height - CARD_H - PAD));
      return (
      <TouchableOpacity
        activeOpacity={0.95}
        style={[styles.previewCardFriend, { left, top, width: CARD_W }]}
        onPress={() => onNavigate('friendProfile', undefined, { friendName: selectedFriendPreview.id || selectedFriendPreview.name })}
      >
        <View style={styles.previewFriendContent}>
          <View style={[styles.markerCircle, styles.markerFriend, { width: 54, height: 54, borderRadius: 27 }]}>
            {selectedFriendPreview?.photoURL ? (
              <Image source={{ uri: selectedFriendPreview.photoURL }} style={styles.markerImage} />
            ) : (
              <Text style={[styles.markerFallbackText, { fontSize: 18 }]}>
                {String(selectedFriendPreview?.name || 'U').trim().slice(0, 1).toUpperCase()}
              </Text>
            )}
          </View>
          <Text style={styles.previewFriendName}>{String(selectedFriendPreview?.name || '')}</Text>
          <Text style={styles.previewFriendCta}>View Profile</Text>
        </View>
      </TouchableOpacity>
      );
    })() : null}

      {/* Top Search UI */}
      <View style={styles.topUI} pointerEvents="box-none">
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

      {/* Map Controls - positioned relative to sheet height, hidden at max height */}
      {controlsVisible && (
      <Animated.View style={[styles.mapControls, { bottom: Animated.add(sheetHeight, 16) }]}>
        <TouchableOpacity 
          style={styles.mapControlButton}
          onPress={handleRecenterMap}
        >
          <Crosshair size={20} color={userLocation ? "#374151" : "#9ca3af"} />
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
              { color: '#7c3aed', label: 'Midpoint Recommended Events' },
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
      </Animated.View>
      )}

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
              {meetInMiddleParticipantCount > 0
                ? `Events inside a ${meetInMiddleRadiusMiles.toFixed(1)} mile midpoint radius (${Math.max(meetInMiddleParticipantCount - 1, 0)} friends) · distance shown from you`
                : 'Add friend locations to calculate a midpoint radius'}
            </Text>
            {meetInMiddleEvents.slice(0, visibleMeetInMiddleCount).map((event: any, index: number) => (
              <TouchableOpacity
                key={event.id}
                style={styles.suggestedEvent}
                onPress={() => onNavigate('event', event.id)}
              >
                <View style={styles.suggestedEventContent}>
                  <View style={styles.suggestedEventMain}>
                    <View style={styles.rankBadge}>
                      <Text style={styles.rankText}>#{index + 1}</Text>
                    </View>
                    <Text style={styles.suggestedEventName}>{event.name}</Text>
                  </View>
                  <View style={styles.suggestedEventSide}>
                    <Text style={styles.suggestedEventRatingText}>
                      {event.midpointRating != null ? event.midpointRating.toFixed(1) : 'N/A'}
                    </Text>
                    <Text style={styles.suggestedEventDistanceInline}>
                      {event.userDistanceMiles != null
                        ? `${event.userDistanceMiles.toFixed(1)} mi from you`
                        : `${event.midpointDistanceMiles.toFixed(1)} mi from midpoint`}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            {visibleMeetInMiddleCount < meetInMiddleEvents.length && (
              <TouchableOpacity
                style={styles.showMoreButton}
                onPress={() =>
                  setVisibleMeetInMiddleCount((prev) =>
                    Math.min(prev + MEET_IN_MIDDLE_PAGE_SIZE, meetInMiddleEvents.length)
                  )
                }
              >
                <Text style={styles.showMoreText}>Show more</Text>
              </TouchableOpacity>
            )}
            {meetInMiddleEvents.length === 0 && (
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
  markerCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  markerEvent: {
    borderColor: '#facc15', // Suggested (matches legend)
  },
  markerEventMidpointMatch: {
    borderColor: '#7c3aed',
    borderWidth: 3,
  },
  markerFriend: {
    borderColor: '#4ade80', // Friends (matches legend)
  },
  markerMidpoint: {
    borderColor: '#c084fc',
    backgroundColor: '#faf5ff',
  },
  markerImage: {
    width: '100%',
    height: '100%',
  },
  markerFallbackText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  previewCard: {
    position: 'absolute',
    // Outer wrapper for the shared EventCard preview.
    // Keep below the bottom sheet/list (zIndex: 20).
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
    zIndex: 15, // keep below the bottom sheet/list (zIndex: 20)
  },
  previewCardFriend: {
    position: 'absolute',
    width: 190,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
    zIndex: 15, // keep below the bottom sheet/list (zIndex: 20)
  },
  previewRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  previewThumbWrap: {
    width: 64,
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
  },
  previewThumb: {
    width: '100%',
    height: '100%',
  },
  previewThumbFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewThumbFallbackText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  previewMeta: {
    flex: 1,
    minWidth: 0,
  },
  previewTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
  },
  previewSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  previewSubText: {
    fontSize: 11,
    color: '#111827',
    fontWeight: '700',
  },
  previewLocation: {
    marginTop: 4,
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
  },
  previewFriendContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 6,
  },
  previewFriendName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  previewFriendCta: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
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
    right: 16,
    zIndex: 30,
    gap: 12,
    alignItems: 'flex-end',
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  suggestedEventMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    paddingRight: 8,
  },
  suggestedEventSide: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 64,
    gap: 4,
  },
  suggestedEventRatingText: {
    fontSize: 11,
    color: '#4b5563',
    fontWeight: '700',
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
  suggestedEventDistanceInline: {
    fontSize: 11,
    color: '#6d28d9',
    fontWeight: '600',
  },
  showMoreButton: {
    marginTop: 4,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 9999,
    backgroundColor: '#ede9fe',
  },
  showMoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5b21b6',
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

export default ExplorePage;