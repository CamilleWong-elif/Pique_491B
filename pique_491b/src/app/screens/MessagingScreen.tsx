import { ArrowLeft, Send } from 'lucide-react-native';
import { useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView, Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

const mockConversations: Conversation[] = [
  { id: '1', name: 'Sarah', lastMessage: 'See you at yoga tonight!', timestamp: '395d ago', unread: 2 },
  { id: '2', name: 'Javier', lastMessage: 'Yeah, I loved it! Great workout', timestamp: '395d ago' },
  { id: '3', name: 'Mike', lastMessage: 'Perfect! See you there', timestamp: '397d ago' },
  { id: '4', name: 'Emma', lastMessage: 'Would love to!', timestamp: '398d ago', unread: 1 },
];

const mockMessages: Record<string, Message[]> = {
  '1': [
    { id: '1', text: 'Hey! Are you going to yoga tonight?', fromMe: false, timestamp: '6:00 PM' },
    { id: '2', text: 'Yes! See you there', fromMe: true, timestamp: '6:01 PM' },
    { id: '3', text: 'See you at yoga tonight!', fromMe: false, timestamp: '6:02 PM' },
  ],
  '2': [
    { id: '1', text: 'That workout was amazing!', fromMe: true, timestamp: '5:00 PM' },
    { id: '2', text: 'Yeah, I loved it! Great workout', fromMe: false, timestamp: '5:01 PM' },
  ],
  '3': [
    { id: '1', text: 'Want to meet at the event?', fromMe: true, timestamp: '4:00 PM' },
    { id: '2', text: 'Perfect! See you there', fromMe: false, timestamp: '4:05 PM' },
  ],
  '4': [
    { id: '1', text: 'Come join us!', fromMe: true, timestamp: '3:00 PM' },
    { id: '2', text: 'Would love to!', fromMe: false, timestamp: '3:10 PM' },
  ],
};

interface MessagingScreenProps {
  onBack: () => void;
}

export function MessagingScreen({ onBack }: MessagingScreenProps) {
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const insets = useSafeAreaInsets();

  const openConversation = (convo: Conversation) => {
    setActiveConvo(convo);
    setMessages(mockMessages[convo.id] || []);
  };

  const sendMessage = () => {
    if (!inputText.trim()) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      fromMe: true,
      timestamp: 'Now',
    };
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
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
        data={mockConversations}
        keyExtractor={c => c.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.convoRow} onPress={() => openConversation(item)}>
            <View style={styles.avatarWrap}>
              {item.avatar
                ? <Image source={{ uri: item.avatar }} style={styles.avatar} />
                : <View style={styles.avatarFallback}>
                    <Text style={styles.avatarFallbackText}>{item.name.slice(0, 2).toUpperCase()}</Text>
                  </View>
              }
              {!!item.unread && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.unread}</Text>
                </View>
              )}
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
