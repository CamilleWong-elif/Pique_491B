import {
  apiGetEvents,
  apiGetBookings,
  apiGetFollowers,
  apiGetFollowing,
  apiToggleLike,
  apiUpdateMe,
  apiCheckUsername,
  apiUnfollowUser,
} from '@/api';
import { EventCard } from '@/components/EventCard';
import { NavigationBar } from '@/components/NavigationBar';
import { useAuth } from '@/context/AuthContext';
import type { Event } from '@/types/Event';
import { resolveAvatarUrl } from '@/utils/avatar';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Calendar, Camera, FileText, Heart, Pencil, Plus, X } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1653771926391-d1b5608c90b2?w=400';

type TabType = 'posted' | 'liked' | 'booked';
type SortKey = 'latest' | 'oldest' | 'name-asc' | 'name-desc' | 'rating';

interface ProfilePageProps {
  onNavigate: (page: string, eventId?: string, options?: any) => void;
  initialTab?: TabType;
  onOpenMessages?: () => void;
  unreadMessageCount?: number;
}

export function ProfilePage({
  onNavigate,
  initialTab = 'posted',
  onOpenMessages,
  unreadMessageCount,
}: ProfilePageProps) {
  const { user, profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [postedSort, setPostedSort] = useState<SortKey>('latest');
  const [likedSort, setLikedSort] = useState<SortKey>('latest');
  const [bookedSort, setBookedSort] = useState<SortKey>('latest');
  const [showFollowModal, setShowFollowModal] = useState<'followers' | 'following' | null>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [editingUsername, setEditingUsername] = useState('');
  const [editingBio, setEditingBio] = useState('');
  const [editingPhotoURI, setEditingPhotoURI] = useState<string | null>(null);
  const [editingPhotoBase64, setEditingPhotoBase64] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [removedFollowerIds, setRemovedFollowerIds] = useState<Set<string>>(new Set());
  const [removedFollowingIds, setRemovedFollowingIds] = useState<Set<string>>(new Set());

  // Event data
  const [postedEvents, setPostedEvents] = useState<Event[]>([]);
  const [likedEvents, setLikedEvents] = useState<Event[]>([]);
  const [bookedEvents, setBookedEvents] = useState<Event[]>([]);
  const [likedEventIds, setLikedEventIds] = useState<Set<string>>(new Set());
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    const liked: string[] = profile?.likedEvents ?? [];
    setLikedEventIds(new Set(liked));
  }, [profile?.likedEvents]);

  const userName = profile?.displayName ?? user?.displayName ?? user?.email ?? 'User';
  const username = (profile as any)?.username ?? '';
  const profilePicture =
    (profile as any)?.avatarDataUrl ??
    profile?.photoURL ??
    (profile as any)?.avatar ??
    user?.photoURL ??
    DEFAULT_AVATAR;
  const bio = profile?.bio ?? '';

  const followerUids: string[] = profile?.followerCount ?? [];
  const followingUids: string[] = profile?.followingCount ?? [];

  const [followers, setFollowers] = useState<{ id: string; name: string; username: string; avatar: string }[]>([]);
  const [following, setFollowing] = useState<{ id: string; name: string; username: string; avatar: string }[]>([]);

  // Fetch followers
  useEffect(() => {
    if (!user?.uid) { setFollowers([]); return; }
    apiGetFollowers(user.uid)
      .then((data: any[]) => setFollowers(data.map(d => ({
        id: d.id,
        name: d.name ?? '',
        username: `@${d.username ?? ''}`,
        avatar: resolveAvatarUrl(d) ?? '',
      }))))
      .catch(() => setFollowers([]));
  }, [followerUids.join(','), user?.uid]);

  // Fetch following
  useEffect(() => {
    if (!user?.uid) { setFollowing([]); return; }
    apiGetFollowing(user.uid)
      .then((data: any[]) => setFollowing(data.map(d => ({
        id: d.id,
        name: d.name ?? '',
        username: `@${d.username ?? ''}`,
        avatar: resolveAvatarUrl(d) ?? '',
      }))))
      .catch(() => setFollowing([]));
  }, [followingUids.join(','), user?.uid]);

  const mapToEvent = (e: any): Event => ({
    id: e.id,
    name: e.name ?? '',
    imageUrl: e.imageUrl ?? e.image ?? undefined,
    startDate: e.date ?? e.startDate ?? e.createdAt ?? undefined,
    category: e.categories?.[0] ?? e.category ?? undefined,
    city: e.city ?? (e.location ? e.location.split(',')[0]?.trim() : undefined),
    pricePoint: e.pricePoint ?? 0,
    rating: e.rating ?? 0,
    distance: e.distance ?? undefined,
    createdAt: e.createdAt ?? undefined,
  });

  // Fetch all event data
  useEffect(() => {
    const uid = user?.uid;
    if (!uid) return;

    const fetchData = async () => {
      setLoadingEvents(true);
      try {
        // Fetch all events and filter posted ones client-side
        const allEvents = await apiGetEvents();
        const posted = allEvents
          .filter((e: any) => e.createdBy === uid)
          .map(mapToEvent);
        setPostedEvents(posted);

        // Filter liked events from all events
        const likedIds: string[] = profile?.likedEvents ?? [];
        const likedSet = new Set(likedIds);
        const liked = allEvents
          .filter((e: any) => likedSet.has(e.id))
          .map(mapToEvent);
        setLikedEvents(liked);

        // Fetch booked events (non-blocking — profile still works if this fails)
        try {
          const bookings = await apiGetBookings();
          const bookedEventIds = [...new Set(bookings.map((b: any) => b.eventId))];
          const bookedIdSet = new Set(bookedEventIds);
          const booked = allEvents
            .filter((e: any) => bookedIdSet.has(e.id))
            .map(mapToEvent);
          setBookedEvents(booked);
        } catch (bookingErr) {
          console.warn('Could not fetch bookings:', bookingErr);
        }
      } catch (err) {
        console.error('Error fetching profile events:', err);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchData();
  }, [user?.uid, JSON.stringify(profile?.likedEvents ?? [])]);

  // Sorting
  const parseDate = (e: Event): number => {
    for (const field of [e.startDate, e.createdAt]) {
      if (!field) continue;
      // Handle MM/DD/YYYY format (stored by CreateEventPage)
      const slashMatch = field.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (slashMatch) {
        const [, m, d, y] = slashMatch;
        return new Date(Number(y), Number(m) - 1, Number(d)).getTime();
      }
      const t = new Date(field).getTime();
      if (!isNaN(t)) return t;
    }
    return 0;
  };

  const sortEvents = useCallback((events: Event[], sortBy: SortKey): Event[] => {
    const sorted = [...events];
    switch (sortBy) {
      case 'latest':
        return sorted.sort((a, b) => parseDate(b) - parseDate(a));
      case 'oldest':
        return sorted.sort((a, b) => parseDate(a) - parseDate(b));
      case 'name-asc':
        return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      case 'name-desc':
        return sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default:
        return sorted;
    }
  }, []);

  const currentSort = activeTab === 'posted' ? postedSort : activeTab === 'liked' ? likedSort : bookedSort;
  const setCurrentSort = (v: SortKey) => {
    if (activeTab === 'posted') setPostedSort(v);
    else if (activeTab === 'liked') setLikedSort(v);
    else setBookedSort(v);
  };

  const sortedPosted = useMemo(() => sortEvents(postedEvents, postedSort), [postedEvents, postedSort, sortEvents]);
  const sortedLiked = useMemo(() => sortEvents(likedEvents, likedSort), [likedEvents, likedSort, sortEvents]);
  const sortedBooked = useMemo(() => sortEvents(bookedEvents, bookedSort), [bookedEvents, bookedSort, sortEvents]);

  const activeEvents =
    activeTab === 'posted' ? sortedPosted :
    activeTab === 'liked' ? sortedLiked :
    sortedBooked;

  // Edit Profile handlers
  const handleEditClick = () => {
    setEditingName(userName);
    setEditingUsername(username);
    setEditingBio(bio);
    setEditingPhotoURI(null);
    setEditingPhotoBase64(null);
    setUsernameError('');
    setShowEditProfile(true);
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant photo library access to change your profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled && result.assets[0]) {
      const optimized = await manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 256, height: 256 } }],
        { compress: 0.45, format: SaveFormat.JPEG, base64: true }
      );
      if (!optimized.base64) {
        Alert.alert('Upload failed', 'Could not process selected image.');
        return;
      }
      setEditingPhotoURI(optimized.uri);
      setEditingPhotoBase64(optimized.base64);
    }
  };

  const checkUsernameAvailable = async (uname: string): Promise<boolean> => {
    if (!uname.trim()) return true;
    const result = await apiCheckUsername(uname);
    return result.available;
  };

  const handleSaveProfile = async () => {
    const uid = user?.uid;
    if (!uid) return;

    if (!editingName.trim()) {
      Alert.alert('Missing name', 'Please add a display name.');
      return;
    }

    if (editingUsername.trim()) {
      const available = await checkUsernameAvailable(editingUsername);
      if (!available) {
        setUsernameError('This username is already taken.');
        return;
      }
    }

    setSavingProfile(true);
    try {
      const updates: Record<string, any> = {
        displayName: editingName.trim(),
        bio: editingBio.trim(),
        username: editingUsername.toLowerCase().trim(),
      };

      if (editingPhotoBase64) {
        updates.avatarDataUrl = `data:image/jpeg;base64,${editingPhotoBase64}`;
      }

      await apiUpdateMe(updates);
      refreshProfile();
      setShowEditProfile(false);
    } catch (err) {
      console.error('Save profile error:', err);
      Alert.alert('Error', 'Failed to save profile changes.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Bookmark/like handler (optimistic UI + backend; likedEventIds mirrors HomePage)
  const handleBookmarkPress = async (eventId?: string) => {
    if (!eventId || !user?.uid) return;
    const wasLiked = likedEventIds.has(eventId);
    const removedForRevert = wasLiked ? likedEvents.find(e => e.id === eventId) : undefined;
    if (wasLiked) {
      setLikedEventIds(prev => {
        const n = new Set(prev);
        n.delete(eventId);
        return n;
      });
      setLikedEvents(prev => prev.filter(e => e.id !== eventId));
    } else {
      setLikedEventIds(prev => new Set(prev).add(eventId));
      const existing = [...postedEvents, ...bookedEvents, ...likedEvents].find(e => e.id === eventId);
      if (existing && !likedEvents.some(e => e.id === eventId)) {
        setLikedEvents(prev => [...prev, existing]);
      }
    }
    try {
      await apiToggleLike(eventId);
    } catch (err) {
      if (wasLiked) {
        setLikedEventIds(prev => new Set(prev).add(eventId));
        if (removedForRevert) {
          setLikedEvents(prev => (prev.some(e => e.id === eventId) ? prev : [...prev, removedForRevert]));
        }
      } else {
        setLikedEventIds(prev => {
          const n = new Set(prev);
          n.delete(eventId);
          return n;
        });
        setLikedEvents(prev => prev.filter(e => e.id !== eventId));
      }
      console.error('Bookmark error:', err);
    }
  };

  const sortOptions: { label: string; value: SortKey }[] = [
    { label: 'Latest', value: 'latest' },
    { label: 'Oldest', value: 'oldest' },
    { label: 'A-Z', value: 'name-asc' },
    { label: 'Z-A', value: 'name-desc' },
    { label: 'Rating', value: 'rating' },
  ];

  const renderEventItem = ({ item }: { item: Event }) => (
    <View style={styles.cardCell}>
      <EventCard
        event={item}
        onPress={() => onNavigate('event', item.id)}
        onBookmarkPress={handleBookmarkPress}
        isBookmarked={likedEventIds.has(item.id)}
        hideBookmark={activeTab === 'booked'}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Create button — floats over header top-right */}
      <TouchableOpacity style={styles.createButton} onPress={() => onNavigate('create')}>
        <Plus size={20} color="#374151" />
      </TouchableOpacity>

      <FlatList
        data={activeEvents}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrap}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={renderEventItem}
        ListHeaderComponent={
          <View>
            {/* Header Background */}
            <View style={styles.headerBg} />

            {/* Profile Info */}
            <View style={styles.profileSection}>
              <View style={styles.profileRow}>
                <Image source={{ uri: profilePicture }} style={styles.avatar} />
                <View style={styles.profileInfo}>
                  <Text style={styles.userName}>{userName}</Text>
                  {username ? <Text style={styles.usernameText}>@{username}</Text> : null}
                  <Text style={styles.bio}>{bio}</Text>
                  <View style={styles.statsRow}>
                    <TouchableOpacity onPress={() => setShowFollowModal('followers')}>
                      <Text style={styles.statText}>
                        <Text style={styles.statNumber}>{followers.length}</Text>
                        {' '}Followers
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowFollowModal('following')}>
                      <Text style={styles.statText}>
                        <Text style={styles.statNumber}>{following.length}</Text>
                        {' '}Following
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.editButton} onPress={handleEditClick}>
                      <Pencil size={14} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Tab Icons */}
              <View style={styles.tabIconRow}>
                <TouchableOpacity
                  style={[styles.tabIcon, activeTab === 'posted' && styles.tabIconActive]}
                  onPress={() => setActiveTab('posted')}
                >
                  <FileText size={20} color="#ffffff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tabIcon, activeTab === 'liked' && styles.tabIconActive]}
                  onPress={() => setActiveTab('liked')}
                >
                  <Heart size={20} color="#ffffff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tabIcon, activeTab === 'booked' && styles.tabIconActive]}
                  onPress={() => setActiveTab('booked')}
                >
                  <Calendar size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>

              {/* Content Header */}
              <View style={styles.contentHeader}>
                <Text style={styles.contentTitle}>
                  {activeTab === 'posted' ? 'Events Posted' :
                   activeTab === 'liked' ? 'Liked Events' :
                   'Booked Events'}
                </Text>

                {/* Sort Chips */}
                <View style={styles.sortChips}>
                  {sortOptions.map((opt) => {
                    const on = currentSort === opt.value;
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        style={[styles.chip, on ? styles.chipOn : styles.chipOff]}
                        onPress={() => setCurrentSort(opt.value)}
                      >
                        <Text style={[styles.chipText, on ? styles.chipTextOn : styles.chipTextOff]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          loadingEvents ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color="#3b82f6" />
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {activeTab === 'posted'
                  ? 'You haven\'t posted any events yet'
                  : activeTab === 'liked'
                  ? 'You haven\'t liked any events yet'
                  : 'You haven\'t booked any events yet'}
              </Text>
            </View>
          )
        }
        ListFooterComponent={<View style={{ height: 120 }} />}
      />

      <NavigationBar
        currentPage="profile"
        onNavigate={(page) => onNavigate(page)}
        onOpenMessages={onOpenMessages || (() => {})}
        unreadMessageCount={unreadMessageCount}
      />

      {/* Followers/Following Modal */}
      <Modal visible={!!showFollowModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingHorizontal: 0, paddingBottom: 0 }]}>
            <View style={[styles.modalHeader, { paddingHorizontal: 20 }]}>
              <Text style={styles.modalTitle}>
                {showFollowModal === 'followers' ? 'Followers' : 'Following'}
              </Text>
              <TouchableOpacity onPress={() => setShowFollowModal(null)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={
                showFollowModal === 'followers'
                  ? followers.filter(u => !removedFollowerIds.has(u.id))
                  : following.filter(u => !removedFollowingIds.has(u.id))
              }
              keyExtractor={item => item.id}
              style={{ maxHeight: 420 }}
              ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#f3f4f6' }} />}
              renderItem={({ item }) => (
                <View style={styles.userRow}>
                  <TouchableOpacity onPress={() => { setShowFollowModal(null); onNavigate('friendProfile', undefined, { friendName: item.id }); }}>
                    <Image source={{ uri: item.avatar || `https://api.dicebear.com/7.x/initials/png?seed=${encodeURIComponent(item.name || item.id)}` }} style={styles.userAvatar} />
                  </TouchableOpacity>
                  <TouchableOpacity style={{ flex: 1, minWidth: 0 }} onPress={() => { setShowFollowModal(null); onNavigate('friendProfile', undefined, { friendName: item.id }); }}>
                    <Text style={styles.modalUserName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.userMeta} numberOfLines={1}>{item.username}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => {
                      const isFollower = showFollowModal === 'followers';
                      Alert.alert(
                        isFollower ? 'Remove Follower' : 'Unfollow',
                        isFollower
                          ? `Are you sure you want to remove ${item.name} as a follower?`
                          : `Are you sure you want to unfollow ${item.name}?`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Remove',
                            style: 'destructive',
                            onPress: async () => {
                              if (!user?.uid) return;
                              try {
                                if (isFollower) {
                                  // Remove follower: they unfollow us
                                  await apiUnfollowUser(user.uid);
                                  setRemovedFollowerIds(prev => new Set([...prev, item.id]));
                                } else {
                                  // Unfollow them
                                  await apiUnfollowUser(item.id);
                                  setRemovedFollowingIds(prev => new Set([...prev, item.id]));
                                }
                              } catch (err) {
                                console.error('Remove error:', err);
                              }
                            },
                          },
                        ]
                      );
                    }}
                  >
                    <Text style={styles.removeBtnText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal visible={showEditProfile} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEditProfile(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Profile Picture */}
            <View style={styles.editAvatarSection}>
              <Image
                source={{ uri: editingPhotoURI || profilePicture }}
                style={styles.editAvatar}
              />
              <TouchableOpacity style={styles.changePhotoBtn} onPress={handlePickImage}>
                <Camera size={16} color="#ffffff" />
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Display Name</Text>
            <TextInput
              style={styles.textInput}
              value={editingName}
              onChangeText={setEditingName}
              placeholder="Enter your name"
              placeholderTextColor="#9ca3af"
              maxLength={50}
            />

            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              style={[styles.textInput, usernameError ? styles.textInputError : null]}
              value={editingUsername}
              onChangeText={(text) => {
                setEditingUsername(text.replace(/[^a-zA-Z0-9_]/g, ''));
                setUsernameError('');
              }}
              placeholder="Choose a username"
              placeholderTextColor="#9ca3af"
              maxLength={30}
              autoCapitalize="none"
            />
            {usernameError ? (
              <Text style={styles.errorText}>{usernameError}</Text>
            ) : null}

            <Text style={styles.inputLabel}>Bio</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={editingBio}
              onChangeText={setEditingBio}
              placeholder="Tell us about yourself..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
              maxLength={150}
            />
            <Text style={styles.charCount}>{editingBio.length}/150 characters</Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowEditProfile(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, savingProfile && styles.saveButtonDisabled]}
                onPress={handleSaveProfile}
                disabled={savingProfile}
              >
                {savingProfile ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
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
  listContent: {
    paddingBottom: 0,
  },
  columnWrap: {
    justifyContent: 'space-between',
    paddingHorizontal: 26,
  },
  cardCell: {
    flex: 1,
    maxWidth: '48%',
    paddingBottom: 16,
  },
  headerBg: {
    backgroundColor: '#d1d5db',
    height: 110,
  },
  createButton: {
    position: 'absolute',
    top: 59,
    right: 18,
    zIndex: 20,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  profileSection: {
    paddingHorizontal: 26,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginTop: -48,
    marginBottom: 12,
  },
  avatar: {
    width: 103,
    height: 103,
    borderRadius: 51.5,
    borderWidth: 4,
    borderColor: '#ffffff',
    flexShrink: 0,
  },
  profileInfo: {
    flex: 1,
    paddingTop: 48,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  usernameText: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  bio: {
    fontSize: 12,
    color: '#4b5563',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statText: {
    fontSize: 13,
    color: '#374151',
  },
  statNumber: {
    fontWeight: 'bold',
    color: '#111827',
  },
  editButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 28,
    borderTopWidth: 2,
    borderTopColor: '#111827',
    paddingTop: 14,
    marginBottom: 14,
  },
  tabIcon: {
    width: 42,
    height: 42,
    borderRadius: 6,
    backgroundColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconActive: {
    backgroundColor: '#3b82f6',
  },
  contentHeader: {
    marginBottom: 12,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
    marginBottom: 10,
  },
  sortChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  chipOn: { backgroundColor: '#DBEAFE', borderColor: '#3B82F6' },
  chipOff: { backgroundColor: '#fff', borderColor: '#D1D5DB' },
  chipText: { fontSize: 12, fontWeight: '800' },
  chipTextOn: { color: '#1D4ED8' },
  chipTextOff: { color: '#374151' },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  // Edit Profile
  editAvatarSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  editAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
  },
  changePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#374151',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  changePhotoText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  // Users
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  modalUserName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  userMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  removeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
  },
  removeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#dc2626',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
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
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  textInputError: {
    borderColor: '#dc2626',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    marginTop: 4,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default ProfilePage;
