// EventDetailScreen.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Dimensions,
  Modal,
  FlatList,
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StatusBar,
  Linking,
  Alert,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Star,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Navigation,
  Bookmark,
} from "lucide-react-native";
import { apiGetEvent, apiCreateBooking, apiGetReviews, apiToggleLike, apiReportBrokenLink } from '@/api';
import { useAuth } from '@/context/AuthContext';

// ----- Types (adjust to your app) -----
export type UserImage = { url: string; userName: string };

export type Event = {
  id: string;
  name: string;
  imageUrl: string;
  imageUrls?: string[];
  /** Raw Firestore shapes: strings, or objects with url/uri and optional userName/name */
  userImages?: unknown[];
  startDate?: string;
  endDate?: string;
  city: string;
  state: string;
  rating: number;
  reviewCount: number;
  description: string;
  address: string;
  distance: number;
  pricePoint: number; // 0..4
};

type Props = {
  eventId: string;
  onBack: () => void;
  showPrice?: boolean;
  onNavigate?: (page: string, eventId?: string) => void;
  activeTab?: "posted" | "liked" | "booked";
};

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

function computeReviewStats(
  reviews: { rating?: number }[]
): { rating: number; reviewCount: number } {
  const rated = reviews.filter(
    (r) => typeof r?.rating === "number" && Number.isFinite(r.rating)
  ) as { rating: number }[];
  if (rated.length === 0) return { rating: 0, reviewCount: 0 };
  const avg = rated.reduce((sum, r) => sum + r.rating, 0) / rated.length;
  return { rating: Number(avg.toFixed(1)), reviewCount: rated.length };
}

/** Ensure userImages from Firestore always become { url, userName } (handles strings or partial objects). */
function normalizeUserImages(raw: unknown): UserImage[] {
  if (!Array.isArray(raw)) return [];
  const out: UserImage[] = [];
  for (const item of raw) {
    if (typeof item === "string") {
      const url = item.trim();
      if (url) out.push({ url, userName: "Contributor" });
      continue;
    }
    if (item && typeof item === "object") {
      const o = item as Record<string, unknown>;
      const urlRaw =
        typeof o.url === "string"
          ? o.url
          : typeof o.uri === "string"
            ? o.uri
            : typeof o.src === "string"
              ? o.src
              : "";
      const url = urlRaw.trim();
      if (!url) continue;
      const userName =
        typeof o.userName === "string" && o.userName.trim()
          ? o.userName.trim()
          : typeof o.name === "string" && o.name.trim()
            ? o.name.trim()
            : "Contributor";
      out.push({ url, userName });
    }
  }
  return out;
}

function normalizeImageUrl(raw: unknown): string {
  if (typeof raw !== "string") return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (trimmed.startsWith("http://")) return `https://${trimmed.slice("http://".length)}`;
  return trimmed;
}

function pickPrimaryImage(doc: Record<string, any>): string {
  const direct = normalizeImageUrl(doc.imageUrl ?? doc.image);
  if (direct) return direct;
  if (Array.isArray(doc.imageUrls)) {
    for (const candidate of doc.imageUrls) {
      const normalized = normalizeImageUrl(candidate);
      if (normalized) return normalized;
    }
  }
  if (Array.isArray(doc.photos)) {
    for (const candidate of doc.photos) {
      const fromString = normalizeImageUrl(candidate);
      if (fromString) return fromString;
      const fromObject = normalizeImageUrl(candidate?.url ?? candidate?.uri ?? candidate?.src);
      if (fromObject) return fromObject;
    }
  }
  return "";
}

