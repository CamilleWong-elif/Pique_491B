// NotificationsModal.tsx (React Native)
import { Star, X } from "lucide-react-native";
import React, { memo, useCallback } from "react";
import { FlatList, Image, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type NotificationType =
  | "follow"
  | "review_like"
  | "review_comment"
  | "activity_like"
  | "activity_comment"
  | "like"
  | "comment"
  | "rank_up"
  | "friend_request"
  | "event_reminder"
  | "achievement"
  | "friend_activity";

export interface Notification {
  id: string;
  type: NotificationType;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  message: string;
  timestamp: string;
  read: boolean;
  eventName?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  unreadCount: number;
  onPressUser?: (notification: Notification) => void;
}

interface NotificationRowProps {
  item: Notification;
  onMarkAsRead: (notificationId: string) => void;
  onPressUser?: (notification: Notification) => void;
}

const NotificationRow = memo(function NotificationRow({ item, onMarkAsRead, onPressUser }: NotificationRowProps) {
  const initial = String(item.userName || "U").trim().slice(0, 1).toUpperCase() || "U";
  const canOpenUser = Boolean(item.userId && onPressUser);
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onMarkAsRead(item.id)}
      style={[styles.row, !item.read && styles.rowUnread]}
    >
      <View style={styles.rowInner}>
        {/* Avatar or icon */}
        <View style={styles.left}>
          {item.userAvatar ? (
            <View style={styles.avatarWrap}>
              <Image
                source={{ uri: item.userAvatar }}
                style={styles.avatar}
                resizeMode="cover"
              />
            </View>
          ) : (
            <View style={styles.avatarFallbackCircle}>
              <Text style={styles.avatarFallbackText}>{initial}</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.message} numberOfLines={3}>
            {!!item.userName && (
              <Text
                style={styles.userName}
                onPress={canOpenUser ? () => onPressUser?.(item) : undefined}
              >
                {item.userName}{" "}
              </Text>
            )}
            {item.message}
          </Text>

          {!!item.eventName && (
            <Text style={styles.eventName} numberOfLines={1}>
              {item.eventName}
            </Text>
          )}

          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>

        {/* Unread dot */}
        {!item.read && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );
});

/**
 * Notes:
 * - Uses RN Modal + backdrop press to close.
 * - Uses Image for avatars (replace with your ImageWithFallback if you have RN version).
 * - Requires `lucide-react-native`.
 */
export function NotificationsModal({ isOpen, onClose, notifications, onMarkAsRead, onMarkAllAsRead, unreadCount, onPressUser }: Props) {
  const empty = notifications.length === 0;
  const insets = useSafeAreaInsets();

  const renderItem = useCallback(
    ({ item }: { item: Notification }) => (
      <NotificationRow
        item={item}
        onMarkAsRead={onMarkAsRead}
        onPressUser={onPressUser}
      />
    ),
    [onMarkAsRead, onPressUser]
  );

  const renderSeparator = useCallback(() => <View style={styles.sep} />, []);

  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <View style={styles.backdropRoot}>
        {/* Backdrop */}
        <Pressable style={styles.backdrop} onPress={onClose} />

        {/* Sheet */}
        <View style={styles.sheet}>
          {/* Header */}
          <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
            <View style={styles.headerTopRow}>
              <Text style={styles.title}>Notifications</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X size={20} color="#4B5563" />
              </TouchableOpacity>
            </View>

            {unreadCount > 0 && (
              <View style={styles.headerBottomRow}>
                <Text style={styles.unreadText}>
                  {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
                </Text>
                <TouchableOpacity onPress={onMarkAllAsRead}>
                  <Text style={styles.markAll}>Mark all as read</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* List */}
          <View style={styles.list}>
            {empty ? (
              <View style={styles.empty}>
                <View style={styles.emptyCircle}>
                  <Star size={32} color="#9CA3AF" />
                </View>
                <Text style={styles.emptyTitle}>No notifications yet</Text>
                <Text style={styles.emptySubtitle}>
                  You'll see updates about your posts, friends, and rankings here
                </Text>
              </View>
            ) : (
              <FlatList
                data={notifications}
                keyExtractor={(n) => n.id}
                renderItem={renderItem}
                ItemSeparatorComponent={renderSeparator}
                contentContainerStyle={styles.listContent}
                removeClippedSubviews
                initialNumToRender={12}
                maxToRenderPerBatch={12}
                windowSize={7}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdropRoot: {
    flex: 1,
    justifyContent: "flex-start",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.40)",
  },
  sheet: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  unreadText: {
    fontSize: 14,
    color: "#4B5563",
  },
  markAll: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0284C7",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  sep: {
    height: 1,
    backgroundColor: "#F3F4F6",
  },
  row: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#fff",
  },
  rowUnread: {
    backgroundColor: "#E0F2FE", // sky-50-ish
  },
  rowInner: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  left: {
    width: 48,
  },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  avatarFallbackCircle: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFallbackText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1D4ED8",
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  message: {
    fontSize: 14,
    color: "#111827",
    lineHeight: 18,
  },
  userName: {
    fontWeight: "700",
  },
  eventName: {
    marginTop: 4,
    fontSize: 12,
    color: "#4B5563",
  },
  timestamp: {
    marginTop: 4,
    fontSize: 12,
    color: "#6B7280",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#0EA5E9",
    marginTop: 6,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyCircle: {
    width: 64,
    height: 64,
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 18,
  },
});