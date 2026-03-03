// FriendProfileScreen.tsx
//Mock Data at 100-111, 126-153
import React, { useMemo, useState, useEffect } from "react";
import {collection, doc, getDoc} from "firebase/firestore"
import {auth, db} from "@/firebase";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  Pressable,
  Platform,
  StatusBar,
} from "react-native";
import { FileText, Heart, Calendar, X, ArrowLeft } from "lucide-react-native";

/**
 * Notes:
 * - This is a React Native conversion of your FriendProfilePage.
 * - I kept your navigation contract (onNavigate(page, eventId?, options?)).
 * - The "select" sorting UI is converted to simple inline toggle buttons for RN (no web <select>).
 *   If you want a dropdown, tell me if you're using Expo (ActionSheet) or a library (react-native-picker/picker).
 */

// ---- Types (adjust to your app) ----
export type Event = {
  id: string;
  name: string;
  rating: number;
  imageUrl?: string;
  city?: string;
  state?: string;
  // any other fields your EventCard needs
};

type NavOptions = {
  showPrice?: boolean;
  activeTab?: "posted" | "liked" | "booked";
  friendName?: string;
};

type UserRow = {
  id: string;
  name: string;
  username: string;
  bio: string;
  avatar: string; // uri
};

type Props = {
  friendName: string;
  onNavigate: (page: string, eventId?: string, options?: NavOptions) => void;
  onBack: () => void;
  onOpenMessages?: () => void;
  unreadMessageCount?: number;

  // Pass these in OR replace with your imports
  mockEvents: Event[];
  getAvatarWithFallback: (name: string) => string;

  BottomNavigation: React.ComponentType<{
    currentPage: string;
    onNavigate: Props["onNavigate"];
    onOpenMessages: () => void;
    unreadMessageCount?: number;
  }>;

  // Replace with your RN EventCard component
  EventCard: React.ComponentType<{
    event: Event;
    onPress: () => void;
  }>;
};

type TabKey = "posted" | "liked" | "booked";
type SortKey = "latest" | "oldest" | "name-asc" | "name-desc" | "rating";