function collectGalleryImages(doc: Record<string, any>): UserImage[] {
  const candidates: UserImage[] = [];
  const seen = new Set<string>();
  const add = (rawUrl: unknown, userName = "Event Photo") => {
    const url = normalizeImageUrl(rawUrl);
    if (!url || seen.has(url)) return;
    seen.add(url);
    candidates.push({ url, userName });
  };

  add(doc.imageUrl ?? doc.image, "Event Creator");
  if (Array.isArray(doc.imageUrls)) {
    doc.imageUrls.forEach((u: unknown) => add(u, "Event Photo"));
  }
  if (Array.isArray(doc.photos)) {
    doc.photos.forEach((item: any) => {
      add(item, "Event Photo");
      add(item?.url ?? item?.uri ?? item?.src, item?.userName ?? item?.name ?? "Event Photo");
    });
  }
  return candidates;
}

/** Map a raw Firestore document to the local Event shape. */
function mapFirestoreToEvent(id: string, d: Record<string, any>): Event {
  const toDateStr = (value: any): string | undefined => {
    if (!value) return undefined;
    if (typeof value?.toDate === "function") return value.toDate().toLocaleDateString();
    if (value instanceof Date) return value.toLocaleDateString();
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed.toLocaleDateString();
  };

  const city: string = d.city ?? (typeof d.location === "string" ? d.location.split(",")[0]?.trim() : "") ?? "";
  const state: string = d.state ?? (typeof d.location === "string" ? d.location.split(",")[1]?.trim() : "") ?? "";

  return {
    id,
    name: d.name ?? "Untitled Event",
    imageUrl: pickPrimaryImage(d),
    imageUrls: Array.isArray(d.imageUrls) ? d.imageUrls : [],
    userImages: Array.isArray(d.userImages) ? d.userImages : collectGalleryImages(d),
    startDate: toDateStr(d.startDate ?? d.date),
    endDate: toDateStr(d.endDate),
    city,
    state,
    rating: typeof d.rating === "number" ? d.rating : 0,
    reviewCount: typeof d.reviewCount === "number" ? d.reviewCount : 0,
    description: d.description ?? "",
    address: d.address ?? d.location ?? "",
    distance: typeof d.distance === "number" ? d.distance : 0,
    pricePoint: typeof d.pricePoint === "number" ? d.pricePoint : (d.ticketTiers?.length ? 1 : 0),
    externalUrl: d.externalUrl ?? null,
    source: d.source ?? 'manual',
  };
}

