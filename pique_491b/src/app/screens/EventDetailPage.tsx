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
  SafeAreaView,
  Image,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StatusBar,
} from "react-native";
import {
  ArrowLeft,
  Star,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Navigation,
  Bookmark,
} from "lucide-react-native";

// ----- Types (adjust to your app) -----
export type UserImage = { url: string; userName: string };

export type Event = {
  id: string;
  name: string;
  imageUrl: string;
  userImages?: UserImage[];
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
  event: Event;
  onBack: () => void;
  showPrice?: boolean;
  onNavigate?: (page: string, eventId?: string) => void;
  activeTab?: "posted" | "liked" | "booked";
};

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

export function EventDetailScreen({
  event,
  onBack,
  showPrice = true,
  onNavigate,
  activeTab,
}: Props) {
  const allImages = useMemo(
    () => [{ url: event.imageUrl, userName: "Event Creator" }, ...(event.userImages || [])],
    [event.imageUrl, event.userImages]
  );

  const [currentSlide, setCurrentSlide] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [whiteBackdrop, setWhiteBackdrop] = useState(true);

  const heroPagerRef = useRef<FlatList<{ url: string; userName: string }>>(null);
  const galleryPagerRef = useRef<FlatList<{ url: string; userName: string }>>(null);

  const formatDate = () => {
    if (!event.startDate) return "";
    if (event.endDate) return `${event.startDate} - ${event.endDate}`;
    return event.startDate;
  };

  // Auto-advance hero slideshow every 5 seconds (when multiple images & gallery not open)
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

  const openGallery = (index: number) => {
    setCurrentImageIndex(index);
    setGalleryOpen(true);
    // wait a tick so FlatList has layout
    requestAnimationFrame(() => {
      galleryPagerRef.current?.scrollToIndex({ index, animated: false });
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

  const reviews = [
    { id: 1, author: "Sarah M.", rating: 5, comment: "Amazing experience! The staff was friendly and the facility was clean.", date: "2 days ago" },
    { id: 2, author: "Mike R.", rating: 4, comment: "Great place, would definitely recommend to friends.", date: "1 week ago" },
    { id: 3, author: "Emma L.", rating: 5, comment: "Had such a fun time! Perfect for a weekend activity.", date: "2 weeks ago" },
    { id: 4, author: "John D.", rating: 4, comment: "Really enjoyed it. Will come back again!", date: "3 weeks ago" },
  ];

  const handleBookClick = () => onNavigate?.("payment", event.id);

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
            {!whiteBackdrop && (
              <View style={styles.counterPill}>
                <Text style={styles.counterText}>
                  {currentImageIndex + 1} / {allImages.length}
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
                  <Image
                    source={{ uri: item.url }}
                    resizeMode="contain"
                    style={styles.galleryImage}
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
          {whiteBackdrop && (
            <View style={styles.galleryBottom}>
              <View style={styles.userRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials(allImages[currentImageIndex].userName)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>{allImages[currentImageIndex].userName}</Text>
                  <Text style={styles.userSub}>Posted to {event.name}</Text>
                </View>
              </View>
            </View>
          )}
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
                <Image source={{ uri: item.url }} style={styles.heroImage} resizeMode="cover" />
              )}
              getItemLayout={(_, index) => ({
                length: SCREEN_W,
                offset: SCREEN_W * index,
                index,
              })}
            />
          </Pressable>

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
              style={styles.actionBtn}
              accessibilityRole="button"
              accessibilityLabel="Review"
            >
              <Star size={16} color="#111" />
              <Text style={styles.actionText}>Review</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {}}
              style={styles.actionBtn}
              accessibilityRole="button"
              accessibilityLabel="Directions"
            >
              <Navigation size={16} color="#111" />
              <Text style={styles.actionText}>Directions</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {}}
              style={styles.actionBtn}
              accessibilityRole="button"
              accessibilityLabel="Bookmark"
            >
              <Bookmark size={16} color="#111" />
              <Text style={styles.actionText}>Bookmark</Text>
            </TouchableOpacity>
          </View>

          {/* Reviews */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <View style={styles.hr} />
            <View style={{ gap: 12 }}>
              {reviews.map((r) => (
                <View key={r.id} style={styles.reviewCard}>
                  <View style={styles.reviewTop}>
                    <Text style={styles.reviewAuthor}>{r.author}</Text>
                    <View style={styles.reviewStars}>
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} size={12} color="#FACC15" fill="#FACC15" />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewComment}>{r.comment}</Text>
                  <Text style={styles.reviewDate}>{r.date}</Text>
                </View>
              ))}
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
            style={styles.bookBtn}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel="Book Now"
          >
            <Text style={styles.bookText}>Book Now</Text>
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

  actionsRow: { flexDirection: "row", gap: 8, marginBottom: 24, flexWrap: "wrap" },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
  },
  actionText: { fontSize: 14, fontWeight: "600", color: "#111" },

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