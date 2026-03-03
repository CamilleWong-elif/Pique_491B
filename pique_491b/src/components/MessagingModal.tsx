// MessagingModal.tsx (React Native)
// - Conversations list + chat view in a single RN Modal
// - Replying, share sheet (events/posts), theme support, chat settings modal hook-up (stub)
// - Uses lucide-react-native icons
//
// Assumptions:
// - You have RN equivalents of Conversation / Message / Event types
// - You can replace mock data imports with your real data
// - If you already have BottomNavigation in RN, plug it in; otherwise remove that block.

import { ArrowLeft, Image as ImageIcon, MoreVertical, Send, X, } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { FlatList, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ---- Types (adjust to match your app) ----
export interface Event {
  id: string;
  name: string;
  city: string;
  state: string;
  imageUrl: string;
  startDate?: string;
  endDate?: string;
}

export interface SharedPost {
  id: string;
  imageUrl: string;
  userName: string;
  userAvatar: string;
  caption?: string;
}

export interface MessageReplyTo {
  senderName: string;
  text?: string;
}

export interface Message {
  id: string;
  senderId: string; // 'current' | friendId
  text?: string;
  timestamp: Date;
  replyTo?: MessageReplyTo;
  sharedEvent?: Event;
  sharedPost?: SharedPost;
}

export interface Conversation {
  id: string;
  friendId: string;
  friendName: string;
  friendAvatar: string;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: Date;
  messages: Message[];
}

type ThemeKey = "default" | "purple" | "green" | "pink" | "orange" | "dark";

interface MessagingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;

  onNavigate: (
    page: string,
    eventId?: string,
    options?: { showPrice?: boolean; friendName?: string; fromMessages?: boolean }
  ) => void;

  unreadMessageCount?: number;

  // data
  conversations: Conversation[];
  shareEvents: Event[];
  sharePosts: SharedPost[];

  // optional settings modal
  renderChatSettings?: (args: {
    isOpen: boolean;
    onClose: () => void;
    friendName: string;
    friendAvatar: string;
    isMuted: boolean;
    isBlocked: boolean;
    muteEndTime: Date | null;
    chatTheme: ThemeKey;
    onToggleMute: (durationMinutes?: number) => void;
    onToggleBlock: () => void;
    onDeleteChat: () => void;
    onReport: () => void;
    onChangeTheme: (t: ThemeKey) => void;
  }) => React.ReactNode;
}