export function EventDetailScreen({
  eventId,
  onBack,
  showPrice = true,
  onNavigate,
  activeTab,
}: Props) {
  const { user, profile } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const [reviews, setReviews] = useState<{ id: string; author: string; friendName?: string; rating: number; comment: string; createdAt?: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFetchError(null);

    (async () => {
      try {
        const [data, reviewData] = await Promise.all([
          apiGetEvent(eventId),
          apiGetReviews(eventId).catch(() => []),
        ]);
        if (cancelled) return;
        const mappedEvent = mapFirestoreToEvent(data.id, data);
        const nextReviews = reviewData ?? [];
        const stats = computeReviewStats(nextReviews);
        setEvent({
          ...mappedEvent,
          rating: stats.reviewCount > 0 ? stats.rating : mappedEvent.rating,
          reviewCount: stats.reviewCount,
        });
        setReviews(nextReviews);
      } catch (err: any) {
        if (!cancelled) setFetchError(err?.message ?? "Failed to load event.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [eventId]);

  // Bookmark state from user profile (Firestore likedEvents), kept in sync with optimistic toggles
  useEffect(() => {
    const liked: string[] = profile?.likedEvents ?? [];
    setIsBookmarked(liked.includes(eventId));
  }, [eventId, profile?.likedEvents]);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [whiteBackdrop, setWhiteBackdrop] = useState(true);
  const [brokenImageUrls, setBrokenImageUrls] = useState<Set<string>>(new Set());

  const allImages = useMemo((): UserImage[] => {
    if (!event) return [];
    const primary = normalizeImageUrl(event.imageUrl);
    const fromCreator: UserImage[] = primary
      ? [{ url: primary, userName: "Event Creator" }]
      : [];
    const userImgs = normalizeUserImages(event.userImages).map((img) => ({
      ...img,
      url: normalizeImageUrl(img.url),
    }));
    const unique: UserImage[] = [];
    const seen = new Set<string>();
    [...fromCreator, ...userImgs].forEach((img) => {
      if (!img.url || seen.has(img.url) || brokenImageUrls.has(img.url)) return;
      seen.add(img.url);
      unique.push(img);
    });
    return unique;
  }, [event, brokenImageUrls]);

  const heroPagerRef = useRef<FlatList<{ url: string; userName: string }>>(null);
  const galleryPagerRef = useRef<FlatList<{ url: string; userName: string }>>(null);

  useEffect(() => {
    const n = allImages.length;
    if (n === 0) {
      setCurrentSlide(0);
      setCurrentImageIndex(0);
      return;
    }
    setCurrentSlide((s) => Math.min(s, n - 1));
    setCurrentImageIndex((i) => Math.min(i, n - 1));
  }, [allImages]);

  useEffect(() => {
    if (galleryOpen && allImages.length === 0) setGalleryOpen(false);
  }, [galleryOpen, allImages.length]);

  // Auto-advance hero slideshow every 5 seconds (when multiple images & gallery not open)
  // Must be declared before any early returns to satisfy Rules of Hooks.
  useEffect(() => {
    if (allImages.length <= 1) return;
    if (galleryOpen) return;

    const t = setInterval(() => {
      setCurrentSlide((prev) => {
        const next = (prev + 1) % allImages.length;
        heroPagerRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 5000);

    return () => clearInterval(t);
  }, [allImages.length, galleryOpen]);

  const notchTopPadEarly =
    Platform.OS === "android"
      ? (StatusBar.currentHeight || 0) + 14
      : 14;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#0284C7" />
        <TouchableOpacity
          onPress={onBack}
          style={[styles.backBtn, { position: "absolute", top: notchTopPadEarly, left: 18 }]}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <ArrowLeft size={20} color="#111" />
        </TouchableOpacity>
      </View>
    );
  }

  if (fetchError || !event) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff", padding: 24 }}>
        <Text style={{ fontSize: 16, color: "#374151", textAlign: "center", marginBottom: 16 }}>
          {fetchError ?? "Something went wrong."}
        </Text>
        <TouchableOpacity onPress={onBack} style={styles.bookBtn}>
          <Text style={styles.bookText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatDate = () => {
    if (!event.startDate) return "";
    if (event.endDate) return `${event.startDate} - ${event.endDate}`;
    return event.startDate;
  };

  const openGallery = (index: number) => {
    if (allImages.length === 0) return;
    const safeIndex = Math.max(0, Math.min(index, allImages.length - 1));
    setCurrentImageIndex(safeIndex);
    setGalleryOpen(true);
    requestAnimationFrame(() => {
      galleryPagerRef.current?.scrollToIndex({ index: safeIndex, animated: false });
    });
  };

  const closeGallery = () => {
    setGalleryOpen(false);
    setWhiteBackdrop(true);
  };

  const toggleBackdrop = () => setWhiteBackdrop((v) => !v);

  const nextImage = () => {
    setCurrentImageIndex((prev) => {
      const next = Math.min(prev + 1, allImages.length - 1);
      galleryPagerRef.current?.scrollToIndex({ index: next, animated: true });
      return next;
    });
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => {
      const next = Math.max(prev - 1, 0);
      galleryPagerRef.current?.scrollToIndex({ index: next, animated: true });
      return next;
    });
  };

  const showBookButton = !activeTab || activeTab === "liked";

  const renderPricePoints = () =>
    Array.from({ length: 4 }).map((_, i) => (
      <Text key={i} style={[styles.dollar, i < event.pricePoint ? styles.dollarOn : styles.dollarOff]}>
        $
      </Text>
    ));


  const isExternalEvent =
    !!(event as any)?.externalUrl &&
    (event as any)?.source !== 'manual';

  const handleBookClick = async () => {
    if (booking) return;

    if (isExternalEvent) {
      const url = (event as any).externalUrl as string;
      try {
        const supported = await Linking.canOpenURL(url);
        if (!supported) {
          Alert.alert('Cannot open link', 'This event link is not supported on your device.');
          return;
        }
        await Linking.openURL(url);
      } catch (err) {
        console.error('Failed to open external event URL:', err);
        Alert.alert('Unable to open link', 'Please try again.');
      }
      return;
    }

    setBooking(true);
    try {
      await apiCreateBooking({
        eventId: event.id,
        quantity: 1,
        total: 0,
        email: user?.email || 'user@placeholder.com',
      });
      onNavigate?.('home');
    } catch (err) {
      console.error('Booking error:', err);
      setBooking(false);
    }
  };

  const handleBookmarkPress = async () => {
    if (!user?.uid || !event) return;
    const was = isBookmarked;
    setIsBookmarked(!was);
    try {
      await apiToggleLike(event.id);
    } catch (err) {
      setIsBookmarked(was);
      console.error('Bookmark error:', err);
    }
  };

  const handleReportLink = () => {
    if (!event) return;
    Alert.alert(
      'Report Broken Link',
      'Let us know if the ticket link for this event is not working. We\u2019ll look into it.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report',
          onPress: () => {
            apiReportBrokenLink(event.id)
              .then(() => Alert.alert('Thank you', 'Your report has been submitted.'))
              .catch(() => Alert.alert('Error', 'Could not submit report. Please try again.'));
          },
        },
      ],
    );
  };

  const onHeroScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    setCurrentSlide(idx);
  };

  const onGalleryScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    setCurrentImageIndex(idx);
  };

  const initials = (name: string) =>
    name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0]?.toUpperCase())
      .join("")
      .slice(0, 2);

  const notchTopPad =
    Platform.OS === "android"
      ? (StatusBar.currentHeight || 0) + 12
      : 12;

  const galleryActiveSlide =
    allImages.length > 0
      ? allImages[Math.min(currentImageIndex, allImages.length - 1)]
      : undefined;

  return (
    <View style={styles.root}>
      {/* Gallery Overlay */}
      <Modal visible={galleryOpen} animationType="fade" onRequestClose={closeGallery}>
        <SafeAreaView style={[styles.galleryRoot, { backgroundColor: whiteBackdrop ? "#fff" : "#000" }]}>
          {/* Top bar */}
          <View style={[styles.galleryTopBar, { paddingTop: notchTopPad }]}>
            <TouchableOpacity
              onPress={closeGallery}
              style={[
                styles.iconCircle,
                { backgroundColor: "transparent" },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Close gallery"
            >
              <ChevronLeft size={28} color={whiteBackdrop ? "#111" : "#fff"} />
            </TouchableOpacity>

            {whiteBackdrop ? (
              <Text style={styles.galleryTitle} numberOfLines={1}>
                {event.name}
              </Text>
            ) : (
              <View style={{ width: 1 }} />
            )}

            <TouchableOpacity
              onPress={() => {}}
              style={styles.iconCircle}
              accessibilityRole="button"
              accessibilityLabel="More options"
            >
              <Text style={{ fontSize: 26, color: whiteBackdrop ? "#111" : "#fff" }}>⋯</Text>
            </TouchableOpacity>
          </View>

          {/* Image area */}
          <Pressable style={styles.galleryBody} onPress={toggleBackdrop}>
            {/* counter on dark mode */}
            {!whiteBackdrop && allImages.length > 0 && (
              <View style={styles.counterPill}>
                <Text style={styles.counterText}>
                  {Math.min(currentImageIndex, allImages.length - 1) + 1} / {allImages.length}
                </Text>
              </View>
            )}

            {/* prev/next buttons */}
            {currentImageIndex > 0 && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation?.();
                  previousImage();
                }}
                style={[
                  styles.galleryNavBtn,
                  { left: 16, backgroundColor: whiteBackdrop ? "#E5E7EB" : "rgba(255,255,255,0.2)" },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Previous image"
              >
                <ChevronLeft size={32} color={whiteBackdrop ? "#111" : "#fff"} />
              </TouchableOpacity>
            )}

            {currentImageIndex < allImages.length - 1 && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation?.();
                  nextImage();
                }}
                style={[
                  styles.galleryNavBtn,
                  { right: 16, backgroundColor: whiteBackdrop ? "#E5E7EB" : "rgba(255,255,255,0.2)" },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Next image"
              >
                <ChevronRight size={32} color={whiteBackdrop ? "#111" : "#fff"} />
              </TouchableOpacity>
            )}

            <FlatList
              ref={galleryPagerRef}
              data={allImages}
              keyExtractor={(_, i) => `g-${i}`}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onGalleryScrollEnd}
              renderItem={({ item }) => (
                <View style={styles.gallerySlide}>
                  <ExpoImage
                    source={{ uri: item.url }}
                    contentFit="contain"
                    style={styles.galleryImage}
                    onError={() =>
                      setBrokenImageUrls((prev) => {
                        const next = new Set(prev);
                        next.add(item.url);
                        return next;
                      })
                    }
                  />
                </View>
              )}
              getItemLayout={(_, index) => ({
                length: SCREEN_W,
                offset: SCREEN_W * index,
                index,
              })}
              initialScrollIndex={currentImageIndex}
            />
          </Pressable>

          {/* Bottom info (only when white backdrop) */}
          {whiteBackdrop && galleryActiveSlide ? (
            <View style={styles.galleryBottom}>
              <View style={styles.userRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials(galleryActiveSlide.userName)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>{galleryActiveSlide.userName}</Text>
                  <Text style={styles.userSub}>Posted to {event.name}</Text>
                </View>
              </View>
            </View>
          ) : null}
        </SafeAreaView>
      </Modal>

      {/* Main Scroll */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: showBookButton ? 150 : 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          {allImages.length === 0 ? (
            <View style={styles.heroPlaceholder}>
              <Text style={styles.heroPlaceholderText}>
                {(event.name || "Event").slice(0, 2).toUpperCase()}
              </Text>
            </View>
          ) : (
            <Pressable style={StyleSheet.absoluteFill} onPress={() => openGallery(currentSlide)}>
              <FlatList
                ref={heroPagerRef}
                data={allImages}
                keyExtractor={(_, i) => `h-${i}`}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={onHeroScrollEnd}
                renderItem={({ item }) => (
                  <ExpoImage
                    source={{ uri: item.url }}
                    style={styles.heroImage}
                    contentFit="cover"
                    onError={() =>
                      setBrokenImageUrls((prev) => {
                        const next = new Set(prev);
                        next.add(item.url);
                        return next;
                      })
                    }
                  />
                )}
                getItemLayout={(_, index) => ({
                  length: SCREEN_W,
                  offset: SCREEN_W * index,
                  index,
                })}
              />
            </Pressable>
          )}

          {/* Indicators */}
          {allImages.length > 1 && (
            <View style={styles.indicators}>
              {allImages.map((_, index) => {
                const active = index === currentSlide;
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setCurrentSlide(index);
                      heroPagerRef.current?.scrollToIndex({ index, animated: true });
                    }}
                    style={[styles.dot, active ? styles.dotActive : styles.dotInactive]}
                    accessibilityRole="button"
                    accessibilityLabel={`Go to image ${index + 1}`}
                  />
                );
              })}
            </View>
          )}

          {/* Back */}
          <TouchableOpacity
            onPress={onBack}
            style={[styles.backBtn, { top: (Platform.OS === "android" ? (StatusBar.currentHeight || 0) : 0) + 14 }]}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <ArrowLeft size={20} color="#111" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{event.name}</Text>
            {!!event.startDate && <Text style={styles.date}>{formatDate()}</Text>}
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.locationText}>
              {event.city}, {event.state}
            </Text>
            <View style={styles.ratingRow}>
              <Star size={16} color="#FACC15" fill="#FACC15" />
              <Text style={styles.ratingText}>{event.rating}</Text>
              <Text style={styles.reviewCount}>({event.reviewCount})</Text>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              onPress={() => onNavigate?.("review", event.id)}
              style={[styles.actionBtn, styles.actionBtnReview]}
              accessibilityRole="button"
              accessibilityLabel="Review"
            >
              <Star size={16} color="#111" />
              <Text style={styles.actionText} numberOfLines={1} ellipsizeMode="tail">
                Review
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {}}
              style={[styles.actionBtn, styles.actionBtnGrow]}
              accessibilityRole="button"
              accessibilityLabel="Directions"
            >
              <Navigation size={16} color="#111" />
              <Text style={styles.actionText} numberOfLines={1} ellipsizeMode="tail">
                Directions
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleBookmarkPress}
              style={[styles.actionBtn, styles.actionBtnGrow, isBookmarked && styles.actionBtnBookmarked]}
              accessibilityRole="button"
              accessibilityLabel={isBookmarked ? 'Bookmarked' : 'Bookmark'}
            >
              <Bookmark
                size={16}
                color={isBookmarked ? '#111827' : '#111'}
                fill={isBookmarked ? '#111827' : 'none'}
              />
              <Text
                style={[styles.actionText, isBookmarked && styles.actionTextBookmarked]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Reviews */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <View style={styles.hr} />
            <View style={{ gap: 12 }}>
              {reviews.length === 0 ? (
                <Text style={styles.bodyText}>No reviews yet. Be the first!</Text>
              ) : (
                reviews.map((r) => (
                  <View key={r.id} style={styles.reviewCard}>
                    <View style={styles.reviewTop}>
                      <Text style={styles.reviewAuthor}>{r.friendName || r.author}</Text>
                      <View style={styles.reviewStars}>
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} size={12} color="#FACC15" fill="#FACC15" />
                        ))}
                      </View>
                    </View>
                    <Text style={styles.reviewComment}>{r.comment}</Text>
                    {!!r.createdAt && (
                      <Text style={styles.reviewDate}>
                        {new Date(r.createdAt).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                ))
              )}
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <View style={styles.hr} />
            <Text style={styles.bodyText}>{event.description}</Text>
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.hr} />
            <Text style={styles.bodyText}>
              {event.address}
              {"\n"}
              {event.city}, {event.state}
            </Text>
            <Text style={styles.mutedSmall}>{event.distance} miles away</Text>
          </View>

          <View style={styles.divider} />

          {/* Pricing */}
          {showPrice && (
            <View style={styles.priceRow}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <DollarSign size={24} color="#111" />
                <View style={{ flexDirection: "row", marginLeft: 8, alignItems: "center" }}>
                  {renderPricePoints()}
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Book Now */}
      {showBookButton && (
        <View style={styles.bookWrap} pointerEvents="box-none">
          <TouchableOpacity
            onPress={handleBookClick}
            style={[styles.bookBtn, booking && { opacity: 0.6 }]}
            activeOpacity={0.9}
            disabled={booking}
            accessibilityRole="button"
            accessibilityLabel={isExternalEvent ? 'Get Tickets' : 'Book Now'}
          >
            <Text style={styles.bookText}>
              {booking ? 'Booking...' : isExternalEvent ? 'Get Tickets' : 'Book Now'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleReportLink} style={styles.reportLinkBtn}>
            <Text style={styles.reportLinkText}>Report link not working</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const HERO_H = 240;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  scroll: { flex: 1, backgroundColor: "#fff" },

  hero: {
    height: HERO_H,
    width: "100%",
    backgroundColor: "rgba(217,217,217,0.66)",
    overflow: "hidden",
  },
  heroImage: { width: SCREEN_W, height: HERO_H },
  heroPlaceholder: {
    width: SCREEN_W,
    height: HERO_H,
    backgroundColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  heroPlaceholderText: {
    fontSize: 40,
    fontWeight: "800",
    color: "#374151",
  },

  indicators: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: { height: 6, borderRadius: 999 },
  dotActive: { width: 24, backgroundColor: "#fff" },
  dotInactive: { width: 6, backgroundColor: "rgba(255,255,255,0.5)" },

  backBtn: {
    position: "absolute",
    left: 18,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  content: { paddingHorizontal: 26, paddingTop: 24 },

  titleRow: { flexDirection: "row", alignItems: "baseline", gap: 12, marginBottom: 12 },
  title: { fontSize: 20, fontWeight: "700", color: "#111" },
  date: { fontSize: 14, fontWeight: "600", color: "#6B7280" },

  metaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  locationText: { fontSize: 14, color: "#111", opacity: 0.5 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  ratingText: { fontSize: 14, fontWeight: "700", color: "#111" },
  reviewCount: { fontSize: 12, color: "#4B5563" },

  actionsRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 24,
    alignItems: "stretch",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 10,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
  },
  /** Sizes to content; extra row width goes to Directions + Bookmark */
  actionBtnReview: {
    flexGrow: 0,
    flexShrink: 0,
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 10,
    minWidth: 56,
  },
  actionBtnGrow: {
    flex: 1,
    minWidth: 0,
  },
  actionText: { flexShrink: 1, fontSize: 14, fontWeight: "600", color: "#111" },
  actionBtnBookmarked: {
    backgroundColor: "#E5E7EB",
    borderWidth: 1,
    borderColor: "#9CA3AF",
  },
  actionTextBookmarked: { color: "#111827", fontWeight: "700" },

  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111", marginBottom: 10 },
  hr: { height: 1, backgroundColor: "#111", marginBottom: 12 },

  reviewCard: { backgroundColor: "#F3F4F6", borderRadius: 2, padding: 14 },
  reviewTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  reviewAuthor: { fontSize: 14, fontWeight: "700", color: "#111" },
  reviewStars: { flexDirection: "row", gap: 2 },
  reviewComment: { fontSize: 13, color: "#374151", marginBottom: 6 },
  reviewDate: { fontSize: 11, color: "#6B7280" },

  bodyText: { fontSize: 14, color: "#374151", lineHeight: 20 },
  mutedSmall: { fontSize: 13, color: "#6B7280", marginTop: 6 },

  divider: { height: 1, backgroundColor: "#111", opacity: 0.15, marginVertical: 18 },

  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  dollar: { fontSize: 20, fontWeight: "700" },
  dollarOn: { color: "#111" },
  dollarOff: { color: "#D1D5DB" },

  bookWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 30,
    paddingHorizontal: 26,
    alignItems: "center",
  },
  bookBtn: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#0284C7",
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  bookText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  reportLinkBtn: {
    marginTop: 8,
    alignItems: "center",
  },
  reportLinkText: {
    fontSize: 12,
    color: "#6B7280",
    textDecorationLine: "underline",
  },

  // Gallery styles
  galleryRoot: { flex: 1 },
  galleryTopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  iconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  galleryTitle: {
    position: "absolute",
    left: "50%",
    transform: [{ translateX: -SCREEN_W * 0.25 }], // approximate centering w/out measuring
    width: SCREEN_W * 0.5,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
  },
  galleryBody: { flex: 1, justifyContent: "center" },
  galleryNavBtn: {
    position: "absolute",
    top: "50%",
    marginTop: -24,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  counterPill: {
    position: "absolute",
    top: 16,
    left: "50%",
    transform: [{ translateX: -50 }],
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    zIndex: 10,
  },
  counterText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  gallerySlide: { width: SCREEN_W, height: SCREEN_H * 0.7, alignItems: "center", justifyContent: "center" },
  galleryImage: { width: SCREEN_W, height: SCREEN_H * 0.7 },
  galleryBottom: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 18 },
  userRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#4B5563", fontSize: 14, fontWeight: "700" },
  userName: { fontSize: 15, fontWeight: "700", color: "#111" },
  userSub: { fontSize: 13, color: "#4B5563", marginTop: 2 },
});

export default EventDetailScreen;