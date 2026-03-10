import { NavigationBar } from '@/components/NavigationBar';
import { useAuth } from '@/context/AuthContext';
import { auth, db } from '@/firebase';
import { mockUsers } from '@/mockData/mockUsers';
import { Calendar, FileText, Heart, Pencil, Plus, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Alert, FlatList, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { arrayRemove, doc, setDoc, updateDoc } from 'firebase/firestore';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1653771926391-d1b5608c90b2?w=400';

type TabType = 'posted' | 'liked' | 'booked';

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
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [sortOption, setSortOption] = useState('latest');
  const [showFollowModal, setShowFollowModal] = useState<'followers' | 'following' | null>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [editingBio, setEditingBio] = useState('');
  const [removedFollowerIds, setRemovedFollowerIds] = useState<Set<string>>(new Set());
  const [removedFollowingIds, setRemovedFollowingIds] = useState<Set<string>>(new Set());

  const userName = profile?.displayName ?? user?.displayName ?? user?.email ?? 'User';
  const profilePicture = profile?.photoURL ?? user?.photoURL ?? DEFAULT_AVATAR;
  const bio = profile?.bio ?? '';

  const followerUids: string[] = (profile?.followerCount ?? []);
  const followingUids: string[] = (profile?.followingCount ?? []);

  const followers = useMemo(() => {
    const matched = followerUids.length > 0
      ? mockUsers.filter(u => followerUids.includes(u.uid))
      : mockUsers.slice(0, 5);
    return matched.map(u => ({ id: u.uid, name: u.displayName, username: `@${u.username}`, bio: u.bio, avatar: u.avatar ?? '' }));
  }, [followerUids]);

  const following = useMemo(() => {
    const matched = followingUids.length > 0
      ? mockUsers.filter(u => followingUids.includes(u.uid))
      : mockUsers.slice(5);
    return matched.map(u => ({ id: u.uid, name: u.displayName, username: `@${u.username}`, bio: u.bio, avatar: u.avatar ?? '' }));
  }, [followingUids]);

  // Placeholder event lists — will populate when mockData is connected
  const postedEvents: any[] = [];
  const likedEvents: any[] = [];
  const bookedEvents: any[] = [];

  const activeEvents =
    activeTab === 'posted' ? postedEvents :
    activeTab === 'liked' ? likedEvents :
    bookedEvents;

  const handleEditClick = () => {
    setEditingName(userName);
    setEditingBio(bio);
    setShowEditProfile(true);
  };

  const handleSaveProfile = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    if (!editingName.trim()) {
      Alert.alert("Missing username", "Please add a username.");
      return;
    }

    await setDoc(doc(db, 'users', uid), {
      displayName: editingName.trim(),
      bio: editingBio.trim(),
      updatedAt: new Date(),
    }, { merge: true });

    setShowEditProfile(false);
  };

  const sortOptions = [
    { label: 'Latest Date', value: 'latest' },
    { label: 'Oldest First', value: 'oldest' },
    { label: 'Name (A-Z)', value: 'name-asc' },
    { label: 'Name (Z-A)', value: 'name-desc' },
    { label: 'Highest Rating', value: 'rating' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Background */}
        <View style={styles.headerBg}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => onNavigate('create')}
          >
            <Plus size={20} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.profileRow}>
            {/* Avatar */}
            <Image source={{ uri: profilePicture }} style={styles.avatar} />

            {/* Name, Bio, Stats */}
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{userName}</Text>
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
               activeTab === 'liked' ? 'Liked/Saved Events' :
               'Booked Events'}
            </Text>

            {/* Sort Picker — simplified as buttons for now */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {sortOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.sortChip, sortOption === opt.value && styles.sortChipActive]}
                  onPress={() => setSortOption(opt.value)}
                >
                  <Text style={[styles.sortChipText, sortOption === opt.value && styles.sortChipTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Event Grid — stub until EventCard is converted */}
          {activeEvents.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No events here yet</Text>
            </View>
          ) : (
            <View style={styles.eventGrid}>
              {activeEvents.map((event: any) => (
                <TouchableOpacity
                  key={event.id}
                  style={styles.eventGridItem}
                  onPress={() => onNavigate('event', event.id)}
                >
                  <Text>{event.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

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
                    <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
                  </TouchableOpacity>
                  <TouchableOpacity style={{ flex: 1, minWidth: 0 }} onPress={() => { setShowFollowModal(null); onNavigate('friendProfile', undefined, { friendName: item.id }); }}>
                    <Text style={styles.modalUserName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.userMeta} numberOfLines={1}>{item.username}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={async () => {
                      const myUid = auth.currentUser?.uid;
                      if (!myUid) return;
                      if (showFollowModal === 'followers') {
                        // Remove them from my followerCount; remove me from their followingCount
                        await updateDoc(doc(db, 'users', myUid), { followerCount: arrayRemove(item.id) });
                        await updateDoc(doc(db, 'users', item.id), { followingCount: arrayRemove(myUid) });
                        setRemovedFollowerIds(prev => new Set([...prev, item.id]));
                      } else {
                        // Remove them from my followingCount; remove me from their followerCount
                        await updateDoc(doc(db, 'users', myUid), { followingCount: arrayRemove(item.id) });
                        await updateDoc(doc(db, 'users', item.id), { followerCount: arrayRemove(myUid) });
                        setRemovedFollowingIds(prev => new Set([...prev, item.id]));
                      }
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

            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.textInput}
              value={editingName}
              onChangeText={setEditingName}
              placeholder="Enter your name"
              placeholderTextColor="#9ca3af"
              maxLength={50}
            />

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
                style={styles.saveButton}
                onPress={handleSaveProfile}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  headerBg: {
    backgroundColor: '#d1d5db',
    height: 110,
    paddingTop: 59,
    alignItems: 'flex-end',
    paddingRight: 18,
  },
  createButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 12,
    color: '#4b5563',
  },
  statNumber: {
    fontWeight: '600',
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
    gap: 40,
    paddingVertical: 16,
    borderTopWidth: 2,
    borderTopColor: '#111827',
    marginBottom: 16,
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
    marginBottom: 16,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  sortChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    marginRight: 6,
  },
  sortChipActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  sortChipText: {
    fontSize: 11,
    color: '#374151',
  },
  sortChipTextActive: {
    color: '#ffffff',
  },
  eventGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  eventGridItem: {
    width: '47%',
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
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
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});