export function MessagingModal({ isOpen, onClose, onBack, onNavigate, conversations, shareEvents, sharePosts, renderChatSettings, }: MessagingModalProps) {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState("");
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [muteEndTime, setMuteEndTime] = useState<Date | null>(null);
  const [chatTheme, setChatTheme] = useState<ThemeKey>("default");
  const insets = useSafeAreaInsets();

  const theme = useMemo(() => {
    const themes: Record<
      ThemeKey,
      { sentBg: string; recvBg: string; bg: string; sentText: string; recvText: string }
    > = {
      default: {
        sentBg: "#3B82F6",
        recvBg: "#FFFFFF",
        bg: "#F9FAFB",
        sentText: "#FFFFFF",
        recvText: "#111827",
      },
      purple: {
        sentBg: "#A855F7",
        recvBg: "#FFFFFF",
        bg: "#FAF5FF",
        sentText: "#FFFFFF",
        recvText: "#111827",
      },
      green: {
        sentBg: "#22C55E",
        recvBg: "#FFFFFF",
        bg: "#F0FDF4",
        sentText: "#FFFFFF",
        recvText: "#111827",
      },
      pink: {
        sentBg: "#EC4899",
        recvBg: "#FFFFFF",
        bg: "#FDF2F8",
        sentText: "#FFFFFF",
        recvText: "#111827",
      },
      orange: {
        sentBg: "#F97316",
        recvBg: "#FFFFFF",
        bg: "#FFF7ED",
        sentText: "#FFFFFF",
        recvText: "#111827",
      },
      dark: {
        sentBg: "#111827",
        recvBg: "#374151",
        bg: "#0B1220",
        sentText: "#FFFFFF",
        recvText: "#FFFFFF",
      },
    };
    return themes[chatTheme] ?? themes.default;
  }, [chatTheme]);

  if (!isOpen) return null;

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays}d ago`;
  };

  const formatMessageTime = (date: Date) =>
    date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const handleToggleMute = (durationMinutes?: number) => {
    if (isMuted) {
      setIsMuted(false);
      setMuteEndTime(null);
    } else {
      setIsMuted(true);
      if (durationMinutes) {
        const end = new Date();
        end.setMinutes(end.getMinutes() + durationMinutes);
        setMuteEndTime(end);
      } else {
        setMuteEndTime(null);
      }
    }
    setIsSettingsOpen(false);
  };

  const handleToggleBlock = () => {
    setIsBlocked((v) => !v);
    setIsSettingsOpen(false);
  };

  const handleDeleteChat = () => {
    // In a real app: delete in store/backend
    setSelectedConversation(null);
    setIsSettingsOpen(false);
  };

  const handleReport = () => {
    // In a real app: show report flow
    setIsSettingsOpen(false);
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;

    // In a real app: dispatch to store/backend with reply metadata.
    // Here we just clear local composer.
    setMessageText("");
    setReplyingTo(null);
    setShowShareMenu(false);
  };

  const handleReply = (m: Message) => {
    setReplyingTo(m);
    setShowShareMenu(false);
  };

  const cancelReply = () => setReplyingTo(null);

  const handleShareEvent = (event: Event) => {
    if (!selectedConversation) return;
    // In a real app: send shared event as message
    setShowShareMenu(false);
  };

  const handleSharePost = (post: SharedPost) => {
    if (!selectedConversation) return;
    // In a real app: send shared post as message
    setShowShareMenu(false);
  };

  const Header = () => {
    if (!selectedConversation) {
      return (
        <View style={[styles.header, { paddingTop: 16}]}>
          <TouchableOpacity onPress={onBack} style={styles.headerIconBtn}>
            <ArrowLeft size={20} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Messages</Text>
          <View style={{ width: 40 }} />
        </View>
      );
    }

    return (
      <View style={[styles.header, {paddingTop: 16}]}>
        <TouchableOpacity
          onPress={() => setSelectedConversation(null)}
          style={styles.headerIconBtn}
        >
          <ArrowLeft size={20} color="#111827" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            onClose();
            onNavigate("friendProfile", undefined, {
              friendName: selectedConversation.friendName,
              fromMessages: true,
            });
          }}
          style={styles.headerAvatarWrap}
          activeOpacity={0.85}
        >
          <Image
            source={{ uri: selectedConversation.friendAvatar }}
            style={styles.headerAvatar}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            onClose();
            onNavigate("friendProfile", undefined, {
              friendName: selectedConversation.friendName,
              fromMessages: true,
            });
          }}
          style={{ flex: 1 }}
        >
          <Text style={styles.headerChatName} numberOfLines={1}>
            {selectedConversation.friendName}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIsSettingsOpen(true)}
          style={styles.headerIconBtn}
        >
          <MoreVertical size={20} color="#374151" />
        </TouchableOpacity>
      </View>
    );
  };

  const ConversationRow = ({ item }: { item: Conversation }) => {
    return (
      <View style={styles.convRow}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            onClose();
            onNavigate("friendProfile", undefined, {
              friendName: item.friendName,
              fromMessages: true,
            });
          }}
          style={{ position: "relative" }}
        >
          <Image source={{ uri: item.friendAvatar }} style={styles.convAvatar} />
          {item.unreadCount > 0 && (
            <View style={styles.convUnreadBadge}>
              <Text style={styles.convUnreadText}>
                {item.unreadCount > 99 ? "99+" : item.unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setSelectedConversation(item)}
          style={{ flex: 1 }}
        >
          <View style={styles.convTopRow}>
            <Text
              style={[
                styles.convName,
                item.unreadCount > 0 && { fontWeight: "700" },
              ]}
              numberOfLines={1}
            >
              {item.friendName}
            </Text>
            <Text style={styles.convTime}>{formatTime(item.lastMessageTime)}</Text>
          </View>

          <Text
            style={[
              styles.convPreview,
              item.unreadCount > 0 && { fontWeight: "600", color: "#374151" },
            ]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const MessageBubble = ({ m }: { m: Message }) => {
    const isCurrent = m.senderId === "current";

    return (
      <View
        style={[
          styles.msgRow,
          { justifyContent: isCurrent ? "flex-end" : "flex-start" },
        ]}
      >
        <View style={[styles.msgCol, { alignItems: isCurrent ? "flex-end" : "flex-start" }]}>
          {/* Reply snippet */}
          {!!m.replyTo && (
            <View
              style={[
                styles.replyChip,
                {
                  borderLeftColor: isCurrent ? "#60A5FA" : "#9CA3AF",
                  backgroundColor: isCurrent ? "#DBEAFE" : chatTheme === "dark" ? "#4B5563" : "#F3F4F6",
                },
              ]}
            >
              <Text style={[styles.replyName, { color: isCurrent ? "#1E3A8A" : chatTheme === "dark" ? "#E5E7EB" : "#374151" }]}>
                {m.replyTo.senderName}
              </Text>
              <Text
                style={[styles.replyText, { color: isCurrent ? "#1E3A8A" : chatTheme === "dark" ? "#D1D5DB" : "#6B7280" }]}
                numberOfLines={1}
              >
                {m.replyTo.text ?? "Shared content"}
              </Text>
            </View>
          )}

          {/* Reply button (tap-and-hold in RN is more natural) */}
          <TouchableOpacity
            activeOpacity={0.9}
            onLongPress={() => handleReply(m)}
            style={[
              styles.bubble,
              {
                backgroundColor: isCurrent ? theme.sentBg : theme.recvBg,
                borderTopRightRadius: isCurrent ? 6 : 18,
                borderTopLeftRadius: isCurrent ? 18 : 6,
              },
            ]}
          >
            {!!m.text && (
              <Text style={{ color: isCurrent ? theme.sentText : theme.recvText, fontSize: 14 }}>
                {m.text}
              </Text>
            )}

            {!!m.sharedEvent && (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  // open event detail
                  onClose();
                  onNavigate("event", m.sharedEvent?.id, { fromMessages: true });
                }}
                style={[
                  styles.sharedCard,
                  { borderColor: isCurrent ? "#3B82F6" : "#D1D5DB" },
                ]}
              >
                <View style={{ position: "relative" }}>
                  <Image source={{ uri: m.sharedEvent.imageUrl }} style={styles.sharedImage} />
                  {!!m.sharedEvent.startDate && (
                    <View style={styles.datePill}>
                      <Text style={styles.datePillText}>
                        {m.sharedEvent.endDate
                          ? `${m.sharedEvent.startDate} - ${m.sharedEvent.endDate}`
                          : m.sharedEvent.startDate}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.sharedBody}>
                  <Text style={styles.sharedTitle} numberOfLines={1}>
                    {m.sharedEvent.name}
                  </Text>
                  <Text style={styles.sharedSub} numberOfLines={1}>
                    {m.sharedEvent.city}, {m.sharedEvent.state}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {!!m.sharedPost && (
              <View
                style={[
                  styles.sharedCard,
                  { borderColor: isCurrent ? "#3B82F6" : "#D1D5DB" },
                ]}
              >
                <Image source={{ uri: m.sharedPost.imageUrl }} style={styles.sharedImage} />
                <View style={styles.sharedBody}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Image source={{ uri: m.sharedPost.userAvatar }} style={styles.postAvatar} />
                    <Text style={styles.sharedTitle} numberOfLines={1}>
                      {m.sharedPost.userName}
                    </Text>
                  </View>
                  {!!m.sharedPost.caption && (
                    <Text style={styles.sharedSub} numberOfLines={2}>
                      {m.sharedPost.caption}
                    </Text>
                  )}
                </View>
              </View>
            )}
          </TouchableOpacity>

          <Text style={[styles.msgTime, { color: chatTheme === "dark" ? "#9CA3AF" : "#6B7280" }]}>
            {formatMessageTime(m.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  const ShareMenu = () => {
    if (!showShareMenu || !selectedConversation) return null;
    return (
      <View style={styles.shareSheet}>
        <ScrollView>
          <View style={styles.shareSection}>
            <Text style={styles.shareTitle}>Share Events</Text>
            {shareEvents.slice(0, 5).map((e) => (
              <TouchableOpacity
                key={e.id}
                onPress={() => handleShareEvent(e)}
                style={styles.shareRow}
                activeOpacity={0.85}
              >
                <Image source={{ uri: e.imageUrl }} style={styles.shareThumb} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.shareRowTitle} numberOfLines={1}>
                    {e.name}
                  </Text>
                  <Text style={styles.shareRowSub} numberOfLines={1}>
                    {e.city}, {e.state}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.shareSection}>
            <Text style={styles.shareTitle}>Share Posts</Text>
            {sharePosts.map((p) => (
              <TouchableOpacity
                key={p.id}
                onPress={() => handleSharePost(p)}
                style={styles.shareRow}
                activeOpacity={0.85}
              >
                <Image source={{ uri: p.imageUrl }} style={styles.shareThumb} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.shareRowTitle} numberOfLines={1}>
                    {p.userName}
                  </Text>
                  <Text style={styles.shareRowSub} numberOfLines={1}>
                    {p.caption ?? ""}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  const Composer = () => {
    if (!selectedConversation) return null;

    return (
      <View style={styles.composerWrap}>
        {!!replyingTo && (
          <View style={styles.replyPreview}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.replyPreviewTitle} numberOfLines={1}>
                Replying to{" "}
                {replyingTo.senderId === "current"
                  ? "yourself"
                  : selectedConversation.friendName}
              </Text>
              <Text style={styles.replyPreviewBody} numberOfLines={1}>
                {replyingTo.text ?? "Shared content"}
              </Text>
            </View>
            <TouchableOpacity onPress={cancelReply} style={styles.replyClose}>
              <X size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.composerRow}>
          <TouchableOpacity
            onPress={() => setShowShareMenu((v) => !v)}
            style={[
              styles.attachBtn,
              showShareMenu && { backgroundColor: "#DBEAFE" },
            ]}
          >
            <ImageIcon size={20} color={showShareMenu ? "#2563EB" : "#374151"} />
          </TouchableOpacity>

          <TextInput
            value={messageText}
            onChangeText={setMessageText}
            placeholder={replyingTo ? "Type a reply..." : "Type a message..."}
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            returnKeyType="send"
            onSubmitEditing={handleSendMessage}
          />

          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!messageText.trim()}
            style={[
              styles.sendBtn,
              messageText.trim()
                ? { backgroundColor: "#3B82F6" }
                : { backgroundColor: "#F3F4F6" },
            ]}
          >
            <Send size={20} color={messageText.trim() ? "#FFFFFF" : "#9CA3AF"} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const ChatView = () => {
    if (!selectedConversation) return null;

    return (
      <View style={[styles.chatArea, { backgroundColor: theme.bg }]}>
        <FlatList
          data={selectedConversation.messages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => <MessageBubble m={item} />}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 14, paddingBottom: 170 }}
        />
        <ShareMenu />
        <Composer />
      </View>
    );
  };

  const ConversationsList = () => (
    <View style={{ flex: 1 }}>
      <FlatList
        data={conversations}
        keyExtractor={(c) => c.id}
        renderItem={({ item }) => <ConversationRow item={item} />}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );

  return (
    <Modal visible={isOpen} animationType="fade" transparent>
      <View style={styles.modalRoot}>
        {/* Backdrop */}
        <Pressable style={styles.backdrop} onPress={onClose} />

        {/* Window */}
        <View style={styles.window}>
          <Header />
          {!selectedConversation ? <ConversationsList /> : <ChatView />}

          {/* Optional: Render your existing ChatSettingsModal via render prop */}
          {!!renderChatSettings &&
            isSettingsOpen &&
            !!selectedConversation &&
            renderChatSettings({
              isOpen: isSettingsOpen,
              onClose: () => setIsSettingsOpen(false),
              friendName: selectedConversation.friendName,
              friendAvatar: selectedConversation.friendAvatar,
              isMuted,
              isBlocked,
              muteEndTime,
              chatTheme,
              onToggleMute: handleToggleMute,
              onToggleBlock: handleToggleBlock,
              onDeleteChat: handleDeleteChat,
              onReport: handleReport,
              onChangeTheme: setChatTheme,
            })}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.50)",
  },
  window: {
    width: "100%",
    maxWidth: 430,
    height: "100%",
    maxHeight: 932,
    backgroundColor: "#FFFFFF",
    borderRadius: 0,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },

  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
  },
  headerAvatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
  },
  headerAvatar: {
    width: "100%",
    height: "100%",
  },
  headerChatName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },

  convRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "#fff",
  },
  convAvatar: {
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
  },
  convUnreadBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 999,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },
  convUnreadText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  convTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 2,
  },
  convName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  convTime: {
    fontSize: 12,
    color: "#6B7280",
  },
  convPreview: {
    fontSize: 13,
    color: "#6B7280",
  },

  chatArea: {
    flex: 1,
  },

  msgRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  msgCol: {
    maxWidth: "78%",
    gap: 6,
  },
  replyChip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderLeftWidth: 3,
  },
  replyName: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 2,
  },
  replyText: {
    fontSize: 12,
  },

  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  msgTime: {
    fontSize: 11,
    paddingHorizontal: 6,
  },

  sharedCard: {
    marginTop: 10,
    borderWidth: 2,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  sharedImage: {
    width: "100%",
    height: 128,
    backgroundColor: "#E5E7EB",
  },
  datePill: {
    position: "absolute",
    left: 8,
    bottom: 8,
    backgroundColor: "rgba(0,0,0,0.70)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  datePillText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  sharedBody: {
    padding: 10,
    gap: 4,
  },
  sharedTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  sharedSub: {
    fontSize: 12,
    color: "#6B7280",
  },
  postAvatar: {
    width: 22,
    height: 22,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
  },

  shareSheet: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 92,
    maxHeight: 320,
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    overflow: "hidden",
  },
  shareSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  shareTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
    color: "#111827",
  },
  shareRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  shareThumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
  },
  shareRowTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  shareRowSub: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },

  composerWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#fff",
    paddingBottom: 12,
  },
  replyPreview: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  replyPreviewTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 2,
  },
  replyPreviewBody: {
    fontSize: 12,
    color: "#6B7280",
  },
  replyClose: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  composerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  attachBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#fff",
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
});