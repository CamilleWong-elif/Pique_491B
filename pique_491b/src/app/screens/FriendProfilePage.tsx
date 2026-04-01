// FriendProfileScreen.tsx
//Mock Data at 100-111, 126-153
import React, { useMemo, useState, useEffect } from "react";
import { apiGetUser, apiFollowUser, apiUnfollowUser, apiGetFollowers, apiGetFollowing } from "@/api";
import { auth } from "@/firebase";
import { useAuth } from "@/context/AuthContext";
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
} from "react-native";
import { FileText, Heart, Calendar, X } from "lucide-react-native";

// ---- Types ----
export type Event = {
  id: string;
  name: string;
  rating: number;
  imageUrl?: string;
  city?: string;
  state?: string;
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
  avatar: string;
};

type Props = {
  friendName: string;
  onNavigate: (page: string, eventId?: string, options?: NavOptions) => void;
  onBack: () => void;
  onOpenMessages?: () => void;
  unreadMessageCount?: number;
  mockEvents: Event[];
  getAvatarWithFallback: (name: string) => string;
  BottomNavigation: React.ComponentType<{
    currentPage: string;
    onNavigate: Props["onNavigate"];
    onOpenMessages: () => void;
    unreadMessageCount?: number;
  }>;
  EventCard: React.ComponentType<{
    event: Event;
    onPress: () => void;
  }>;
};

type TabKey = "posted" | "liked" | "booked";
type SortKey = "latest" | "oldest" | "name-asc" | "name-desc" | "rating";

type FollowButtonState = {
  canFollow: boolean;
  isFollowing: boolean;
  isFollowedByFriend: boolean;
  label: "Follow" | "Following" | "Follow Back" | "You";
};

