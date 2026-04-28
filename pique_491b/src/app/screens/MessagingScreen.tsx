import { ArrowLeft, ImagePlus, Paperclip, Send, X, FileText, Download, Reply, Search, Calendar } from 'lucide-react-native';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { resolveAvatarUrl } from '@/utils/avatar';

import {
  collection,
  doc,
  onSnapshot,
  query,
  getDoc,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db, storage, auth } from '../../firebase';
import { apiStartConversation } from '@/api';

type Conversation = {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  sortTime: number;
  unread?: number;
};

type ReplyRef = {
  id: string;
  text: string;
  senderName: string;
};

type EventAttachment = {
  id: string;
  name: string;
  imageUrl?: string;
  location?: string;
  date?: string;
};

type Message = {
  id: string;
  text: string;
  fromMe: boolean;
  timestamp: string;
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
  replyTo?: ReplyRef;
  eventAttachment?: EventAttachment;
};

interface MessagingScreenProps {
  onBack: () => void;
  openWithUserId?: string;
  onNavigate?: (page: string, eventId?: string) => void;
}

export function MessagingScreen({ onBack, openWithUserId, onNavigate }: MessagingScreenProps) {
  const currentUid = auth.currentUser?.uid ?? '';
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Event Picker State
  const [isEventPickerVisible, setIsEventPickerVisible] = useState(false);
  const [likedEvents, setLikedEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const flatListRef = useRef<FlatList>(null);

  const filteredConversations = conversations.filter((c) => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Listen for conversations the current user participates in
  useEffect(() => {
    if (!currentUid) return;

    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', currentUid),
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const fetched: Conversation[] = await Promise.all(snapshot.docs.map(async (chatDoc) => {
        const data = chatDoc.data();
        const participantIds: string[] = data.participants || [];
        const otherUserIds = participantIds.filter((id: string) => id !== currentUid);

        // Fetch profiles for other participants
        const otherUsersProfiles = await Promise.all(
          otherUserIds.map(async (uid) => {
            if (data.users && data.users[uid]) {
              return data.users[uid];
            }
            try {
              const userSnap = await getDoc(doc(db, 'users', uid));
              return userSnap.exists() ? userSnap.data() : { displayName: 'Unknown User' };
            } catch {
              return { displayName: 'Unknown User' };
            }
          })
        );

        const chatName = otherUsersProfiles.map(u => u.displayName).join(', ') || data.name || 'Unknown';
        const chatAvatar = otherUsersProfiles.length === 1
          ? (resolveAvatarUrl(otherUsersProfiles[0] as Record<string, unknown>) || undefined)
          : undefined;

        const ts = data.updatedAt || data.lastMessageAt;
        let timeStr = '';
        let sortTime = 0;
        if (ts) {
          const d = typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts);
          timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          sortTime = d.getTime();
        }

        return {
          id: chatDoc.id,
          name: chatName,
          avatar: chatAvatar,
          lastMessage: data.lastMessage || '',
          timestamp: timeStr,
          sortTime,
        };
      }));

      fetched.sort((a, b) => b.sortTime - a.sortTime);
      setConversations(fetched);
    }, (error) => {
      console.error("Error fetching conversations:", error);
    });

    return () => unsubscribe();
  }, [currentUid]);

  // Auto-open conversation with a specific user
  useEffect(() => {
    if (!openWithUserId || !currentUid) return;

    const openConversation = async () => {
      setLoading(true);
      try {
        const result = await apiStartConversation(openWithUserId);
        const convoId = result.id;

        let friendName = 'Unknown';
        let friendAvatar: string | undefined;
        try {
          const userDoc = await getDoc(doc(db, 'users', openWithUserId));
          if (userDoc.exists()) {
            const ud = userDoc.data();
            friendName = ud.displayName || ud.username || 'Unknown';
            friendAvatar = resolveAvatarUrl(ud as Record<string, unknown>) || undefined;
          }
        } catch { /* fallback */ }

        setActiveConvo({
          id: convoId,
          name: friendName,
          avatar: friendAvatar,
          lastMessage: '',
          timestamp: '',
          sortTime: Date.now(),
        });
      } catch (err) {
        console.error('Failed to open conversation:', err);
        Alert.alert('Error', 'Could not start conversation. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    openConversation();
  }, [openWithUserId, currentUid]);

  // Listen for messages in active conversation
  useEffect(() => {
    if (!activeConvo) return;

    const messagesRef = collection(db, 'chats', activeConvo.id, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        const ts = data.createdAt || data.timestamp;
        let timeStr = 'Now';
        if (ts) {
          const d = typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts);
          timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return {
          id: docSnap.id,
          text: data.text || '',
          fromMe: data.senderId === currentUid,
          timestamp: timeStr,
          imageUrl: data.imageUrl || undefined,
          fileUrl: data.fileUrl || undefined,
          fileName: data.fileName || undefined,
          replyTo: data.replyTo || undefined,
          eventAttachment: data.eventAttachment || undefined,
        };
      });
      setMessages(fetchedMessages);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }, (error) => {
      console.error("Error fetching messages:", error);
    });

    return () => unsubscribe();
  }, [activeConvo, currentUid]);

  // Upload a file/image to Firebase Storage
  const uploadToStorage = async (uri: string, fileName: string): Promise<string> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `chat-attachments/${activeConvo!.id}/${Date.now()}_${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, blob);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        null,
        (error) => reject(error),
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        }
      );
    });
  };

  // Send a message
  const sendMessage = async (opts?: { imageUrl?: string; fileUrl?: string; fileName?: string; eventAttachment?: EventAttachment }) => {
    const textToSend = inputText.trim();
    const hasContent = textToSend || opts?.imageUrl || opts?.fileUrl || opts?.eventAttachment;
    if (!hasContent || !activeConvo || !currentUid) return;

    const currentReply = replyTo;
    setInputText('');
    setReplyTo(null);

    try {
      const batch = writeBatch(db);

      const messagesCollectionRef = collection(db, 'chats', activeConvo.id, 'messages');
      const newMessageRef = doc(messagesCollectionRef);

      const messageData: Record<string, any> = {
        senderId: currentUid,
        createdAt: serverTimestamp(),
        read: false,
      };
      if (textToSend) messageData.text = textToSend;
      if (opts?.imageUrl) messageData.imageUrl = opts.imageUrl;
      if (opts?.fileUrl) {
        messageData.fileUrl = opts.fileUrl;
        messageData.fileName = opts.fileName || 'file';
      }
      if (opts?.eventAttachment) {
        messageData.eventAttachment = opts.eventAttachment;
      }
      if (currentReply) {
        messageData.replyTo = {
          id: currentReply.id,
          text: currentReply.text || (currentReply.imageUrl ? 'Photo' : currentReply.fileName || 'File'),
          senderName: currentReply.fromMe ? 'You' : activeConvo.name,
        };
      }

      batch.set(newMessageRef, messageData);

      const chatRef = doc(db, 'chats', activeConvo.id);
      const lastMsg = textToSend || 
        (opts?.eventAttachment ? `Shared an event: ${opts.eventAttachment.name}` : 
        (opts?.imageUrl ? 'Photo' : 
        (opts?.fileName || 'File')));

      batch.update(chatRef, {
        lastMessage: lastMsg,
        updatedAt: serverTimestamp(),
      });

      await batch.commit();
    } catch (error) {
      console.error("Failed to send message:", error);
      Alert.alert('Send failed', 'Could not send message. Please try again.');
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant photo library access to send images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], 
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) return;

    setUploading(true);
    try {
      // Step 1: Upload all images first
      const uploadedUrls: string[] = [];
      for (const asset of result.assets) {
        const fileName = asset.fileName || `image_${Date.now()}.jpg`;
        const downloadUrl = await uploadToStorage(asset.uri, fileName);
        uploadedUrls.push(downloadUrl);
      }
      // Step 2: Send messages with URLs sequentially
      for (const url of uploadedUrls) {
        await sendMessage({ imageUrl: url });
      }
    } catch (err) {
      console.error('Image upload error:', err);
      Alert.alert('Upload failed', 'Could not upload some images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ 
        type: '*/*',
        multiple: true,
      });
      
      if (result.canceled || !result.assets || result.assets.length === 0) return;

      setUploading(true);
      try {
        // Step 1: Upload all files first
        const uploadedFiles: {url: string, name: string}[] = [];
        for (const asset of result.assets) {
          const fileName = asset.name || `file_${Date.now()}`;
          const downloadUrl = await uploadToStorage(asset.uri, fileName);
          uploadedFiles.push({url: downloadUrl, name: fileName});
        }
        // Step 2: Send messages with file URLs sequentially
        for (const file of uploadedFiles) {
          await sendMessage({ fileUrl: file.url, fileName: file.name });
        }
      } catch (err) {
        console.error('File upload error:', err);
        Alert.alert('Upload failed', 'Could not upload some files. Please try again.');
      } finally {
        setUploading(false);
      }
    } catch (err) {
      console.error('Document picker error:', err);
    }
  };

  // Open Event Picker & Fetch Liked Events
  const openEventPicker = async () => {
    setIsEventPickerVisible(true);
    setLoadingEvents(true);
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUid));
      const likedEventIds = userDoc.data()?.likedEvents || [];

      if (likedEventIds.length > 0) {
        const eventPromises = likedEventIds.map((id: string) => getDoc(doc(db, 'events', id)));
        const eventSnaps = await Promise.all(eventPromises);
        const fetched = eventSnaps
          .filter(snap => snap.exists())
          .map(snap => ({ id: snap.id, ...snap.data() }));
        setLikedEvents(fetched);
      } else {
        setLikedEvents([]);
      }
    } catch (error) {
      console.error("Error fetching liked events:", error);
      Alert.alert("Error", "Could not load your liked events.");
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleSendEvent = (event: any) => {
    setIsEventPickerVisible(false);

    // Format date string gracefully
    let dateStr = '';
    const rawDate = event.date || event.startDate;
    if (rawDate) {
      if (typeof rawDate?.toDate === 'function') {
        dateStr = rawDate.toDate().toLocaleDateString();
      } else if (rawDate instanceof Date) {
        dateStr = rawDate.toLocaleDateString();
      } else {
        dateStr = new Date(rawDate).toLocaleDateString();
      }
    }

    const eventAttachment: EventAttachment = {
      id: event.id,
      name: event.name || 'Untitled Event',
      imageUrl: event.imageUrl || event.image || (event.photos?.[0]) || '',
      location: event.city || event.location || '',
      date: dateStr && dateStr !== 'Invalid Date' ? dateStr : '', 
    };

    sendMessage({ eventAttachment });
  };

  const handleReply = useCallback((message: Message) => {
    setReplyTo(message);
    inputRef.current?.focus();
  }, []);

  const renderReplyPreview = (reply: ReplyRef, fromMe: boolean) => (
    <View style={[styles.replyInBubble, fromMe ? styles.replyInBubbleMe : styles.replyInBubbleThem]}>
      <Text style={[styles.replyInBubbleName, fromMe && styles.replyInBubbleNameMe]} numberOfLines={1}>
        {reply.senderName}
      </Text>
      <Text style={[styles.replyInBubbleText, fromMe && styles.replyInBubbleTextMe]} numberOfLines={2}>
        {reply.text}
      </Text>
    </View>
  );

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageBubbleWrap, item.fromMe && styles.messageBubbleWrapMe]}>
      <View style={[styles.bubble, item.fromMe ? styles.bubbleMe : styles.bubbleThem]}>
        {/* Reply reference */}
        {item.replyTo && renderReplyPreview(item.replyTo, item.fromMe)}

        {/* Event Attachment Card */}
        {item.eventAttachment && (
          <TouchableOpacity 
            style={[styles.eventMsgCard, item.fromMe ? styles.eventMsgCardMe : styles.eventMsgCardThem]} 
            onPress={() => onNavigate?.('event', item.eventAttachment!.id)}
            activeOpacity={0.8}
          >
            {item.eventAttachment.imageUrl ? (
              <Image source={{ uri: item.eventAttachment.imageUrl }} style={styles.eventMsgImg} resizeMode="cover" />
            ) : (
              <View style={styles.eventMsgImgPlaceholder}>
                <Calendar size={24} color={item.fromMe ? "#9ca3af" : "#6b7280"} />
              </View>
            )}
            <View style={styles.eventMsgInfo}>
              <Text style={[styles.eventMsgName, item.fromMe && styles.eventMsgTextMe]} numberOfLines={2}>
                {item.eventAttachment.name}
              </Text>
              {(item.eventAttachment.date || item.eventAttachment.location) && (
                <Text style={[styles.eventMsgSub, item.fromMe && styles.eventMsgSubMe]} numberOfLines={1}>
                  {item.eventAttachment.date} {item.eventAttachment.date && item.eventAttachment.location ? '•' : ''} {item.eventAttachment.location}
                </Text>
              )}
              <Text style={[styles.eventMsgTapText, item.fromMe && styles.eventMsgSubMe]}>Tap to view details</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Inline image */}
        {item.imageUrl && !item.eventAttachment ? (
          <TouchableOpacity onPress={() => Linking.openURL(item.imageUrl!)} activeOpacity={0.8}>
            <Image source={{ uri: item.imageUrl }} style={styles.chatImage} resizeMode="cover" />
          </TouchableOpacity>
        ) : null}

        {/* File attachment */}
        {item.fileUrl && !item.imageUrl && !item.eventAttachment ? (
          <TouchableOpacity style={styles.fileRow} onPress={() => Linking.openURL(item.fileUrl!)}>
            <FileText size={20} color={item.fromMe ? '#93c5fd' : '#3b82f6'} />
            <Text
              style={[styles.fileName, item.fromMe && styles.fileNameMe]}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {item.fileName || 'File'}
            </Text>
            <Download size={16} color={item.fromMe ? '#93c5fd' : '#3b82f6'} />
          </TouchableOpacity>
        ) : null}

        {/* Text */}
        {item.text ? (
          <Text style={[styles.bubbleText, item.fromMe && styles.bubbleTextMe]}>{item.text}</Text>
        ) : null}
      </View>

      {/* Reply button + timestamp row */}
      <View style={[styles.messageFooter, item.fromMe && styles.messageFooterMe]}>
        <TouchableOpacity 
          onLongPress={() => handleReply(item)} 
          delayLongPress={250} 
          style={styles.replyBtn} 
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Reply size={18} color="#3b82f6" />
        </TouchableOpacity>
        <Text style={styles.messageTime}>{item.timestamp}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Opening conversation...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Chat view
  if (activeConvo) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { setActiveConvo(null); setReplyTo(null); }}>
            <ArrowLeft size={24} color="#111" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <View style={styles.avatarSmall}>
              {activeConvo.avatar
                ? <Image source={{ uri: activeConvo.avatar }} style={styles.avatarSmallImg} />
                : <Text style={styles.avatarText}>{activeConvo.name.slice(0, 2).toUpperCase()}</Text>
              }
            </View>
            <Text style={styles.headerName}>{activeConvo.name}</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={m => m.id}
          contentContainerStyle={styles.messagesList}
          renderItem={renderMessage}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {uploading && (
          <View style={styles.uploadingBar}>
            <ActivityIndicator size="small" color="#3b82f6" />
            <Text style={styles.uploadingText}>Uploading...</Text>
          </View>
        )}

        {replyTo && (
          <View style={styles.replyBar}>
            <View style={styles.replyBarContent}>
              <Reply size={16} color="#3b82f6" />
              <View style={styles.replyBarTextWrap}>
                <Text style={styles.replyBarName}>
                  {replyTo.fromMe ? 'You' : activeConvo.name}
                </Text>
                <Text style={styles.replyBarText} numberOfLines={1}>
                  {replyTo.text || (replyTo.imageUrl ? 'Photo' : replyTo.fileName || 'File')}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setReplyTo(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={18} color="#6b7280" />
            </TouchableOpacity>
          </View>
        )}

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.inputRow}>
            <TouchableOpacity onPress={handlePickImage} disabled={uploading} style={styles.attachBtn}>
              <ImagePlus size={22} color={uploading ? '#d1d5db' : '#6b7280'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePickFile} disabled={uploading} style={styles.attachBtn}>
              <Paperclip size={20} color={uploading ? '#d1d5db' : '#6b7280'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={openEventPicker} disabled={uploading} style={styles.attachBtn}>
              <Calendar size={20} color={uploading ? '#d1d5db' : '#6b7280'} />
            </TouchableOpacity>
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Message..."
              placeholderTextColor="#9ca3af"
              returnKeyType="send"
              onSubmitEditing={() => sendMessage()}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!inputText.trim() && !uploading ? styles.sendBtnDisabled : null)]}
              onPress={() => sendMessage()}
              disabled={!inputText.trim() && !uploading}
            >
              <Send size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {/* Modal for selecting a liked event */}
        <Modal visible={isEventPickerVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Share a Liked Event</Text>
                <TouchableOpacity onPress={() => setIsEventPickerVisible(false)}>
                  <X size={24} color="#374151" />
                </TouchableOpacity>
              </View>

              {loadingEvents ? (
                <View style={styles.modalEmpty}>
                  <ActivityIndicator size="large" color="#3b82f6" />
                  <Text style={styles.modalEmptyText}>Loading your events...</Text>
                </View>
              ) : likedEvents.length === 0 ? (
                <View style={styles.modalEmpty}>
                  <Text style={styles.modalEmptyText}>You don't have any liked events to share.</Text>
                </View>
              ) : (
                <FlatList
                  data={likedEvents}
                  keyExtractor={item => item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingVertical: 8 }}
                  renderItem={({ item }) => {
                    const img = item.imageUrl || item.image || (item.photos && item.photos[0]);
                    
                    let dateStr = '';
                    const rawDate = item.date || item.startDate;
                    if (rawDate) {
                      dateStr = typeof rawDate?.toDate === 'function' ? rawDate.toDate().toLocaleDateString() : new Date(rawDate).toLocaleDateString();
                    }

                    return (
                      <TouchableOpacity style={styles.pickerEventRow} onPress={() => handleSendEvent(item)}>
                        {img ? (
                          <Image source={{ uri: img }} style={styles.pickerEventImg} />
                        ) : (
                          <View style={styles.pickerEventImgPlaceholder}>
                            <Text style={styles.pickerEventImgText}>{item.name?.slice(0, 2).toUpperCase()}</Text>
                          </View>
                        )}
                        <View style={styles.pickerEventInfo}>
                          <Text style={styles.pickerEventName} numberOfLines={1}>{item.name}</Text>
                          <Text style={styles.pickerEventSub} numberOfLines={1}>
                            {dateStr} {dateStr && (item.city || item.location) ? '•' : ''} {item.city || item.location}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                />
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // Conversation list view
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <ArrowLeft size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <Search size={18} color="#9ca3af" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && Platform.OS === 'android' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <X size={18} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      {conversations.length === 0 && (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>No conversations yet</Text>
          <Text style={styles.emptySubtext}>Start a conversation from a friend's profile</Text>
        </View>
      )}

      {conversations.length > 0 && filteredConversations.length === 0 && (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>No results found</Text>
        </View>
      )}

      <FlatList
        data={filteredConversations}
        keyExtractor={c => c.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.convoRow} onPress={() => setActiveConvo(item)}>
            <View style={styles.avatarWrap}>
              {item.avatar
                ? <Image source={{ uri: item.avatar }} style={styles.avatar} />
                : <View style={styles.avatarFallback}>
                    <Text style={styles.avatarFallbackText}>{item.name.slice(0, 2).toUpperCase()}</Text>
                  </View>
              }
            </View>
            <View style={styles.convoInfo}>
              <Text style={styles.convoName}>{item.name}</Text>
              <Text style={styles.convoLast} numberOfLines={1}>{item.lastMessage}</Text>
            </View>
            <Text style={styles.convoTime}>{item.timestamp}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerName: { fontSize: 16, fontWeight: '700', color: '#111' },
  avatarSmall: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#d1d5db', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarSmallImg: { width: '100%', height: '100%' },
  avatarText: { fontSize: 11, fontWeight: '700', color: '#374151' },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    marginHorizontal: 18,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    paddingVertical: 8, 
  },

  convoRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 14, gap: 12,
  },
  separator: { height: 1, backgroundColor: '#f3f4f6', marginLeft: 80 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  avatarFallback: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#d1d5db', alignItems: 'center', justifyContent: 'center',
  },
  avatarFallbackText: { fontSize: 16, fontWeight: '800', color: '#374151' },
  convoInfo: { flex: 1 },
  convoName: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 3 },
  convoLast: { fontSize: 13, color: '#6b7280' },
  convoTime: { fontSize: 12, color: '#9ca3af' },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 4 },
  emptySubtext: { fontSize: 13, color: '#9ca3af' },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#6b7280' },

  messagesList: { padding: 16, gap: 4 },
  messageBubbleWrap: { alignItems: 'flex-start', marginBottom: 8 },
  messageBubbleWrapMe: { alignItems: 'flex-end' },
  bubble: {
    maxWidth: '75%', paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 18, overflow: 'hidden',
  },
  bubbleMe: { backgroundColor: '#2C2C2C', borderBottomRightRadius: 4 },
  bubbleThem: { backgroundColor: '#f3f4f6', borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14, color: '#111827' },
  bubbleTextMe: { color: '#fff' },

  messageFooter: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  messageFooterMe: { flexDirection: 'row-reverse' },
  messageTime: { fontSize: 10, color: '#9ca3af' },
  replyBtn: { padding: 2 },

  replyInBubble: {
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginBottom: 6,
  },
  replyInBubbleMe: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderLeftColor: '#93c5fd',
  },
  replyInBubbleThem: {},
  replyInBubbleName: { fontSize: 11, fontWeight: '700', color: '#3b82f6', marginBottom: 1 },
  replyInBubbleNameMe: { color: '#93c5fd' },
  replyInBubbleText: { fontSize: 12, color: '#6b7280' },
  replyInBubbleTextMe: { color: 'rgba(255,255,255,0.7)' },

  replyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#f0f9ff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  replyBarContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  replyBarTextWrap: { flex: 1 },
  replyBarName: { fontSize: 12, fontWeight: '700', color: '#3b82f6' },
  replyBarText: { fontSize: 12, color: '#6b7280' },

  chatImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 4,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
    marginBottom: 4,
  },
  fileName: { fontSize: 13, color: '#3b82f6', flex: 1, fontWeight: '600' },
  fileNameMe: { color: '#93c5fd' },

  // Event Bubble UI
  eventMsgCard: {
    width: 220,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 4,
  },
  eventMsgCardMe: {
    backgroundColor: '#3f3f46', 
    borderColor: '#52525b',
  },
  eventMsgCardThem: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  },
  eventMsgImg: {
    width: '100%',
    height: 120,
    backgroundColor: '#e5e7eb',
  },
  eventMsgImgPlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventMsgInfo: {
    padding: 10,
  },
  eventMsgName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  eventMsgTextMe: {
    color: '#ffffff',
  },
  eventMsgSub: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6,
  },
  eventMsgSubMe: {
    color: '#a1a1aa',
  },
  eventMsgTapText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3b82f6',
  },

  uploadingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f9ff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  uploadingText: { fontSize: 13, color: '#3b82f6', fontWeight: '600' },

  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: '#e5e7eb',
  },
  attachBtn: {
    width: 34, height: 36,
    alignItems: 'center', justifyContent: 'center',
  },
  input: {
    flex: 1, backgroundColor: '#f3f4f6', borderRadius: 24,
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: '#111827',
  },
  sendBtn: {
    backgroundColor: '#2C2C2C', width: 40, height: 40,
    borderRadius: 20, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#9ca3af' },

  // Event Picker Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '65%',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 16,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modalEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  modalEmptyText: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
  },
  pickerEventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 12,
  },
  pickerEventImg: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  pickerEventImgPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerEventImgText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  pickerEventInfo: {
    flex: 1,
  },
  pickerEventName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  pickerEventSub: {
    fontSize: 13,
    color: '#6b7280',
  },
});

export default MessagingScreen;