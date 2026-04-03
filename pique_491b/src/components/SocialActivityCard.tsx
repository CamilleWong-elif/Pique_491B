// SocialActivityCard.tsx
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Modal,
  FlatList,
  Dimensions,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Send,
} from "lucide-react-native";

type Comment = {
  id: string;
  userName: string;
  userAvatar?: string;
  text: string;
  timestamp: string | number | Date;
};

export type SocialActivity = {
  id: string;
  action: "going" | "interested" | "rated";
  userName: string;
  userAvatar?: string;
  authorId?: string;
  eventName?: string;
  eventLocation?: string;
  rating?: number;
  reviewText?: string;
  reviewImages?: string[]; // array of image URLs
  timestamp: string | number | Date;
  isLiked?: boolean;
  isSaved?: boolean;
  likes: number;
  comments: Comment[];
};

type Props = {
  activity: SocialActivity;
  onClick: () => void;
  onFriendClick?: (friendName: string) => void;
  onLike?: (activityId: string, liked: boolean) => void;
  onSave?: (activityId: string, saved: boolean) => void;
  onPostComment?: (activityId: string, text: string) => void;
  onPostReply?: (activityId: string, commentId: string, text: string) => void;
  onDelete?: (activityId: string) => void;
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function SocialActivityCard({
  activity,
  onClick,
  onFriendClick,
  onLike,
  onSave,
  onPostComment,
  onPostReply,
  onDelete,
}: Props) {
  const { profile } = useAuth();
  const { user } = useAuth();
  const isOwner = !!activity.authorId && activity.authorId === user?.uid;
  const [isLiked, setIsLiked] = useState<boolean>(!!activity.isLiked);
  const [isSaved, setIsSaved] = useState<boolean>(!!activity.isSaved);
  const [localLikes, setLocalLikes] = useState<number>(activity.likes || 0);
  const [showComments, setShowComments] = useState<boolean>(false);
  const [localCommentCount, setLocalCommentCount] = useState<number>(activity.comments.length);

  // Gallery state
  const [galleryOpen, setGalleryOpen] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [blackBackdrop, setBlackBackdrop] = useState<boolean>(false);

  // Comments / replies
  const [commentText, setCommentText] = useState<string>("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>("");

  const flatListRef = useRef<FlatList<string> | null>(null);

  const toggleLike = () => {
    const next = !isLiked;
    setIsLiked(next);
    setLocalLikes((l) => (next ? l + 1 : Math.max(0, l - 1)));
    onLike?.(activity.id, next);
  };

  const toggleSave = () => {
    const next = !isSaved;
    setIsSaved(next);
    onSave?.(activity.id, next);
  };

  const openGallery = (index = 0) => {
    setCurrentIndex(index);
    setGalleryOpen(true);
    setBlackBackdrop(false);
  };

  const closeGallery = () => {
    setGalleryOpen(false);
    setBlackBackdrop(true); // reset preference for next open
    // small delay to reset to initial state for white backdrop on next open if desired
    setTimeout(() => setBlackBackdrop(true), 10);
  };

  const nextImage = () => {
    if (!activity.reviewImages) return;
    if (currentIndex < activity.reviewImages.length - 1) {
      setCurrentIndex((i) => i + 1);
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    }
  };

  const previousImage = () => {
    if (!activity.reviewImages) return;
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      flatListRef.current?.scrollToIndex({ index: currentIndex - 1, animated: true });
    }
  };

  const onPostLocalComment = () => {
    if (!commentText.trim()) return;
    onPostComment?.(activity.id, commentText.trim());
    setLocalCommentCount((c) => c + 1);
    setCommentText("");
  };

  const onStartReply = (commentId: string) => {
    setReplyingTo(commentId);
    setReplyText("");
  };

  const onPostLocalReply = (commentId: string) => {
    if (!replyText.trim()) return;
    onPostReply?.(activity.id, commentId, replyText.trim());
    // optimistic clear
    setReplyText("");
    setReplyingTo(null);
  };

  const formatTimestamp = (date: string | number | Date) => {
    const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return "yesterday";
    return `${diffDays}d`;
  };

  const renderActionText = () => {
    if (activity.action === "going") {
      return (
        <Text style={styles.actionText}>
          <Text
            style={styles.friendName}
            onPress={() => onFriendClick?.(activity.userName)}
          >
            {activity.userName}
          </Text>
          <Text> is going to </Text>
          <Text style={styles.eventName} onPress={onClick}>
            {activity.eventName}
          </Text>
        </Text>
      );
    }
    if (activity.action === "interested") {
      return (
        <Text style={styles.actionText}>
          <Text
            style={styles.friendName}
            onPress={() => onFriendClick?.(activity.userName)}
          >
            {activity.userName}
          </Text>
          <Text> is interested in </Text>
          <Text style={styles.eventName} onPress={onClick}>
            {activity.eventName}
          </Text>
        </Text>
      );
    }
    // rated
    return (
      <View>
        <Text style={[styles.actionText, { marginBottom: 6 }]}>
          <Text
            style={styles.friendName}
            onPress={() => onFriendClick?.(activity.userName)}
          >
            {activity.userName}
          </Text>
          <Text> ranked </Text>
          <Text style={styles.eventName} onPress={onClick}>
            {activity.eventName}
          </Text>
        </Text>
        {activity.eventLocation ? (
          <Text style={styles.locationText}>📍 {activity.eventLocation}</Text>
        ) : null}
      </View>
    );
  };

  // RENDER
  return (
    <View style={styles.container}>
      {/* Gallery modal (for rated activities with images) */}
      <Modal visible={galleryOpen} animationType="fade" transparent={false}>
        <View style={[styles.modalRoot, blackBackdrop ? styles.modalBlack : styles.modalWhite]}>
          {/* Top bar */}
          <View style={styles.modalTop}>
            <TouchableOpacity onPress={closeGallery} style={styles.iconBtn}>
              <ChevronLeft size={24} color={blackBackdrop ? "#fff" : "#111"} />
            </TouchableOpacity>
            {!blackBackdrop && (
              <Text style={styles.modalTitle}>{activity.eventName}</Text>
            )}
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.modalContent}>
            {activity.reviewImages && (
              <>
                <FlatList
                  ref={(r) => { flatListRef.current = r; }}
                  data={activity.reviewImages}
                  keyExtractor={(_, i) => String(i)}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  initialScrollIndex={currentIndex}
                  getItemLayout={(_, index) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * index, index })}
                  onMomentumScrollEnd={(e) => {
                    const ix = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                    setCurrentIndex(ix);
                  }}
                  renderItem={({ item }) => (
                    <View style={styles.modalImageWrap}>
                      <Image source={{ uri: item }} style={styles.modalImage} resizeMode="contain" />
                    </View>
                  )}
                />

                {/* Prev/Next controls */}
                {currentIndex > 0 && (
                  <TouchableOpacity style={styles.prevBtn} onPress={previousImage}>
                    <ChevronLeft size={32} color={blackBackdrop ? "#fff" : "#111"} />
                  </TouchableOpacity>
                )}
                {activity.reviewImages.length - 1 > currentIndex && (
                  <TouchableOpacity style={styles.nextBtn} onPress={nextImage}>
                    <ChevronRight size={32} color={blackBackdrop ? "#fff" : "#111"} />
                  </TouchableOpacity>
                )}

                {/* Bottom info on white backdrop */}
                {!blackBackdrop && (
                  <View style={styles.modalBottom}>
                    <View style={styles.modalUserRow}>
                      <View style={styles.avatarFallback}>
                        {activity.userAvatar ? (
                          <Image source={{ uri: activity.userAvatar }} style={styles.modalAvatar} />
                        ) : (
                          <Text style={styles.modalAvatarText}>
                            {activity.userName.slice(0, 2).toUpperCase()}
                          </Text>
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.modalUserName}>{activity.userName}</Text>
                        <Text style={styles.modalDate}>
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>

                    {activity.reviewText ? (
                      <Text style={styles.modalCaption}>{activity.reviewText}</Text>
                    ) : null}

                    {activity.reviewImages.length > 1 && (
                      <View style={styles.dotsRow}>
                        {activity.reviewImages.map((_, i) => (
                          <View
                            key={i}
                            style={[
                              styles.dot,
                              i === currentIndex ? styles.dotActive : undefined,
                            ]}
                          />
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Header row (avatar + action text + rating) */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => onFriendClick?.(activity.userName)}
          style={styles.avatarWrap}
        >
          {activity.userAvatar ? (
            <Image source={{ uri: activity.userAvatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarFallbackText}>
                {activity.userName.slice(0, 2).toUpperCase()}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.headerContent}>{renderActionText()}</View>

        {typeof activity.rating === "number" ? (
          <View style={[styles.ratingPill, getRatingColors(activity.rating)]}>
            <Text style={styles.ratingText}>{activity.rating.toFixed(1)}</Text>
          </View>
        ) : null}
      </View>

      {/* Images row */}
      {activity.reviewImages && activity.reviewImages.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesRow}>
          {activity.reviewImages.map((img, idx) => (
            <TouchableOpacity key={idx} onPress={() => openGallery(idx)} style={styles.thumbWrap}>
              <Image source={{ uri: img }} style={styles.thumb} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Review text */}
      {activity.reviewText ? (
        <Text style={styles.reviewText}>
          <Text style={styles.notesLabel}>Notes: </Text>
          {activity.reviewText}
        </Text>
      ) : null}

      {/* Interaction buttons */}
      <View style={styles.actionsRow}>
        <View style={styles.leftActions}>
          <TouchableOpacity onPress={toggleLike} style={styles.actionBtn}>
            <Heart size={20} color={isLiked ? "#ef4444" : "#374151"} fill={isLiked ? "#ef4444" : "none"} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowComments((s) => !s)} style={styles.actionBtn}>
            <MessageCircle size={20} color="#374151" />
          </TouchableOpacity>
        </View>

        <View style={styles.rightActions}>
          <TouchableOpacity onPress={toggleSave} style={styles.actionBtn}>
            <Bookmark size={20} color={isSaved ? "#111827" : "#374151"} />
          </TouchableOpacity>
          {isOwner && (
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  "Delete Review",
                  "Are you sure you want to delete this review?",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Delete", style: "destructive", onPress: () => onDelete?.(activity.id) },
                  ]
                )
              }
              style={styles.actionBtn}
            >
              <Trash2 size={20} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Likes/comments summary */}
      <TouchableOpacity onPress={() => setShowComments((s) => !s)}>
        <Text style={styles.metaText}>
          {localLikes} {localLikes === 1 ? "like" : "likes"} · {localCommentCount}{" "}
          {localCommentCount === 1 ? "comment" : "comments"}
        </Text>
      </TouchableOpacity>

      {/* Comments area */}
      {showComments && activity.comments.length > 0 && (
        <View style={styles.commentsWrap}>
          {activity.comments.map((c) => (
            <View key={c.id} style={styles.commentRow}>
              <TouchableOpacity onPress={() => onFriendClick?.(c.userName)} style={styles.commentAvatarWrap}>
                {c.userAvatar ? (
                  <Image source={{ uri: c.userAvatar }} style={styles.commentAvatar} />
                ) : (
                  <View style={styles.commentAvatarFallback}>
                    <Text style={styles.commentAvatarText}>{c.userName.slice(0, 2).toUpperCase()}</Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.commentContent}>
                <Text style={styles.commentText}>
                  <Text style={styles.commentUser} onPress={() => onFriendClick?.(c.userName)}>
                    {c.userName}
                  </Text>{" "}
                  <Text style={styles.commentBody}>{c.text}</Text>
                </Text>

                <View style={styles.commentMetaRow}>
                  <Text style={styles.commentTime}>{formatTimestamp(c.timestamp)}</Text>
                  <TouchableOpacity onPress={() => onStartReply(c.id)}>
                    <Text style={styles.replyButton}>Reply</Text>
                  </TouchableOpacity>
                </View>

                {replyingTo === c.id && (
                  <View style={styles.replyRow}>
                    <TextInput
                      style={styles.replyInput}
                      value={replyText}
                      onChangeText={setReplyText}
                      placeholder={`Reply to ${c.userName}...`}
                      multiline={false}
                    />
                    <TouchableOpacity
                      onPress={() => onPostLocalReply(c.id)}
                      disabled={!replyText.trim()}
                      style={[styles.sendBtn, !replyText.trim() && styles.sendBtnDisabled]}
                    >
                      <Send size={16} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { setReplyingTo(null); setReplyText(""); }}>
                      <Text style={styles.cancelReply}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Comment input */}
      {showComments && (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.commentInputRow}>
            <View style={styles.youAvatar}>
              {profile?.photoURL ? (
                <Image source={{ uri: profile.photoURL }} style={styles.youAvatarImg} />
              ) : (
                <View style={styles.youAvatarFallback}>
                  <Text style={styles.youAvatarText}>
                    {(profile?.displayName || "?").slice(0, 2).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <TextInput
              style={styles.commentInput}
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Add a comment..."
              returnKeyType="send"
              onSubmitEditing={onPostLocalComment}
            />
            <TouchableOpacity onPress={onPostLocalComment} disabled={!commentText.trim()} style={[styles.sendBtn, !commentText.trim() && styles.sendBtnDisabled]}>
              <Send size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

/* Helper to get rating color classes approx */
function getRatingColors(rating: number) {
  if (rating >= 4) {
    return { backgroundColor: "#ECFDF5", borderColor: "#34D399", color: "#065F46" };
  }
  if (rating >= 2) {
    return { backgroundColor: "#FFFBEB", borderColor: "#FBBF24", color: "#92400E" };
  }
  return { backgroundColor: "#FEE2E2", borderColor: "#F87171", color: "#7F1D1D" };
}

const styles = StyleSheet.create({
  container: { marginBottom: 18, backgroundColor: "#fff", padding: 12, borderRadius: 10 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatarWrap: { width: 50, height: 50, borderRadius: 25, overflow: "hidden", backgroundColor: "#E5E7EB" },
  avatar: { width: "100%", height: "100%" },
  avatarFallback: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#D1D5DB", alignItems: "center", justifyContent: "center" },
  avatarFallbackText: { color: "#374151", fontWeight: "800" },
  headerContent: { flex: 1, minWidth: 0 },
  actionText: { fontSize: 14, color: "#111827" },
  friendName: { fontWeight: "700", color: "#0f172a" },
  eventName: { fontWeight: "800", color: "#0ea5e9" },
  locationText: { fontSize: 12, color: "#6B7280", marginTop: 4 },

  ratingPill: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  ratingText: { fontWeight: "800", fontSize: 16 },

  imagesRow: { marginTop: 10, marginBottom: 10 },
  thumbWrap: { width: 150, height: 150, borderRadius: 12, overflow: "hidden", marginRight: 8 },
  thumb: { width: "100%", height: "100%" },

  reviewText: { marginTop: 6, fontSize: 13, color: "#111827" },
  notesLabel: { fontWeight: "800" },

  actionsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  leftActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  rightActions: { flexDirection: "row", alignItems: "center" },
  actionBtn: { padding: 6 },

  metaText: { marginTop: 8, color: "#6B7280", fontSize: 12 },

  commentsWrap: { marginTop: 10, borderTopWidth: 1, borderTopColor: "#E5E7EB", paddingTop: 10 },
  commentRow: { flexDirection: "row", marginBottom: 12, gap: 8 },

  commentAvatarWrap: { width: 36, height: 36, borderRadius: 18, overflow: "hidden", backgroundColor: "#E5E7EB" },
  commentAvatar: { width: "100%", height: "100%" },
  commentAvatarFallback: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#D1D5DB", alignItems: "center", justifyContent: "center" },
  commentAvatarText: { color: "#374151", fontWeight: "700" },

  commentContent: { flex: 1 },
  commentUser: { fontWeight: "800", color: "#111827" },
  commentBody: { color: "#111827" },
  commentText: { fontSize: 13, color: "#111827" },
  commentMetaRow: { flexDirection: "row", gap: 12, marginTop: 6, alignItems: "center" },
  commentTime: { fontSize: 11, color: "#6B7280" },
  replyButton: { fontSize: 12, color: "#2563EB" },

  replyRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  replyInput: { flex: 1, borderWidth: 1, borderColor: "#E5E7EB", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, fontSize: 13 },
  sendBtn: { backgroundColor: "#2563EB", padding: 8, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  sendBtnDisabled: { backgroundColor: "#9CA3AF" },
  cancelReply: { fontSize: 12, color: "#6B7280", marginLeft: 8 },

  commentInputRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 },
  youAvatar: { width: 36, height: 36, borderRadius: 18, overflow: "hidden", backgroundColor: "#E5E7EB" },
  youAvatarImg: { width: "100%", height: "100%" },
  youAvatarFallback: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#D1D5DB", alignItems: "center", justifyContent: "center" },
  youAvatarText: { color: "#374151", fontWeight: "700" },

  commentInput: { flex: 1, borderWidth: 1, borderColor: "#E5E7EB", paddingHorizontal: 12, paddingVertical: Platform.OS === "ios" ? 10 : 6, borderRadius: 20, fontSize: 13 },

  /* Modal styles */
  modalRoot: { flex: 1, backgroundColor: "#fff" },
  modalWhite: { backgroundColor: "#fff" },
  modalBlack: { backgroundColor: "#000" },
  modalTop: { paddingTop: Platform.OS === "android" ? 20 : 40, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  modalTitle: { fontSize: 17, fontWeight: "800", textAlign: "center" },
  modalContent: { flex: 1 },
  modalImageWrap: { width: SCREEN_WIDTH, alignItems: "center", justifyContent: "center", padding: 16 },
  modalImage: { width: SCREEN_WIDTH, height: "80%" },

  prevBtn: { position: "absolute", left: 8, top: "50%", transform: [{ translateY: -24 }] },
  nextBtn: { position: "absolute", right: 8, top: "50%", transform: [{ translateY: -24 }] },

  modalBottom: { padding: 16 },
  modalUserRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  modalAvatar: { width: 44, height: 44, borderRadius: 22 },
  modalAvatarText: { color: "#374151", fontWeight: "800" },
  modalUserName: { fontWeight: "800", fontSize: 15 },
  modalDate: { color: "#6B7280", fontSize: 12 },
  modalCaption: { fontSize: 15, color: "#111827", marginTop: 6 },

  dotsRow: { flexDirection: "row", justifyContent: "center", marginTop: 12, gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#E5E7EB", marginHorizontal: 4 },
  dotActive: { backgroundColor: "#2563EB" },
});