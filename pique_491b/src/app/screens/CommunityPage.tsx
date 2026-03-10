import { NavigationBar } from '@/components/NavigationBar';
import { useAuth } from '@/context/AuthContext';
import { auth, db } from '@/firebase';
import { arrayRemove, arrayUnion, collection, endAt, getDocs, orderBy, query, startAt, updateDoc, doc } from 'firebase/firestore';
import { Globe, Info, Search, Trophy, Users, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Placeholder data
const mockFriends: any[] = [];
const mockFriendRatedEvents: any[] = [];
const mockEvents: any[] = [];
const globalLeaderboardUsers: any[] = [];

type Tab = 'leaderboard' | 'reviews' | 'find';
type LeaderboardMode = 'global' | 'friends';

interface CommunityPageProps {
  onNavigate: (page: string, eventId?: string, options?: any) => void;
  onOpenMessages?: () => void;
  unreadMessageCount?: number;
}

export function CommunityPage({ onNavigate, onOpenMessages, unreadMessageCount }: CommunityPageProps) {
  const { profile } = useAuth();
  const currentUid = auth.currentUser?.uid ?? '';
  const [followingSet, setFollowingSet] = useState<Set<string>>(new Set(profile?.followingCount ?? []));
  const [activeTab, setActiveTab] = useState<Tab>('leaderboard');
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [leaderboardMode, setLeaderboardMode] = useState<LeaderboardMode>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setFollowingSet(new Set(profile?.followingCount ?? []));
  }, [profile?.followingCount]);

  const handleFollowToggle = async (targetUid: string) => {
    if (!currentUid || currentUid === targetUid) return;
    const myRef = doc(db, 'users', currentUid);
    const theirRef = doc(db, 'users', targetUid);
    if (followingSet.has(targetUid)) {
      await updateDoc(myRef, { followingCount: arrayRemove(targetUid) });
      await updateDoc(theirRef, { followerCount: arrayRemove(currentUid) });
      setFollowingSet(prev => { const s = new Set(prev); s.delete(targetUid); return s; });
    } else {
      await updateDoc(myRef, { followingCount: arrayUnion(targetUid) });
      await updateDoc(theirRef, { followerCount: arrayUnion(currentUid) });
      setFollowingSet(prev => new Set([...prev, targetUid]));
    }
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = searchQuery.trim().toLowerCase();
    if (!q) { setSearchResults([]); return; }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const q1 = query(
          collection(db, 'users'),
          orderBy('username'),
          startAt(q),
          endAt(q + '\uf8ff')
        );
        const snap = await getDocs(q1);
        setSearchResults(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error('User search error:', e);
      } finally {
        setSearching(false);
      }
    }, 400);
  }, [searchQuery]);

  const getTrophyColor = (rank: number) => {
    switch (rank) {
      case 1: return '#eab308';
      case 2: return '#9ca3af';
      case 3: return '#ea580c';
      default: return '#6b7280';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return { bg: '#dcfce7', border: '#22c55e', text: '#166534' };
    if (rating >= 2) return { bg: '#fef9c3', border: '#eab308', text: '#854d0e' };
    return { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' };
  };

  const displayedUsers = leaderboardMode === 'friends' ? mockFriends : globalLeaderboardUsers;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        {/* Sticky Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Community</Text>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'leaderboard' && styles.tabActive]}
              onPress={() => setActiveTab('leaderboard')}
            >
              <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.tabTextActive]}>
                Leaderboard
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'reviews' && styles.tabActive]}
              onPress={() => setActiveTab('reviews')}
            >
              <Text style={[styles.tabText, activeTab === 'reviews' && styles.tabTextActive]}>
                Reviews
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'find' && styles.tabActive]}
              onPress={() => setActiveTab('find')}
            >
              <Text style={[styles.tabText, activeTab === 'find' && styles.tabTextActive]}>
                Find People
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <View style={styles.tabContent}>
            {/* Mode Toggle */}
            <View style={styles.modeToggleRow}>
              <View style={styles.modeToggle}>
                <TouchableOpacity
                  style={[styles.modeButton, leaderboardMode === 'friends' && styles.modeButtonActive]}
                  onPress={() => setLeaderboardMode('friends')}
                >
                  <Users size={16} color={leaderboardMode === 'friends' ? '#111827' : '#6b7280'} />
                  <Text style={[styles.modeButtonText, leaderboardMode === 'friends' && styles.modeButtonTextActive]}>
                    Friends
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modeButton, leaderboardMode === 'global' && styles.modeButtonActive]}
                  onPress={() => setLeaderboardMode('global')}
                >
                  <Globe size={16} color={leaderboardMode === 'global' ? '#111827' : '#6b7280'} />
                  <Text style={[styles.modeButtonText, leaderboardMode === 'global' && styles.modeButtonTextActive]}>
                    Global
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.infoButton}
                onPress={() => setShowPointsModal(true)}
              >
                <Info size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.subtext}>
              {leaderboardMode === 'friends'
                ? 'Your friends ranked by activity points'
                : 'Everyone ranked by activity points'}
            </Text>

            {/* Leaderboard List */}
            {displayedUsers.length === 0 && (
              <Text style={styles.emptyText}>No users to display yet</Text>
            )}
            {displayedUsers.map((user: any, index: number) => {
              const rank = index + 1;
              const showTrophy = rank <= 3;
              return (
                <TouchableOpacity
                  key={user.id}
                  style={styles.leaderboardRow}
                  onPress={() => onNavigate('friendProfile', undefined, { friendName: user.name })}
                >
                  {/* Rank */}
                  <View style={styles.rankContainer}>
                    {showTrophy ? (
                      <Trophy size={20} color={getTrophyColor(rank)} fill={getTrophyColor(rank)} />
                    ) : (
                      <Text style={styles.rankNumber}>#{rank}</Text>
                    )}
                  </View>

                  {/* Avatar */}
                  <Image source={{ uri: user.avatar }} style={styles.avatar} />

                  {/* Name */}
                  <Text style={styles.userName}>{user.name}</Text>

                  {/* Points */}
                  <View style={styles.pointsContainer}>
                    <Text style={styles.pointsNumber}>{user.points}</Text>
                    <Text style={styles.pointsLabel}>points</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <View style={styles.tabContent}>
            <Text style={styles.subtext}>Events your friends have attended and rated</Text>

            {mockFriendRatedEvents.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No rated events yet</Text>
                <Text style={styles.emptySubtext}>
                  Check back when your friends rate events!
                </Text>
              </View>
            )}

            {mockFriendRatedEvents.map((ratedEvent: any) => {
              const event = mockEvents.find((e: any) => e.id === ratedEvent.eventId);
              if (!event) return null;
              const colors = getRatingColor(ratedEvent.rating);

              return (
                <TouchableOpacity
                  key={ratedEvent.id}
                  style={styles.reviewRow}
                  onPress={() => onNavigate('event', ratedEvent.eventId)}
                >
                  <TouchableOpacity
                    onPress={() => onNavigate('friendProfile', undefined, { friendName: ratedEvent.friendName })}
                  >
                    <Image source={{ uri: ratedEvent.friendAvatar }} style={styles.friendAvatar} />
                  </TouchableOpacity>

                  <View style={styles.reviewInfo}>
                    <Text style={styles.reviewTitle} numberOfLines={1}>
                      <Text style={styles.reviewFriendName}>{ratedEvent.friendName}</Text>
                      <Text> rated </Text>
                      <Text>{ratedEvent.eventName}</Text>
                    </Text>
                    {ratedEvent.reviewText && (
                      <Text style={styles.reviewText} numberOfLines={1}>
                        {ratedEvent.reviewText}
                      </Text>
                    )}
                  </View>

                  <View style={[styles.ratingBadge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                    <Text style={[styles.ratingBadgeText, { color: colors.text }]}>
                      {ratedEvent.rating.toFixed(1)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        {/* Find People Tab */}
        {activeTab === 'find' && (
          <View style={styles.tabContent}>
            <View style={styles.searchBar}>
              <Search size={18} color="#9ca3af" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by username..."
                placeholderTextColor="#9ca3af"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={16} color="#9ca3af" />
                </TouchableOpacity>
              )}
            </View>

            {searching && <ActivityIndicator style={{ marginTop: 24 }} color="#3b82f6" />}

            {!searching && searchQuery.trim().length > 0 && searchResults.length === 0 && (
              <Text style={styles.emptyText}>No users found for "{searchQuery}"</Text>
            )}

            {!searching && searchQuery.trim().length === 0 && (
              <Text style={styles.emptyText}>Start typing to find people</Text>
            )}

            {searchResults.map(user => {
              const isMe = user.id === currentUid;
              const isFollowing = followingSet.has(user.id);
              return (
                <TouchableOpacity
                  key={user.id}
                  style={styles.userRow}
                  onPress={() => onNavigate('friendProfile', undefined, { friendName: user.id })}
                >
                  <Image
                    source={{ uri: user.avatar ?? 'https://i.pravatar.cc/150?img=0' }}
                    style={styles.userAvatar}
                  />
                  <View style={styles.userInfo}>
                    <Text style={styles.userDisplayName}>{user.displayName}</Text>
                    <Text style={styles.userUsername}>@{user.username}</Text>
                  </View>
                  {!isMe && (
                    <TouchableOpacity
                      style={[styles.followBtn, isFollowing && styles.followingBtn]}
                      onPress={(e) => { e.stopPropagation?.(); handleFollowToggle(user.id); }}
                    >
                      <Text style={[styles.followBtnText, isFollowing && styles.followingBtnText]}>
                        {isFollowing ? 'Following' : 'Follow'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

      </ScrollView>

      <NavigationBar
        currentPage="leaderboard"
        onNavigate={(page) => onNavigate(page)}
        onOpenMessages={onOpenMessages || (() => {})}
        unreadMessageCount={unreadMessageCount}
      />

      {/* Points Info Modal */}
      <Modal visible={showPointsModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>How Points Work</Text>
              <TouchableOpacity onPress={() => setShowPointsModal(false)}>
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {[
              { label: 'Write a review', points: '+5 pts' },
              { label: 'Rate an event', points: '+3 pts' },
              { label: 'Mark "Going" to event', points: '+2 pts' },
            ].map((item) => (
              <View key={item.label} style={styles.pointRow}>
                <Text style={styles.pointLabel}>{item.label}</Text>
                <Text style={styles.pointValue}>{item.points}</Text>
              </View>
            ))}

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowPointsModal(false)}
            >
              <Text style={styles.modalButtonText}>Got it</Text>
            </TouchableOpacity>
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
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 59,
    paddingHorizontal: 18,
    paddingBottom: 16,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#3b82f6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  tabContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  modeToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  modeToggle: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
    gap: 4,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  modeButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  modeButtonTextActive: {
    color: '#111827',
  },
  infoButton: {
    padding: 8,
    borderRadius: 9999,
  },
  subtext: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 12,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
  },
  rankContainer: {
    width: 32,
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  pointsContainer: {
    alignItems: 'flex-end',
  },
  pointsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  pointsLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    flexShrink: 0,
  },
  reviewInfo: {
    flex: 1,
  },
  reviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  reviewFriendName: {
    fontWeight: '700',
  },
  reviewText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  ratingBadge: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  ratingBadgeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  userAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  userInfo: {
    flex: 1,
  },
  userDisplayName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  userUsername: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  followBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
  },
  followBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  followingBtn: {
    backgroundColor: '#e5e7eb',
  },
  followingBtnText: {
    color: '#374151',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 360,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  pointRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  pointLabel: {
    fontSize: 14,
    color: '#374151',
  },
  pointValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  modalButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});