export function FriendProfileScreen({
  friendName,
  onNavigate,
  onBack,
  onOpenMessages,
  unreadMessageCount,
  mockEvents,
  getAvatarWithFallback,
  BottomNavigation,
  EventCard,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("posted");
  const [sortOption, setSortOption] = useState<SortKey>("latest");
  const [likedSortOption, setLikedSortOption] = useState<SortKey>("latest");
  const [bookedSortOption, setBookedSortOption] = useState<SortKey>("latest");
  const [showFollowModal, setShowFollowModal] = useState<"followers" | "following" | null>(null);
  const [isFollowing, setIsFollowing] = useState<boolean>(Math.random() > 0.5);

  const [friendData, setFriendData] = useState({
    id: friendName,
    name: "",
    bio: "",
    avatar: getAvatarWithFallback(friendName),
    followerCount: 0,
    followingCount: 0,
  });

  useEffect(() => {
    const fetchFriendData = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", friendName));
        const userData = userDoc.data();
        
        const bios = [
          "Event enthusiast | Foodie | Explorer 🌟",
          "Adventure seeker 🏔️ | Coffee lover ☕",
          "Music lover 🎵 | Travel addict ✈️",
          "Fitness junkie 💪 | Nature lover 🌲",
          "Art enthusiast 🎨 | Photographer 📸",
          "Bookworm 📚 | Movie buff 🎬",
          "Foodie explorer 🍜 | Chef wannabe 👨‍🍳",
          "Party animal 🎉 | Social butterfly 🦋",
          "Yoga instructor 🧘 | Wellness advocate 💚",
          "Gamer 🎮 | Tech geek 💻",
        ];
        const hash = friendName.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

        setFriendData({
          id: userData?.id || friendName, 
          name: userData?.displayName || "",
          bio: userData?.bio || bios[hash % bios.length],
          avatar: userData?.avatar || getAvatarWithFallback(friendName),
          followerCount: Math.floor(Math.random() * 100) + 1,
          followingCount: Math.floor(Math.random() * 100) + 1,
        });
      } catch (error) {
        console.error("Error fetching friend data:", error);
      }
    };

    fetchFriendData();
  }, [friendName, getAvatarWithFallback]);

  const mockFollowers = useMemo<UserRow[]>(() => {
    const names = [
      "Sarah Chen",
      "Marcus Johnson",
      "Emily Davis",
      "Jordan Lee",
      "Taylor Brown",
      "Casey Wilson",
      "Morgan Taylor",
      "Riley Martinez",
      "Quinn Anderson",
      "Avery Thomas",
      "Jamie Garcia",
      "Drew Rodriguez",
      "Skyler White",
      "Cameron Harris",
      "Dakota Moore",
    ];
    const bios = [
      "Photography lover 📸",
      "Adventure seeker 🏔️",
      "Music enthusiast 🎵",
      "Fitness junkie 💪",
      "Coffee addict ☕",
      "Travel blogger ✈️",
      "Foodie explorer 🍜",
      "Art collector 🎨",
      "Book worm 📚",
      "Nature lover 🌲",
    ];

    return Array.from({ length: friendData.followerCount }, (_, i) => {
      const nm = names[i % names.length];
      return {
        id: `follower-${i}`,
        name: nm,
        username: `@${nm.toLowerCase().replace(" ", "_")}${i > names.length - 1 ? i : ""}`,
        bio: bios[i % bios.length],
        avatar: `https://i.pravatar.cc/150?img=${(i % 70) + 1}`,
      };
    });
  }, [friendData.followerCount]);

  const mockFollowing = useMemo<UserRow[]>(() => {
    const names = [
      "Alex Kim",
      "Sam Patel",
      "Jordan Cruz",
      "Blake Foster",
      "River Adams",
      "Phoenix Wright",
      "Sage Mitchell",
      "Kai Roberts",
      "Rowan Clark",
      "Ember Scott",
      "Ocean Lewis",
      "Storm Walker",
      "Luna Baker",
      "Nova Green",
      "Ash Cooper",
    ];
    const bios = [
      "Event planner 🎉",
      "Digital nomad 💻",
      "Yoga instructor 🧘",
      "Chef & baker 👨‍🍳",
      "Marathon runner 🏃",
      "DJ & producer 🎧",
      "Photographer 📷",
      "Writer ✍️",
      "Gamer 🎮",
      "Dancer 💃",
    ];

    return Array.from({ length: friendData.followingCount }, (_, i) => {
      const nm = names[i % names.length];
      return {
        id: `following-${i}`,
        name: nm,
        username: `@${nm.toLowerCase().replace(" ", "_")}${i > names.length - 1 ? i : ""}`,
        bio: bios[i % bios.length],
        avatar: `https://i.pravatar.cc/150?img=${((i + 30) % 70) + 1}`,
      };
    });
  }, [friendData.followingCount]);

  // Mock events (same as your web sample)
  const postedEventsRaw = useMemo(() => {
    const safe = (idx: number) => mockEvents[idx] || mockEvents[0];
    return [
      { ...safe(1), datePosted: new Date("2025-01-25") },
      { ...safe(4), datePosted: new Date("2025-01-20") },
      { ...safe(2), datePosted: new Date("2025-01-27") },
    ];
  }, [mockEvents]);

  const likedEventsRaw = useMemo(() => {
    const safe = (idx: number) => mockEvents[idx] || mockEvents[0];
    return [
      { ...safe(0), dateLiked: new Date("2025-01-26") },
      { ...safe(3), dateLiked: new Date("2025-01-22") },
      { ...safe(5), dateLiked: new Date("2025-01-24") },
    ];
  }, [mockEvents]);

  const bookedEventsRaw = useMemo(() => {
    const safe = (idx: number) => mockEvents[idx] || mockEvents[0];
    return [
      { ...safe(2), dateBooked: new Date("2025-01-23") },
      { ...safe(1), dateBooked: new Date("2025-01-21") },
      { ...safe(4), dateBooked: new Date("2025-01-25") },
    ];
  }, [mockEvents]);

  const sortEvents = (events: any[], sortBy: SortKey) => {
    const sorted = [...events];
    switch (sortBy) {
      case "latest":
        return sorted.sort((a, b) => {
          const dateA = a.datePosted || a.dateLiked || a.dateBooked;
          const dateB = b.datePosted || b.dateLiked || b.dateBooked;
          return dateB.getTime() - dateA.getTime();
        });
      case "oldest":
        return sorted.sort((a, b) => {
          const dateA = a.datePosted || a.dateLiked || a.dateBooked;
          const dateB = b.datePosted || b.dateLiked || b.dateBooked;
          return dateA.getTime() - dateB.getTime();
        });
      case "name-asc":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case "rating":
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default:
        return sorted;
    }
  };

  const postedEvents = useMemo(
    () => sortEvents(postedEventsRaw, sortOption),
    [postedEventsRaw, sortOption]
  );
  const likedEvents = useMemo(
    () => sortEvents(likedEventsRaw, likedSortOption),
    [likedEventsRaw, likedSortOption]
  );
  const bookedEvents = useMemo(
    () => sortEvents(bookedEventsRaw, bookedSortOption),
    [bookedEventsRaw, bookedSortOption]
  );

  const listData = activeTab === "posted" ? postedEvents : activeTab === "liked" ? likedEvents : bookedEvents;
  const currentSort = activeTab === "posted" ? sortOption : activeTab === "liked" ? likedSortOption : bookedSortOption;

  const setCurrentSort = (v: SortKey) => {
    if (activeTab === "posted") setSortOption(v);
    else if (activeTab === "liked") setLikedSortOption(v);
    else setBookedSortOption(v);
  };

  const topPad = Platform.OS === "android" ? (StatusBar.currentHeight || 0) : 0;

  return (
    <SafeAreaView style={styles.root}>
      {/* Header Background */}
      <View style={[styles.headerBg, { paddingTop: 12 + topPad }]} />

      {/* Back Button */}
      <TouchableOpacity
        onPress={onBack}
        style={[styles.backBtn, { top: 12 + topPad }]}
        accessibilityRole="button"
        accessibilityLabel="Back"
      >
        <ArrowLeft size={20} color="#374151" />
      </TouchableOpacity>

      {/* Main content (FlatList so grid scrolls nicely) */}
      <FlatList
        data={listData}
        keyExtractor={(item: any) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrap}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Profile */}
            <View style={styles.profileWrap}>
              <View style={styles.avatarRing}>
                <Image source={{ uri: friendData.avatar }} style={styles.avatar} />
              </View>

              <View style={styles.profileRight}>
                <Text style={styles.name}>{friendData.name}</Text>
                <Text style={styles.bio}>{friendData.bio}</Text>

                <View style={styles.statsRow}>
                  <TouchableOpacity
                    onPress={() => setShowFollowModal("followers")}
                    accessibilityRole="button"
                    accessibilityLabel="View followers"
                  >
                    <Text style={styles.stat}>
                      <Text style={styles.statNum}>{friendData.followerCount}</Text>
                      <Text style={styles.statLabel}> Followers</Text>
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setShowFollowModal("following")}
                    accessibilityRole="button"
                    accessibilityLabel="View following"
                  >
                    <Text style={styles.stat}>
                      <Text style={styles.statNum}>{friendData.followingCount}</Text>
                      <Text style={styles.statLabel}> Following</Text>
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Follow / Message */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                onPress={() => setIsFollowing((v) => !v)}
                style={[styles.actionBtn, isFollowing ? styles.followingBtn : styles.followBtn]}
                activeOpacity={0.9}
                accessibilityRole="button"
                accessibilityLabel={isFollowing ? "Unfollow" : "Follow"}
              >
                <Text style={[styles.actionText, isFollowing ? styles.followingText : styles.followText]}>
                  {isFollowing ? "Following" : "Follow"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onOpenMessages}
                style={[styles.actionBtn, styles.messageBtn]}
                activeOpacity={0.9}
                accessibilityRole="button"
                accessibilityLabel="Message"
              >
                <Text style={[styles.actionText, styles.messageText]}>Message</Text>
              </TouchableOpacity>
            </View>

            {/* Tab Buttons */}
            <View style={styles.tabsRow}>
              <TouchableOpacity
                onPress={() => setActiveTab("posted")}
                style={[styles.tabBtn, activeTab === "posted" ? styles.tabOn : styles.tabOff]}
                accessibilityRole="button"
                accessibilityLabel="Posted events"
              >
                <FileText size={20} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab("liked")}
                style={[styles.tabBtn, activeTab === "liked" ? styles.tabOn : styles.tabOff]}
                accessibilityRole="button"
                accessibilityLabel="Liked events"
              >
                <Heart size={20} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab("booked")}
                style={[styles.tabBtn, activeTab === "booked" ? styles.tabOn : styles.tabOff]}
                accessibilityRole="button"
                accessibilityLabel="Booked events"
              >
                <Calendar size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Section Header + "Sort" */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {activeTab === "posted" ? "Events Posted" : activeTab === "liked" ? "Liked Events" : "Booked Events"}
              </Text>

              {/* RN replacement for <select>: quick chips */}
              <View style={styles.sortChips}>
                {(
                  [
                    ["latest", "Latest"],
                    ["oldest", "Oldest"],
                    ["name-asc", "A–Z"],
                    ["name-desc", "Z–A"],
                    ["rating", "Rating"],
                  ] as [SortKey, string][]
                ).map(([key, label]) => {
                  const on = currentSort === key;
                  return (
                    <TouchableOpacity
                      key={key}
                      onPress={() => setCurrentSort(key)}
                      style={[styles.chip, on ? styles.chipOn : styles.chipOff]}
                      accessibilityRole="button"
                      accessibilityLabel={`Sort by ${label}`}
                    >
                      <Text style={[styles.chipText, on ? styles.chipTextOn : styles.chipTextOff]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        }
        renderItem={({ item }: any) => (
          <View style={styles.cardCell}>
            <EventCard
              event={item}
              onPress={() =>
                onNavigate("event", item.id, {
                  showPrice: activeTab === "booked",
                  activeTab,
                  friendName: friendData.name,
                })
              }
            />
          </View>
        )}
        ListFooterComponent={<View style={{ height: 120 }} />}
      />

      {/* Bottom Nav */}
      <BottomNavigation
        currentPage="profile"
        onNavigate={onNavigate}
        onOpenMessages={onOpenMessages || (() => {})}
        unreadMessageCount={unreadMessageCount}
      />

      {/* Followers/Following Modal */}
      <Modal visible={!!showFollowModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowFollowModal(null)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {showFollowModal === "followers" ? "Followers" : "Following"}
              </Text>
              <TouchableOpacity
                onPress={() => setShowFollowModal(null)}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <X size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* List */}
            <FlatList
              data={showFollowModal === "followers" ? mockFollowers : mockFollowing}
              keyExtractor={(u) => u.id}
              renderItem={({ item: user }) => (
                <View style={styles.userRow}>
                  <TouchableOpacity
                    style={styles.userAvatarWrap}
                    onPress={() => {
                      setShowFollowModal(null);
                      onNavigate("friendProfile", undefined, { friendName: user.name });
                    }}
                  >
                    <Image source={{ uri: user.avatar }} style={styles.userAvatar} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.userInfo}
                    onPress={() => {
                      setShowFollowModal(null);
                      onNavigate("friendProfile", undefined, { friendName: user.name });
                    }}
                  >
                    <Text style={styles.userName} numberOfLines={1}>
                      {user.name}
                    </Text>
                    <Text style={styles.userMeta} numberOfLines={1}>
                      {user.username}
                    </Text>
                    <Text style={styles.userMeta2} numberOfLines={1}>
                      {user.bio}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.followSmallBtn,
                      showFollowModal === "followers" ? styles.followSmallOn : styles.followSmallOff,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={showFollowModal === "followers" ? "Follow" : "Following"}
                  >
                    <Text style={showFollowModal === "followers" ? styles.followSmallTextOn : styles.followSmallTextOff}>
                      {showFollowModal === "followers" ? "Follow" : "Following"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              ItemSeparatorComponent={() => <View style={styles.userSep} />}
              showsVerticalScrollIndicator={false}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },

  headerBg: { backgroundColor: "#D1D5DB", height: 110, width: "100%" },

  backBtn: {
    position: "absolute",
    left: 16,
    zIndex: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  listContent: { paddingHorizontal: 26, paddingBottom: 0 },
  columnWrap: { justifyContent: "space-between" },
  cardCell: { flex: 1, paddingBottom: 16 },

  profileWrap: { flexDirection: "row", gap: 14, marginTop: -48, marginBottom: 10 },
  avatarRing: {
    width: 103,
    height: 102,
    borderRadius: 51,
    backgroundColor: "#D1D5DB",
    borderWidth: 4,
    borderColor: "#fff",
    overflow: "hidden",
  },
  avatar: { width: "100%", height: "100%" },

  profileRight: { flex: 1, paddingTop: 44 },
  name: { fontSize: 18, fontWeight: "900", color: "#111", marginBottom: 4 },
  bio: { fontSize: 12, color: "#4B5563", marginBottom: 10 },

  statsRow: { flexDirection: "row", gap: 18 },
  stat: { fontSize: 13, color: "#111" },
  statNum: { fontWeight: "900" },
  statLabel: { color: "#4B5563" },

  actionRow: { flexDirection: "row", gap: 12, marginBottom: 14 },
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  actionText: { fontSize: 14, fontWeight: "800" },
  followBtn: { backgroundColor: "#0EA5E9" },
  followText: { color: "#fff" },
  followingBtn: { backgroundColor: "#E5E7EB" },
  followingText: { color: "#374151" },
  messageBtn: { backgroundColor: "#E5E7EB" },
  messageText: { color: "#374151" },

  tabsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 28,
    marginBottom: 14,
    borderTopWidth: 2,
    borderTopColor: "#111",
    paddingTop: 14,
  },
  tabBtn: { width: 42, height: 42, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  tabOn: { backgroundColor: "#3B82F6" },
  tabOff: { backgroundColor: "#D1D5DB" },

  sectionHeader: { marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#111", marginBottom: 10 },

  sortChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  chipOn: { backgroundColor: "#DBEAFE", borderColor: "#3B82F6" },
  chipOff: { backgroundColor: "#fff", borderColor: "#D1D5DB" },
  chipText: { fontSize: 12, fontWeight: "800" },
  chipTextOn: { color: "#1D4ED8" },
  chipTextOff: { color: "#374151" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
  modalCard: { width: 380, maxHeight: 600, backgroundColor: "#fff", borderRadius: 20, overflow: "hidden" },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: { fontSize: 18, fontWeight: "900", color: "#111" },

  userRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 18, paddingVertical: 14 },
  userAvatarWrap: { width: 48, height: 48, borderRadius: 24, overflow: "hidden" },
  userAvatar: { width: "100%", height: "100%" },

  userInfo: { flex: 1, minWidth: 0 },
  userName: { fontSize: 14, fontWeight: "800", color: "#111" },
  userMeta: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  userMeta2: { fontSize: 12, color: "#4B5563", marginTop: 2 },

  followSmallBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  followSmallOn: { backgroundColor: "#0EA5E9" },
  followSmallOff: { backgroundColor: "#E5E7EB" },
  followSmallTextOn: { color: "#fff", fontSize: 12, fontWeight: "800" },
  followSmallTextOff: { color: "#374151", fontSize: 12, fontWeight: "800" },

  userSep: { height: 1, backgroundColor: "#F3F4F6" },
});