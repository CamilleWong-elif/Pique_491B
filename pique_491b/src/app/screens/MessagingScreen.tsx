import { ArrowLeft, Send } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";

// 1. Import the new modular Firebase functions
import { 
  collection, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp, 
  writeBatch 
} from 'firebase/firestore';
import { db } from '../../firebase';
const MY_USER_ID = 'user_123'; 

type Conversation = {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unread?: number;
};

type Message = {
  id: string;
  text: string;
  fromMe: boolean;
  timestamp: string;
};

interface MessagingScreenProps {
  onBack: () => void;
}

export function MessagingScreen({ onBack }: MessagingScreenProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const insets = useSafeAreaInsets();

  // 1. Listen for Conversations (Inbox View)
  useEffect(() => {
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, orderBy('updatedAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedConvos = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || 'Unknown',
          avatar: data.avatar,
          lastMessage: data.lastMessage || '',
          timestamp: data.updatedAt 
            ? new Date(data.updatedAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '',
        };
      });
      setConversations(fetchedConvos);
    }, (error) => {
      console.error("Error fetching conversations:", error);
    });

    return () => unsubscribe();
  }, []);

  // 2. Listen for Messages inside an Active Conversation (Chat View)
  useEffect(() => {
    if (!activeConvo) return;

    // Point exactly to the nested subcollection: chats/{chatId}/messages
    const messagesRef = collection(db, 'chats', activeConvo.id, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          text: data.text,
          fromMe: data.senderId === MY_USER_ID,
          timestamp: data.timestamp 
            ? new Date(data.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            : 'Now', // 'Now' handles the local cache before the server timestamp confirms
        };
      });
      setMessages(fetchedMessages);
    }, (error) => {
      console.error("Error fetching messages:", error);
    });

    return () => unsubscribe();
  }, [activeConvo]);

  // 3. Send a Message to Firebase
  const sendMessage = async () => {
    if (!inputText.trim() || !activeConvo) return;
    
    const textToSend = inputText.trim();
    setInputText(''); 

    try {
      // Use a batch to write the new message AND update the chat's lastMessage at the same time
      const batch = writeBatch(db);
      
      // Step A: Create the new message in the subcollection
      const messagesCollectionRef = collection(db, 'chats', activeConvo.id, 'messages');
      const newMessageRef = doc(messagesCollectionRef); // Auto-generates an ID
        
      batch.set(newMessageRef, {
        text: textToSend,
        senderId: MY_USER_ID,
        timestamp: serverTimestamp(),
      });

      // Step B: Update the parent chat document
      const chatRef = doc(db, 'chats', activeConvo.id);
      batch.update(chatRef, {
        lastMessage: textToSend,
        updatedAt: serverTimestamp(),
      });

      await batch.commit();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Chat view
  if (activeConvo) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity onPress={() => setActiveConvo(null)}>
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
          data={messages}
          keyExtractor={m => m.id}
          contentContainerStyle={styles.messagesList}
          renderItem={({ item }) => (
            <View style={[styles.messageBubbleWrap, item.fromMe && styles.messageBubbleWrapMe]}>
              <View style={[styles.bubble, item.fromMe ? styles.bubbleMe : styles.bubbleThem]}>
                <Text style={[styles.bubbleText, item.fromMe && styles.bubbleTextMe]}>{item.text}</Text>
              </View>
              <Text style={styles.messageTime}>{item.timestamp}</Text>
            </View>
          )}
        />

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Message..."
              placeholderTextColor="#9ca3af"
              returnKeyType="send"
              onSubmitEditing={sendMessage}
            />
            <TouchableOpacity
              style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
              onPress={sendMessage}
              disabled={!inputText.trim()}
            >
              <Send size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Conversation list view
  return (
    <SafeAreaView style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={onBack}>
          <ArrowLeft size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={conversations} 
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
  badge: {
    position: 'absolute', top: -2, right: -2,
    backgroundColor: '#ef4444', borderRadius: 10,
    minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  convoInfo: { flex: 1 },
  convoName: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 3 },
  convoLast: { fontSize: 13, color: '#6b7280' },
  convoTime: { fontSize: 12, color: '#9ca3af' },

  messagesList: { padding: 16, gap: 8 },
  messageBubbleWrap: { alignItems: 'flex-start', marginBottom: 8 },
  messageBubbleWrapMe: { alignItems: 'flex-end' },
  bubble: {
    maxWidth: '75%', paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleMe: { backgroundColor: '#2C2C2C', borderBottomRightRadius: 4 },
  bubbleThem: { backgroundColor: '#f3f4f6', borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14, color: '#111827' },
  bubbleTextMe: { color: '#fff' },
  messageTime: { fontSize: 10, color: '#9ca3af', marginTop: 3 },

  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: '#e5e7eb',
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
});
