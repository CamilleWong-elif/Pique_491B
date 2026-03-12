// NotificationsModal.tsx (React Native)
import { Calendar, Heart, MessageSquare, Star, TrendingUp, Trophy, UserPlus, X } from "lucide-react-native";
import React, { useMemo } from "react";
import { FlatList, Image, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type NotificationType =
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
}

/**
 * Notes:
 * - Uses RN Modal + backdrop press to close.
 * - Uses Image for avatars (replace with your ImageWithFallback if you have RN version).
 * - Requires `lucide-react-native`.
 */
export function NotificationsModal({ isOpen, onClose, notifications, onMarkAsRead, onMarkAllAsRead, unreadCount }: Props) {
  const empty = notifications.length === 0;
  const insets = useSafeAreaInsets();

  const Icon = useMemo(() => {
    const map: Record<
      NotificationType,
      { Comp: any; color: string; fill?: boolean }
    > = {
      like: { Comp: Heart, color: "#EF4444", fill: true },
      comment: { Comp: MessageSquare, color: "#3B82F6" },
      rank_up: { Comp: TrendingUp, color: "#22C55E" },
      friend_request: { Comp: UserPlus, color: "#A855F7" },
      event_reminder: { Comp: Calendar, color: "#F97316" },
      achievement: { Comp: Trophy, color: "#EAB308" },
      friend_activity: { Comp: Star, color: "#0EA5E9" },
    };
    return map;
  }, []);

  const renderNotificationIcon = (type: NotificationType) => {
    const cfg = Icon[type] ?? { Comp: Star, color: "#6B7280" };
    const Comp = cfg.Comp;
    return (
      <Comp
        size={20}
        color={cfg.color}
        // lucide-react-native supports "fill" on some icons; safe to pass.
        // @ts-ignore
        fill={cfg.fill ? cfg.color : "none"}
      />
    );
  };

  const renderItem = ({ item }: { item: Notification }) => {
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
              <View style={styles.iconCircle}>
                {renderNotificationIcon(item.type)}
              </View>
            )}
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.message} numberOfLines={3}>
              {!!item.userName && (
                <Text style={styles.userName}>{item.userName} </Text>
              )}
              {item.message}
            </Text>

            {!!item.eventName && (
              <Text style={styles.eventName} numberOfLines={1}>
                Event: {item.eventName}
              </Text>
            )}

            <Text style={styles.timestamp}>{item.timestamp}</Text>
          </View>

          {/* Unread dot */}
          {!item.read && <View style={styles.unreadDot} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <View style={styles.backdropRoot}>
        {/* Backdrop */}
        <Pressable style={styles.backdrop} onPress={onClose} />

        {/* Sheet */}
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
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
                ItemSeparatorComponent={() => <View style={styles.sep} />}
                contentContainerStyle={styles.listContent}
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
    paddingTop: "10%",
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
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
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