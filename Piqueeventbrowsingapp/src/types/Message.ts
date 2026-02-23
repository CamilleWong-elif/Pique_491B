export interface Message {
  id: string;
  senderId: string;
  text?: string;
  timestamp: Date;
  replyTo?: {
    messageId: string;
    text?: string;
    senderName: string;
  };
  sharedEvent?: {
    id: string;
    name: string;
    imageUrl: string;
    city: string;
    state: string;
  };
  sharedPost?: {
    id: string;
    userName: string;
    userAvatar: string;
    imageUrl: string;
    caption?: string;
  };
}

export interface Conversation {
  id: string;
  friendId: string;
  friendName: string;
  friendAvatar: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  messages: Message[];
}