function getFollowButtonState(params: {
  currentUid: string;
  friendId: string;
  friendFollowerIds: string[];
  friendFollowingIds: string[];
  myFollowerIds: string[];
  myFollowingIds: string[];
}): FollowButtonState {
  const {
    currentUid,
    friendId,
    friendFollowerIds,
    friendFollowingIds,
    myFollowerIds,
    myFollowingIds,
  } = params;

  if (!currentUid || !friendId) {
    return { canFollow: false, isFollowing: false, isFollowedByFriend: false, label: "Follow" };
  }

  if (currentUid === friendId) {
    return { canFollow: false, isFollowing: false, isFollowedByFriend: false, label: "You" };
  }

  const isFollowingByFriendFollowers = friendFollowerIds.includes(currentUid);
  const isFollowingByMyFollowing = myFollowingIds.includes(friendId);
  const isFollowing = isFollowingByFriendFollowers || isFollowingByMyFollowing;

  const isFollowedByMyFollowers = myFollowerIds.includes(friendId);
  const isFollowedByFriendFollowing = friendFollowingIds.includes(currentUid);
  const isFollowedByFriend = isFollowedByMyFollowers || isFollowedByFriendFollowing;

  const label = isFollowing ? "Following" : isFollowedByFriend ? "Follow Back" : "Follow";

  return {
    canFollow: true,
    isFollowing,
    isFollowedByFriend,
    label,
  };
}

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
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("posted");
  const [sortOption, setSortOption] = useState<SortKey>("latest");
  const [likedSortOption, setLikedSortOption] = useState<SortKey>("latest");
  const [bookedSortOption, setBookedSortOption] = useState<SortKey>("latest");
  const [showFollowModal, setShowFollowModal] = useState<"followers" | "following" | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const currentUid = auth.currentUser?.uid ?? "";
  const [myFollowingIds, setMyFollowingIds] = useState<string[]>([]);
  const [myFollowerIds, setMyFollowerIds] = useState<string[]>([]);

  const [friendData, setFriendData] = useState({
    id: friendName,
    name: "",
    username: "",
    bio: "",
    avatar: getAvatarWithFallback(friendName),
    followerUids: [] as string[],
    followingUids: [] as string[],
  });

  const friendId = friendData.id || friendName;
  const followButtonState = getFollowButtonState({
    currentUid,
    friendId,
    friendFollowerIds: friendData.followerUids,
    friendFollowingIds: friendData.followingUids,
    myFollowerIds,
    myFollowingIds,
  });


  // true if the current user's UID is in the friend's followerCount array
  const isFollowing = followButtonState.isFollowing;

  const handleFollowToggle = async () => {
    if (!currentUid || !followButtonState.canFollow) return;
    try {
      if (followButtonState.isFollowing) {
        await apiUnfollowUser(friendId);
        setFriendData(prev => ({ ...prev, followerUids: prev.followerUids.filter(id => id !== currentUid) }));
        setMyFollowingIds(prev => prev.filter(id => id !== friendId));
      } else {
        await apiFollowUser(friendId);
        setFriendData(prev => ({
          ...prev,
          followerUids: prev.followerUids.includes(currentUid) ? prev.followerUids : [...prev.followerUids, currentUid],
        }));
        setMyFollowingIds(prev => (prev.includes(friendId) ? prev : [...prev, friendId]));
      }
    } catch (err) {
      console.error("Follow toggle error:", err);
    }
  };

  useEffect(() => {
    const fetchFriendData = async () => {
      try {
        const userData = await apiGetUser(friendName);
        const bios = [
          "Event enthusiast | Foodie | Explorer",
          "Adventure seeker | Coffee lover",
          "Music lover | Travel addict",
          "Fitness junkie | Nature lover",
          "Art enthusiast | Photographer",
          "Bookworm | Movie buff",
          "Foodie explorer | Chef wannabe",
          "Party animal | Social butterfly",
          "Yoga instructor | Wellness advocate",
          "Gamer | Tech geek",
        ];
        const hash = friendName.split("").reduce((acc: number, ch: string) => acc + ch.charCodeAt(0), 0);
        setFriendData({
          id: userData?.id || friendName,
          name: userData?.displayName || "",
          username: userData?.username || "",
          bio: userData?.bio || bios[hash % bios.length],
          avatar: userData?.avatar || userData?.photoURL || getAvatarWithFallback(friendName),
          followerUids: userData?.followerCount ?? [],
          followingUids: userData?.followingCount ?? [],
        });
      } catch (error) {
        console.error("Error fetching friend data:", error);
      }
    };
    fetchFriendData();
  }, [friendName, getAvatarWithFallback]);

  const [mockFollowers, setMockFollowers] = useState<UserRow[]>([]);
  const [mockFollowing, setMockFollowing] = useState<UserRow[]>([]);

  useEffect(() => {
    if (friendData.followerUids.length === 0) { setMockFollowers([]); return; }
    apiGetFollowers(friendId)
      .then((data: any[]) => setMockFollowers(data.map(d => ({
        id: d.id,
        name: d.name ?? "",
        username: `@${d.username ?? ""}`,
        bio: "",
        avatar: d.avatar ?? "",
      }))))
      .catch(() => setMockFollowers([]));
  }, [friendData.followerUids.join(","), friendId]);

  useEffect(() => {
    if (friendData.followingUids.length === 0) { setMockFollowing([]); return; }
    apiGetFollowing(friendId)
      .then((data: any[]) => setMockFollowing(data.map(d => ({
        id: d.id,
        name: d.name ?? "",
        username: `@${d.username ?? ""}`,
        bio: "",
        avatar: d.avatar ?? "",
      }))))
      .catch(() => setMockFollowing([]));
  }, [friendData.followingUids.join(","), friendId]);

  const postedEventsRaw = useMemo(() => {
    const safe = (idx: number) => mockEvents[idx] || mockEvents[0];
    return [
    ];
  }, [mockEvents]);

  const likedEventsRaw = useMemo(() => {
    const safe = (idx: number) => mockEvents[idx] || mockEvents[0];
    return [
    ];
  }, [mockEvents]);

  const bookedEventsRaw = useMemo(() => {
    const safe = (idx: number) => mockEvents[idx] || mockEvents[0];
    return [
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

  const postedEvents = useMemo(() => sortEvents(postedEventsRaw, sortOption), [postedEventsRaw, sortOption]);
  const likedEvents = useMemo(() => sortEvents(likedEventsRaw, likedSortOption), [likedEventsRaw, likedSortOption]);
  const bookedEvents = useMemo(() => sortEvents(bookedEventsRaw, bookedSortOption), [bookedEventsRaw, bookedSortOption]);

  const listData = activeTab === "posted" ? postedEvents : activeTab === "liked" ? likedEvents : bookedEvents;
  const currentSort = activeTab === "posted" ? sortOption : activeTab === "liked" ? likedSortOption : bookedSortOption;

  const setCurrentSort = (v: SortKey) => {
    if (activeTab === "posted") setSortOption(v);
    else if (activeTab === "liked") setLikedSortOption(v);
    else setBookedSortOption(v);
  };


  return (
    <SafeAreaView style={styles.root}>
      <FlatList
        data={listData}
        keyExtractor={(item: any) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrap}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Header Background — same as ProfilePage */}
            <View style={styles.headerBg} />


            {/* Profile Info */}
            <View style={styles.profileSection}>
              <View style={styles.profileRow}>
                <TouchableOpacity onPress={() => setPreviewImage(friendData.avatar)} activeOpacity={0.9}>
                  <Image source={{ uri: friendData.avatar }} style={styles.avatar} />
                </TouchableOpacity>

                <View style={styles.profileInfo}>
                  <Text style={styles.userName}>{friendData.name}</Text>
                  {friendData.username ? <Text style={styles.usernameText}>@{friendData.username}</Text> : null}
                  <Text style={styles.bio}>{friendData.bio}</Text>

                  <View style={styles.statsRow}>
                    <TouchableOpacity onPress={() => setShowFollowModal("followers")}>
                      <Text style={styles.statText}>
                        <Text style={styles.statNumber}>{mockFollowers.length}</Text>
                        {" "}Followers
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowFollowModal("following")}>
                      <Text style={styles.statText}>
                        <Text style={styles.statNumber}>{mockFollowing.length}</Text>
                        {" "}Following
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

            {/* Follow / Message */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                onPress={handleFollowToggle}
                style={[
                  styles.actionBtn,
                  !followButtonState.canFollow
                    ? styles.followDisabledBtn
                    : isFollowing
                      ? styles.followingBtn
                      : styles.followBtn,
                ]}
                activeOpacity={0.9}
                accessibilityRole="button"
                accessibilityLabel={isFollowing ? "Unfollow" : "Follow"}
                disabled={!followButtonState.canFollow}
              >
                <Text
                  style={[
                    styles.actionText,
                    !followButtonState.canFollow
                      ? styles.followDisabledText
                      : isFollowing
                        ? styles.followingText
                        : styles.followText,
                  ]}
                >
                  {followButtonState.label}
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

              {/* Tab Icons */}
              <View style={styles.tabIconRow}>
                <TouchableOpacity
                  style={[styles.tabIcon, activeTab === "posted" && styles.tabIconActive]}
                  onPress={() => setActiveTab("posted")}
                >
                  <FileText size={20} color="#ffffff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tabIcon, activeTab === "liked" && styles.tabIconActive]}
                  onPress={() => setActiveTab("liked")}
                >
                  <Heart size={20} color="#ffffff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tabIcon, activeTab === "booked" && styles.tabIconActive]}
                  onPress={() => setActiveTab("booked")}
                >
                  <Calendar size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>

              {/* Content Header + Sort */}
              <View style={styles.contentHeader}>
                <Text style={styles.contentTitle}>
                  {activeTab === "posted" ? "Events Posted" : activeTab === "liked" ? "Liked/Saved Events" : "Booked Events"}
                </Text>
                <View style={styles.sortChips}>
                  {([
                    ["latest", "Latest"],
                    ["oldest", "Oldest"],
                    ["name-asc", "A–Z"],
                    ["name-desc", "Z–A"],
                    ["rating", "Rating"],
                  ] as [SortKey, string][]).map(([key, label]) => {
                    const on = currentSort === key;
                    return (
                      <TouchableOpacity
                        key={key}
                        onPress={() => setCurrentSort(key)}
                        style={[styles.chip, on ? styles.chipOn : styles.chipOff]}
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
          </View>
        }
        renderItem={({ item }: any) => (
          <View style={styles.cardCell}>
            <EventCard
              event={item}
              onPress={() => onNavigate("event", item.id, { showPrice: activeTab === "booked", activeTab, friendName: friendData.name })}
            />
          </View>
        )}
        ListFooterComponent={<View style={{ height: 120 }} />}
      />

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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {showFollowModal === "followers" ? "Followers" : "Following"}
              </Text>
              <TouchableOpacity onPress={() => setShowFollowModal(null)}>
                <X size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={
                showFollowModal === "followers"
                  ? mockFollowers
                  : mockFollowing
              }
              keyExtractor={(u) => u.id}
              renderItem={({ item: user }) => (
                <View style={styles.userRow}>
                  <TouchableOpacity
                    style={styles.userAvatarWrap}
                    onPress={() => { setShowFollowModal(null); onNavigate("friendProfile", undefined, { friendName: user.id }); }}
                  >
                    <Image source={{ uri: user.avatar || getAvatarWithFallback(user.name || user.id) }} style={styles.userAvatar} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.userInfo}
                    onPress={() => { setShowFollowModal(null); onNavigate("friendProfile", undefined, { friendName: user.id }); }}
                  >
                    <Text style={styles.userNameText} numberOfLines={1}>{user.name}</Text>
                    <Text style={styles.userMeta} numberOfLines={1}>{user.username}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.removeBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Remove"
                    onPress={async () => {
                      const rowFollowState = getFollowButtonState({
                        currentUid,
                        friendId: user.id,
                        friendFollowerIds: [],
                        friendFollowingIds: [],
                        myFollowerIds,
                        myFollowingIds,
                      });

                      if (!rowFollowState.canFollow) return;

                      try {
                        if (rowFollowState.isFollowing) {
                          await apiUnfollowUser(user.id);
                          setMyFollowingIds(prev => prev.filter(id => id !== user.id));
                        } else {
                          await apiFollowUser(user.id);
                          setMyFollowingIds(prev => (prev.includes(user.id) ? prev : [...prev, user.id]));
                        }
                      } catch (err) {
                        console.error("User follow toggle error:", err);
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.userActionText,
                        user.id === currentUid
                          ? styles.userActionDisabledText
                          : myFollowingIds.includes(user.id)
                            ? styles.userActionFollowingText
                            : myFollowerIds.includes(user.id)
                              ? styles.userActionFollowBackText
                              : styles.userActionFollowText,
                      ]}
                    >
                      {(() => {
                        const rowFollowState = getFollowButtonState({
                          currentUid,
                          friendId: user.id,
                          friendFollowerIds: [],
                          friendFollowingIds: [],
                          myFollowerIds,
                          myFollowingIds,
                        });
                        return rowFollowState.label;
                      })()}
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

      {/* Full-screen image preview */}
      <Modal visible={!!previewImage} transparent animationType="fade" onRequestClose={() => setPreviewImage(null)}>
        <Pressable style={styles.previewOverlay} onPress={() => setPreviewImage(null)}>
          <Image source={{ uri: previewImage ?? "" }} style={styles.previewImage} resizeMode="contain" />
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },

  backBtn: {
    position: "absolute",
    top: 16,
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

  listContent: { paddingBottom: 0 },
  columnWrap: { justifyContent: "space-between", paddingHorizontal: 26 },
  cardCell: { flex: 1, maxWidth: "48%", paddingBottom: 16 },

  // Header — matches ProfilePage exactly
  headerBg: {
    backgroundColor: "#d1d5db",
    height: 110,
  },

  profileSection: {
    paddingHorizontal: 26,
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    marginTop: -48,
    marginBottom: 12,
  },

  avatar: {
    width: 103,
    height: 103,
    borderRadius: 51.5,
    borderWidth: 4,
    borderColor: "#ffffff",
    flexShrink: 0,
  },

  profileInfo: {
    flex: 1,
    paddingTop: 48,
  },

  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 2,
  },

  usernameText: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 4,
  },

  bio: {
    fontSize: 12,
    color: "#4b5563",
    marginBottom: 12,
  },

  statsRow: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },

  statText: { fontSize: 13, color: "#374151" },
  statNumber: { fontWeight: "bold", color: "#111827" },

  actionRow: { flexDirection: "row", gap: 12, marginBottom: 14 },
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  actionText: { fontSize: 14, fontWeight: "800" },
  followBtn: { backgroundColor: "#0EA5E9" },
  followText: { color: "#fff" },
  followDisabledBtn: { backgroundColor: "#F3F4F6" },
  followDisabledText: { color: "#9CA3AF" },
  followingBtn: { backgroundColor: "#E5E7EB" },
  followingText: { color: "#374151" },
  messageBtn: { backgroundColor: "#E5E7EB" },
  messageText: { color: "#374151" },

  tabIconRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 28,
    borderTopWidth: 2,
    borderTopColor: "#111",
    paddingTop: 14,
    marginBottom: 14,
  },
  tabIcon: { width: 42, height: 42, borderRadius: 6, alignItems: "center", justifyContent: "center", backgroundColor: "#D1D5DB" },
  tabIconActive: { backgroundColor: "#3B82F6" },

  contentHeader: { marginBottom: 12 },
  contentTitle: { fontSize: 18, fontWeight: "800", color: "#111", marginBottom: 10 },

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
  userNameText: { fontSize: 14, fontWeight: "800", color: "#111" },
  userMeta: { fontSize: 12, color: "#6B7280", marginTop: 2 },

  removeBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, backgroundColor: "#fee2e2" },
  removeBtnText: { color: "#dc2626", fontSize: 12, fontWeight: "800" },
  userActionText: { fontSize: 12, fontWeight: "800" },
  userActionDisabledText: { color: "#9CA3AF" },
  userActionFollowingText: { color: "#374151" },
  userActionFollowBackText: { color: "#2563EB" },
  userActionFollowText: { color: "#059669" },

  userSep: { height: 1, backgroundColor: "#F3F4F6" },

  previewOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.9)", alignItems: "center", justifyContent: "center" },
  previewImage: { width: "100%", height: "100%" },
});

export default FriendProfileScreen;
