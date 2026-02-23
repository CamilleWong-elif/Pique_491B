export interface Event {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  address: string;
  city: string;
  state: string;
  rating: number;
  reviewCount: number;
  pricePoint: number; // 1-4 dollar signs
  distance: number; // in miles
  category: string;
  lat?: number;
  lng?: number;
  userImages?: { url: string; userName: string }[]; // Images posted by users and event creator
  startDate?: string; // Format: MM/DD
  endDate?: string;   // Format: MM/DD (optional, for multi-day events)
}

export interface SocialActivity {
  id: string;
  userName: string;
  userAvatar: string;
  eventName: string;
  eventImage: string;
  action: 'going' | 'interested' | 'rated';
  rating?: number; // for rated activities
  reviewImages?: string[]; // for rated activities
  reviewText?: string; // for rated activities
  eventLocation?: string; // for rated activities
  likes: number;
  comments: Comment[];
  isLiked?: boolean;
  isSaved?: boolean;
}

export interface Comment {
  id: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: Date;
}