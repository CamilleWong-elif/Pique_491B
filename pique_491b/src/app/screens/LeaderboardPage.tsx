// LeaderboardScreen.tsx
import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
  Platform,
  StatusBar,
} from "react-native";
import { ArrowLeft } from "lucide-react-native";

// Replace these imports with your RN data sources
// import { mockFriendRatedEvents } from "../data/friendRatedEvents";
// import { mockEvents } from "../data/mockData";
// import { BottomNavigation } from "../components/BottomNavigation";

type NavOptions = { friendName?: string };

type Event = {
  id: string;
  name: string;
};

type FriendRatedEvent = {
  id: string;
  eventId: string;
  eventName: string;
  rating: number; // 0..5
  timestamp: Date;
  friendName: string;
  friendAvatar: string; // uri
  reviewText?: string;
};

// ---- Props ----
type Props = {
  onNavigate: (page: string, eventId?: string, options?: NavOptions) => void;
  onOpenMessages?: () => void;
  unreadMessageCount?: number;

  // pass these in or import them
  mockFriendRatedEvents: FriendRatedEvent[];
  mockEvents: Event[];
  BottomNavigation: React.ComponentType<{
    currentPage: string;
    onNavigate: Props["onNavigate"];
    onOpenMessages: () => void;
    unreadMessageCount?: number;
  }>;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function mixHex(a: string, b: string, t: number) {
  // simple hex color interpolation, t in [0,1]
  const ah = a.replace("#", "");
  const bh = b.replace("#", "");
  const ar = parseInt(ah.slice(0, 2), 16);
  const ag = parseInt(ah.slice(2, 4), 16);
  const ab = parseInt(ah.slice(4, 6), 16);
  const br = parseInt(bh.slice(0, 2), 16);
  const bg = parseInt(bh.slice(2, 4), 16);
  const bb = parseInt(bh.slice(4, 6), 16);
  const rr = Math.round(ar + (br - ar) * t);
  const rg = Math.round(ag + (bg - ag) * t);
  const rb = Math.round(ab + (bb - ab) * t);
  return `#${rr.toString(16).padStart(2, "0")}${rg
    .toString(16)
    .padStart(2, "0")}${rb.toString(16).padStart(2, "0")}`;
}

/**
 * RN-friendly version of your Tailwind color logic:
 * - rating >= 4 : green scale (4 faint → 5 strong)
 * - rating >= 2 : yellow
 * - rating < 2  : red scale (0 strong → 2 faint)
 */
function getRatingColors(rating: number) {
  if (rating >= 4) {
    const t = clamp((rating - 4) / 1, 0, 1);
    return {
      bg: mixHex("#ECFDF5", "#DCFCE7", t), // green-50 → green-100
      border: mixHex("#86EFAC", "#22C55E", t), // green-300 → green-500
      text: mixHex("#16A34A", "#166534", t), // green-600 → green-800
    };
  }
  if (rating >= 2) {
    return {
      bg: "#FEF9C3", // yellow-100
      border: "#FACC15", // yellow-400-ish
      text: "#A16207", // yellow-700-ish
    };
  }
  // rating < 2 (0 strong red → 2 faint red)
  const t = clamp(rating / 2, 0, 1); // 0..1
  return {
    bg: mixHex("#FEE2E2", "#FEF2F2", t), // red-100 → red-50
    border: mixHex("#EF4444", "#FCA5A5", t), // red-500 → red-300 (fainter)
    text: mixHex("#991B1B", "#B91C1C", t), // red-800 → red-700
  };
}

export function LeaderboardScreen({
  onNavigate,
  onOpenMessages,
  unreadMessageCount,
  mockFriendRatedEvents,
  mockEvents,
  BottomNavigation,
}: Props) {
  const sortedEvents = useMemo(() => {
    return [...mockFriendRatedEvents].sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }, [mockFriendRatedEvents]);

  const handleEventPress = (eventId: string) => onNavigate("event", eventId);

  const topPad = Platform.OS === "android" ? (StatusBar.currentHeight || 0) : 0;

  const renderItem = ({ item }: { item: FriendRatedEvent }) => {
    const event = mockEvents.find((e) => e.id === item.eventId);
    if (!event) return null;

    const colors = getRatingColors(item.rating);

    return (
      <View style={styles.row}>
        <View style={styles.left}>
          {/* Friend Avatar */}
          <TouchableOpacity
            onPress={() => onNavigate("friendProfile", undefined, { friendName: item.friendName })}
            style={styles.avatarWrap}
            accessibilityRole="button"
            accessibilityLabel={`Open ${item.friendName}'s profile`}
          >
            {item.friendAvatar ? (
              <Image source={{ uri: item.friendAvatar }} style={styles.avatarImg} />
            ) : (
              <View style={[styles.avatarImg, { backgroundColor: '#d1d5db' }]} />
            )}
          </TouchableOpacity>

          {/* Event Info */}
          <TouchableOpacity
            onPress={() => handleEventPress(item.eventId)}
            style={styles.info}
            accessibilityRole="button"
            accessibilityLabel={`Open event ${item.eventName}`}
          >
            <Text style={styles.titleLine} numberOfLines={1}>
              <Text
                style={styles.friendLink}
                onPress={() => onNavigate("friendProfile", undefined, { friendName: item.friendName })}
              >
                {item.friendName}
              </Text>
              <Text> rated </Text>
              <Text style={styles.eventLink}>{item.eventName}</Text>
            </Text>

            {!!item.reviewText && (
              <Text style={styles.review} numberOfLines={1}>
                {item.reviewText}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Rating Bubble */}
        <TouchableOpacity
          onPress={() => handleEventPress(item.eventId)}
          style={[
            styles.ratingBubble,
            { backgroundColor: colors.bg, borderColor: colors.border },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Rating ${item.rating.toFixed(1)}`}
        >
          <Text style={[styles.ratingText, { color: colors.text }]}>
            {item.rating.toFixed(1)}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: 12 + topPad }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => onNavigate("home")}
            style={styles.back}
            accessibilityRole="button"
            accessibilityLabel="Back to home"
          >
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Leaderboard</Text>
        </View>
        <Text style={styles.headerSub}>
          Events your friends have attended and rated
        </Text>
      </View>

      {/* List */}
      <FlatList
        data={sortedEvents}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingBottom: 120, // space for bottom nav
        }}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No rated events yet</Text>
            <Text style={styles.emptySub}>
              Check back when your friends rate events!
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Nav */}
      <BottomNavigation
        currentPage="leaderboard"
        onNavigate={onNavigate}
        onOpenMessages={onOpenMessages || (() => {})}
        unreadMessageCount={unreadMessageCount}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },

  header: {
    paddingHorizontal: 18,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTop: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  back: { marginRight: 10, padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: "900", color: "#111" },
  headerSub: { fontSize: 13, color: "#4B5563" },

  sep: { height: 1, backgroundColor: "#E5E7EB" },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    justifyContent: "space-between",
  },
  left: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },

  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  avatarImg: { width: "100%", height: "100%" },

  info: { flex: 1, paddingRight: 10 },
  titleLine: { fontSize: 13, fontWeight: "700", color: "#111" },
  friendLink: { textDecorationLine: "underline", color: "#111" },
  eventLink: { textDecorationLine: "underline", color: "#111" },

  review: { marginTop: 3, fontSize: 12, color: "#6B7280" },

  ratingBubble: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  ratingText: { fontSize: 16, fontWeight: "900" },

  empty: { paddingVertical: 48, alignItems: "center", paddingHorizontal: 18 },
  emptyTitle: { color: "#6B7280", fontSize: 14, fontWeight: "700" },
  emptySub: { marginTop: 6, color: "#9CA3AF", fontSize: 13, textAlign: "center" },
});

export default LeaderboardScreen;