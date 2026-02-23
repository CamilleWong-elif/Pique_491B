import { Event, SocialActivity } from '../types/Event';
import { Conversation, Message } from '../types/Message';

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  lat: number;
  lng: number;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  imageUrl: string;
  caption?: string;
  timestamp: Date;
}

export interface FriendRatedEvent {
  id: string;
  friendId: string;
  friendName: string;
  friendAvatar: string;
  eventName: string;
  eventId: string;
  rating: number;
  timestamp: Date;
  reviewText?: string;
}

export const currentUser = {
  name: 'You',
  avatar: 'https://images.unsplash.com/photo-1653771926391-d1b5608c90b2?w=400',
  lat: 33.8250,
  lng: -118.3650
};

export const mockFriends: Friend[] = [
  {
    id: 'f1',
    name: 'Sarah',
    avatar: 'https://images.unsplash.com/photo-1595085610896-fb31cfd5d4b7?w=400',
    lat: 33.8847,
    lng: -118.4109 // Manhattan Beach
  },
  {
    id: 'f2',
    name: 'Javier',
    avatar: 'https://images.unsplash.com/photo-1695485121912-25c7ea05119c?w=400',
    lat: 33.7443,
    lng: -118.3870 // Palos Verdes
  },
  {
    id: 'f3',
    name: 'Mike',
    avatar: 'https://images.unsplash.com/photo-1653771926391-d1b5608c90b2?w=400',
    lat: 33.8358,
    lng: -118.3406 // Torrance
  },
  {
    id: 'f4',
    name: 'Emma',
    avatar: 'https://images.unsplash.com/photo-1595085610896-fb31cfd5d4b7?w=400',
    lat: 33.8492,
    lng: -118.3884 // Redondo Beach
  },
  {
    id: 'f5',
    name: 'Alex',
    avatar: 'https://images.unsplash.com/photo-1762708590808-c453c0e4fb0f?w=400',
    lat: 33.8200,
    lng: -118.3550
  },
  {
    id: 'f6',
    name: 'Maya',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
    lat: 33.8100,
    lng: -118.3700
  },
  {
    id: 'f7',
    name: 'Carlos',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    lat: 33.8400,
    lng: -118.3600
  },
  {
    id: 'f8',
    name: 'Lily',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    lat: 33.8300,
    lng: -118.3750
  },
  {
    id: 'f9',
    name: 'Ryan',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    lat: 33.8550,
    lng: -118.3900
  },
  {
    id: 'f10',
    name: 'Nina',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    lat: 33.8250,
    lng: -118.3650
  },
  {
    id: 'f11',
    name: 'David',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    lat: 33.8150,
    lng: -118.3500
  },
  {
    id: 'f12',
    name: 'Sophia',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    lat: 33.8450,
    lng: -118.3850
  },
  {
    id: 'f13',
    name: 'Marcus',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400',
    lat: 33.8350,
    lng: -118.3450
  },
  {
    id: 'f14',
    name: 'Isabella',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
    lat: 33.8500,
    lng: -118.3800
  },
  {
    id: 'f15',
    name: 'Tyler',
    avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400',
    lat: 33.8280,
    lng: -118.3580
  },
  {
    id: 'f16',
    name: 'Olivia',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400',
    lat: 33.8380,
    lng: -118.3680
  },
  {
    id: 'f17',
    name: 'Jake',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400',
    lat: 33.8420,
    lng: -118.3720
  },
  {
    id: 'f18',
    name: 'Chloe',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
    lat: 33.8180,
    lng: -118.3520
  },
  {
    id: 'f19',
    name: 'Ethan',
    avatar: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400',
    lat: 33.8320,
    lng: -118.3620
  },
  {
    id: 'f20',
    name: 'Ava',
    avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400',
    lat: 33.8480,
    lng: -118.3880
  },
  {
    id: 'f21',
    name: 'Lucas',
    avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400',
    lat: 33.8220,
    lng: -118.3570
  },
  {
    id: 'f22',
    name: 'Mia',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400',
    lat: 33.8370,
    lng: -118.3670
  },
  {
    id: 'f23',
    name: 'Noah',
    avatar: 'https://images.unsplash.com/photo-1507081323647-4d250478b919?w=400',
    lat: 33.8410,
    lng: -118.3710
  },
  {
    id: 'f24',
    name: 'Emily',
    avatar: 'https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?w=400',
    lat: 33.8160,
    lng: -118.3510
  },
  {
    id: 'f25',
    name: 'Liam',
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400',
    lat: 33.8290,
    lng: -118.3590
  },
  {
    id: 'f26',
    name: 'Zoe',
    avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400',
    lat: 33.8470,
    lng: -118.3870
  },
  {
    id: 'f27',
    name: 'Mason',
    avatar: 'https://images.unsplash.com/photo-1512485694743-9c9538b4e6e0?w=400',
    lat: 33.8190,
    lng: -118.3530
  },
  {
    id: 'f28',
    name: 'Harper',
    avatar: 'https://images.unsplash.com/photo-1502323777036-f29e3972d82f?w=400',
    lat: 33.8340,
    lng: -118.3640
  },
  {
    id: 'f29',
    name: 'Jackson',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',
    lat: 33.8430,
    lng: -118.3730
  },
  {
    id: 'f30',
    name: 'Aria',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    lat: 33.8170,
    lng: -118.3515
  }
];

export const mockEvents: Event[] = [
  {
    id: '1',
    name: 'LB Bouldering',
    description: 'Experience the thrill of rock climbing in our state-of-the-art bouldering gym. Perfect for beginners and experts alike!',
    imageUrl: 'https://images.unsplash.com/photo-1740389790146-be99a9a2d7e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb2NrJTIwY2xpbWJpbmclMjBneW18ZW58MXx8fHwxNzY5MDI1NTU0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    address: '123 Climbing St',
    city: 'Long Beach',
    state: 'CA',
    rating: 4.3,
    reviewCount: 53,
    pricePoint: 2,
    distance: 5.8,
    category: 'Active & Outdoors',
    lat: 33.8124,
    lng: -118.3542,
    startDate: '02/15',
    endDate: '02/16',
    userImages: [
      { url: 'https://images.unsplash.com/photo-1679783024442-ca7c1fbb4512?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb2NrJTIwY2xpbWJpbmclMjBneW0lMjBwZW9wbGV8ZW58MXx8fHwxNzY5NzI0ODQ0fDA&ixlib=rb-4.1.0&q=80&w=1080', userName: 'Sarah M.' },
      { url: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1080', userName: 'Mike R.' },
      { url: 'https://images.unsplash.com/photo-1601583377988-e73682463c3e?w=1080', userName: 'Alex K.' }
    ]
  },
  {
    id: '2',
    name: 'Paint & Sip',
    description: 'Unleash your creativity while enjoying your favorite beverages. No experience necessary!',
    imageUrl: 'https://images.unsplash.com/flagged/photo-1571965992312-3f9316e471e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYWludCUyMGFuZCUyMHNpcCUyMGNsYXNzfGVufDF8fHx8MTc2OTAyNTU1NXww&ixlib=rb-4.1.0&q=80&w=1080',
    address: '456 Art Ave',
    city: 'Palos Verdes',
    state: 'CA',
    rating: 4.7,
    reviewCount: 89,
    pricePoint: 3,
    distance: 3.2,
    category: 'Arts & Culture',
    lat: 33.8293,
    lng: -118.3715,
    startDate: '02/20',
    userImages: [
      { url: 'https://images.unsplash.com/photo-1767973212899-fe74c1ec2db2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYWludGluZyUyMGNsYXNzJTIwd29ya3Nob3B8ZW58MXx8fHwxNzY5NzI0ODQ0fDA&ixlib=rb-4.1.0&q=80&w=1080', userName: 'Emma L.' },
      { url: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1080', userName: 'Jessica P.' }
    ]
  },
  {
    id: '3',
    name: 'Sunset Yoga',
    description: 'Join us for a peaceful evening yoga session overlooking the ocean.',
    imageUrl: 'https://images.unsplash.com/photo-1616940779493-6958fbd615fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwc3R1ZGlvfGVufDF8fHx8MTc2ODkzMTQwNnww&ixlib=rb-4.1.0&q=80&w=1080',
    address: '789 Wellness Way',
    city: 'Manhattan Beach',
    state: 'CA',
    rating: 4.9,
    reviewCount: 124,
    pricePoint: 2,
    distance: 7.1,
    category: 'Wellness',
    lat: 33.8456,
    lng: -118.3891,
    startDate: '02/08',
    userImages: [
      { url: 'https://images.unsplash.com/photo-1651077837628-52b3247550ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwY2xhc3MlMjBzdHVkaW98ZW58MXx8fHwxNzY5NjkxODA3fDA&ixlib=rb-4.1.0&q=80&w=1080', userName: 'Olivia T.' },
      { url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1080', userName: 'Rachel W.' },
      { url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1080', userName: 'David H.' }
    ]
  },
  {
    id: '4',
    name: 'The Local Coffee Co.',
    description: 'Artisan coffee and fresh pastries in a cozy atmosphere. Great for work or catching up with friends.',
    imageUrl: 'https://images.unsplash.com/photo-1453614512568-c4024d13c247?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBzaG9wfGVufDF8fHx8MTc2ODk5MTAyM3ww&ixlib=rb-4.1.0&q=80&w=1080',
    address: '321 Bean Blvd',
    city: 'Torrance',
    state: 'CA',
    rating: 4.5,
    reviewCount: 67,
    pricePoint: 2,
    distance: 4.3,
    category: 'Food & Drink',
    lat: 33.8187,
    lng: -118.3449,
    startDate: '02/10'
  },
  {
    id: '5',
    name: 'Live Music Night',
    description: 'Experience local bands and touring artists in an intimate venue setting.',
    imageUrl: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwdmVudWV8ZW58MXx8fHwxNzY5MDI1NTU2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    address: '654 Music Lane',
    city: 'Redondo Beach',
    state: 'CA',
    rating: 4.6,
    reviewCount: 92,
    pricePoint: 3,
    distance: 6.5,
    category: 'Entertainment',
    lat: 33.8354,
    lng: -118.3778,
    startDate: '02/22'
  },
  {
    id: '6',
    name: 'Coastal Hiking Trail',
    description: 'Explore stunning coastal views on this moderate difficulty hiking trail.',
    imageUrl: 'https://images.unsplash.com/photo-1592859600972-1b0834d83747?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaWtpbmclMjB0cmFpbHxlbnwxfHx8fDE3Njg5ODU2OTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    address: 'Trailhead at Ocean View Dr',
    city: 'Rancho Palos Verdes',
    state: 'CA',
    rating: 4.8,
    reviewCount: 156,
    pricePoint: 1,
    distance: 8.9,
    category: 'Active & Outdoors',
    lat: 33.7982,
    lng: -118.3625,
    startDate: '02/14',
    endDate: '02/15'
  },
  {
    id: '7',
    name: 'Beachside Volleyball',
    description: 'Join pickup games or reserve a court for beach volleyball fun.',
    imageUrl: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1080',
    address: '100 Beach Dr',
    city: 'Hermosa Beach',
    state: 'CA',
    rating: 4.4,
    reviewCount: 78,
    pricePoint: 1,
    distance: 5.5,
    category: 'Active & Outdoors',
    lat: 33.8518,
    lng: -118.3822,
    startDate: '02/18'
  },
  {
    id: '8',
    name: 'Artisan Brewery Tour',
    description: 'Sample craft beers and learn about the brewing process.',
    imageUrl: 'https://images.unsplash.com/photo-1532634733-cae1395e440f?w=1080',
    address: '890 Craft Ave',
    city: 'El Segundo',
    state: 'CA',
    rating: 4.6,
    reviewCount: 112,
    pricePoint: 2,
    distance: 4.8,
    category: 'Food & Drink',
    lat: 33.8421,
    lng: -118.3965,
    startDate: '02/25'
  },
  {
    id: '9',
    name: 'Pottery Workshop',
    description: 'Create your own ceramic pieces in this hands-on workshop.',
    imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1080',
    address: '234 Clay St',
    city: 'San Pedro',
    state: 'CA',
    rating: 4.7,
    reviewCount: 64,
    pricePoint: 3,
    distance: 9.2,
    category: 'Arts & Culture',
    lat: 33.8068,
    lng: -118.3512,
    startDate: '03/01',
    endDate: '03/02'
  },
  {
    id: '10',
    name: 'Spin Class Studio',
    description: 'High-energy cycling classes with motivating instructors and great music.',
    imageUrl: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=1080',
    address: '567 Fitness Blvd',
    city: 'Carson',
    state: 'CA',
    rating: 4.5,
    reviewCount: 95,
    pricePoint: 2,
    distance: 6.7,
    category: 'Wellness',
    lat: 33.8245,
    lng: -118.3608,
    startDate: '02/12'
  },
  {
    id: '11',
    name: 'Comedy Night',
    description: 'Stand-up comedy featuring local and touring comedians.',
    imageUrl: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=1080',
    address: '789 Laugh Lane',
    city: 'Lomita',
    state: 'CA',
    rating: 4.8,
    reviewCount: 143,
    pricePoint: 2,
    distance: 7.3,
    category: 'Entertainment',
    lat: 33.8159,
    lng: -118.3686,
    startDate: '02/28'
  },
  {
    id: '12',
    name: 'Farmers Market',
    description: 'Fresh local produce, artisan goods, and street food every weekend.',
    imageUrl: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1080',
    address: '345 Market Plaza',
    city: 'Gardena',
    state: 'CA',
    rating: 4.6,
    reviewCount: 187,
    pricePoint: 1,
    distance: 5.9,
    category: 'Food & Drink',
    lat: 33.8382,
    lng: -118.3591,
    startDate: '02/09'
  },
  {
    id: '13',
    name: 'Kayaking Adventure',
    description: 'Explore the harbor and coastline by kayak with guided tours available.',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1080',
    address: '678 Harbor Way',
    city: 'Long Beach',
    state: 'CA',
    rating: 4.9,
    reviewCount: 201,
    pricePoint: 3,
    distance: 4.1,
    category: 'Active & Outdoors',
    lat: 33.8209,
    lng: -118.3734,
    startDate: '02/16',
    endDate: '02/17'
  },
  {
    id: '14',
    name: 'Ceramics Workshop',
    description: 'Learn to throw pottery on the wheel and create beautiful ceramic pieces.',
    imageUrl: 'https://images.unsplash.com/photo-1753164726456-487d6c6d1f9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3R0ZXJ5JTIwY2VyYW1pY3MlMjBjbGFzc3xlbnwxfHx8fDE3Njk1NjU0NjN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    address: '890 Studio Lane',
    city: 'Marina del Rey',
    state: 'CA',
    rating: 4.8,
    reviewCount: 132,
    pricePoint: 3,
    distance: 7.8,
    category: 'Arts & Culture',
    lat: 33.8477,
    lng: -118.3854,
    startDate: '03/05'
  },
  {
    id: '15',
    name: 'Trivia Night',
    description: 'Test your knowledge at our weekly trivia competition with prizes and drinks.',
    imageUrl: 'https://images.unsplash.com/photo-1751328049531-5a9c3830c23a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwdWIlMjBxdWl6JTIwbmlnaHR8ZW58MXx8fHwxNzY5NTY1NDY2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    address: '432 Quiz Blvd',
    city: 'Hawthorne',
    state: 'CA',
    rating: 4.5,
    reviewCount: 87,
    pricePoint: 2,
    distance: 5.3,
    category: 'Entertainment',
    lat: 33.8315,
    lng: -118.3655,
    startDate: '02/19'
  },
  {
    id: '16',
    name: 'Omakase Sushi',
    description: 'Premium sushi dining experience with chef\'s selection of the freshest catches.',
    imageUrl: 'https://images.unsplash.com/photo-1696449241254-11cf7f18ce32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXNoaSUyMHJlc3RhdXJhbnR8ZW58MXx8fHwxNzY5NDk1MTIzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    address: '234 Ocean Blvd',
    city: 'San Pedro',
    state: 'CA',
    rating: 4.9,
    reviewCount: 215,
    pricePoint: 4,
    distance: 8.5,
    category: 'Food & Drink',
    lat: 33.8101,
    lng: -118.3489,
    startDate: '02/27'
  },
  {
    id: '17',
    name: 'Reformer Pilates',
    description: 'Strengthen your core and improve flexibility with reformer pilates classes.',
    imageUrl: 'https://images.unsplash.com/photo-1604467731651-3d8b9c702b86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaWxhdGVzJTIwc3R1ZGlvfGVufDF8fHx8MTc2OTQ4MDg5MXww&ixlib=rb-4.1.0&q=80&w=1080',
    address: '567 Wellness Way',
    city: 'Playa del Rey',
    state: 'CA',
    rating: 4.7,
    reviewCount: 98,
    pricePoint: 3,
    distance: 6.2,
    category: 'Wellness',
    lat: 33.8396,
    lng: -118.3815,
    startDate: '02/11'
  },
  {
    id: '18',
    name: 'Outdoor Cinema Night',
    description: 'Watch classic and new films under the stars with blankets and snacks.',
    imageUrl: 'https://images.unsplash.com/photo-1734882770616-494a15639c9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvdXRkb29yJTIwbW92aWUlMjBzY3JlZW5pbmd8ZW58MXx8fHwxNzY5NTY1NDY0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    address: '890 Park Ave',
    city: 'Manhattan Beach',
    state: 'CA',
    rating: 4.6,
    reviewCount: 154,
    pricePoint: 2,
    distance: 7.4,
    category: 'Entertainment',
    lat: 33.8265,
    lng: -118.3798,
    startDate: '03/07',
    endDate: '03/08'
  },
  {
    id: '19',
    name: 'The Vault Nightclub',
    description: 'Premier nightlife destination with top DJs, craft cocktails, and VIP bottle service.',
    imageUrl: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=1080',
    address: '789 Night Blvd',
    city: 'Long Beach',
    state: 'CA',
    rating: 4.4,
    reviewCount: 342,
    pricePoint: 3,
    distance: 6.1,
    category: 'Entertainment',
    lat: 33.8178,
    lng: -118.3512,
    startDate: '02/13'
  },
  {
    id: '20',
    name: 'Pacific Art Museum',
    description: 'Contemporary art museum featuring local and international artists. Special exhibits change quarterly.',
    imageUrl: 'https://images.unsplash.com/photo-1647792845543-a8032c59cbdf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250ZW1wb3JhcnklMjBhcnQlMjBtdXNldW0lMjBnYWxsZXJ5fGVufDF8fHx8MTc3MDc3NzAwMXww&ixlib=rb-4.1.0&q=80&w=1080',
    address: '456 Museum Way',
    city: 'Redondo Beach',
    state: 'CA',
    rating: 4.8,
    reviewCount: 267,
    pricePoint: 2,
    distance: 5.2,
    category: 'Arts & Culture',
    lat: 33.8412,
    lng: -118.3845,
    startDate: '02/10',
    endDate: '04/30'
  },
  {
    id: '21',
    name: 'Riviera Village Shopping District',
    description: 'Charming outdoor shopping district with boutique stores, cafes, and unique local finds.',
    imageUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1080',
    address: '234 Riviera St',
    city: 'Redondo Beach',
    state: 'CA',
    rating: 4.6,
    reviewCount: 189,
    pricePoint: 2,
    distance: 4.9,
    category: 'Entertainment',
    lat: 33.8445,
    lng: -118.3892,
    startDate: '02/01',
    endDate: '02/28'
  },
  {
    id: '22',
    name: 'Skyline Rooftop Lounge',
    description: 'Upscale rooftop bar with panoramic ocean views, live DJs on weekends, and signature cocktails.',
    imageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1080',
    address: '567 Harbor Dr',
    city: 'Manhattan Beach',
    state: 'CA',
    rating: 4.7,
    reviewCount: 421,
    pricePoint: 4,
    distance: 7.8,
    category: 'Entertainment',
    lat: 33.8865,
    lng: -118.4098,
    startDate: '02/14'
  },
  {
    id: '23',
    name: 'South Bay History Museum',
    description: 'Local history museum showcasing the rich heritage of the South Bay area with interactive exhibits.',
    imageUrl: 'https://images.unsplash.com/photo-1667745812053-2e5eddef5dd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb2NhbCUyMGhpc3RvcnklMjBtdXNldW0lMjBleGhpYml0c3xlbnwxfHx8fDE3NzA3NzcwMDF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    address: '890 Heritage Ave',
    city: 'Torrance',
    state: 'CA',
    rating: 4.5,
    reviewCount: 156,
    pricePoint: 1,
    distance: 3.8,
    category: 'Arts & Culture',
    lat: 33.8325,
    lng: -118.3598,
    startDate: '02/01',
    endDate: '12/31'
  },
  {
    id: '24',
    name: 'Del Amo Fashion Center',
    description: 'One of the largest shopping malls in America with over 200 stores, dining, and entertainment.',
    imageUrl: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1080',
    address: '3525 Carson St',
    city: 'Torrance',
    state: 'CA',
    rating: 4.3,
    reviewCount: 892,
    pricePoint: 2,
    distance: 4.5,
    category: 'Entertainment',
    lat: 33.8312,
    lng: -118.3526,
    startDate: '02/01',
    endDate: '02/28'
  },
  {
    id: 25,
    name: 'Monkish Brewing Tasting',
    location: '20311 S Western Ave, Torrance, CA',
    city: 'Torrance',
    state: 'CA',
    imageUrl: 'https://images.unsplash.com/photo-1588785392665-f6d4a541417d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmFmdCUyMGJyZXdlcnklMjB0YXN0aW5nJTIwZmxpZ2h0fGVufDF8fHx8MTc3MDc3NTI2OHww&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.8,
    reviewCount: 523,
    pricePoint: 2,
    distance: 5.8,
    category: 'Food & Drink',
    lat: 33.8456,
    lng: -118.2912,
    startDate: '02/01',
  },
  {
    id: 26,
    name: 'Redondo Beach Farmers Market',
    location: '207 Esplanade, Redondo Beach, CA',
    city: 'Redondo Beach',
    state: 'CA',
    imageUrl: 'https://images.unsplash.com/photo-1698798242573-d5d83e77ed84?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXJtZXJzJTIwbWFya2V0JTIwZnJlc2glMjBwcm9kdWNlfGVufDF8fHx8MTc3MDY3MjAxOXww&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.6,
    reviewCount: 287,
    pricePoint: 1,
    distance: 4.1,
    category: 'Food & Drink',
    lat: 33.8432,
    lng: -118.3895,
    startDate: '02/13',
  },
  {
    id: 27,
    name: 'Python Coding Workshop',
    location: '1200 Aviation Blvd, Manhattan Beach, CA',
    city: 'Manhattan Beach',
    state: 'CA',
    imageUrl: 'https://images.unsplash.com/photo-1719845853806-1c54b0ed37c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2RpbmclMjB3b3Jrc2hvcCUyMGNsYXNzcm9vbXxlbnwxfHx8fDE3NzA3NzUyNjl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.9,
    reviewCount: 78,
    pricePoint: 3,
    distance: 6.9,
    category: 'Learning & Tech',
    lat: 33.8845,
    lng: -118.4012,
    startDate: '02/15',
    endDate: '02/16',
  },
  {
    id: 28,
    name: 'South Bay Tech Meetup',
    location: '1230 Rosecrans Ave, Manhattan Beach, CA',
    city: 'Manhattan Beach',
    state: 'CA',
    imageUrl: 'https://images.unsplash.com/photo-1664526937033-fe2c11f1be25?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwbWVldHVwJTIwbmV0d29ya2luZ3xlbnwxfHx8fDE3NzA3MDkwOTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.7,
    reviewCount: 145,
    pricePoint: 1,
    distance: 7.2,
    category: 'Learning & Tech',
    lat: 33.8876,
    lng: -118.3954,
    startDate: '02/18',
  },
  {
    id: 29,
    name: 'Board Game Cafe Night',
    location: '903 Manhattan Ave, Manhattan Beach, CA',
    city: 'Manhattan Beach',
    state: 'CA',
    imageUrl: 'https://images.unsplash.com/photo-1762744594797-bcfd17a8c032?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib2FyZCUyMGdhbWUlMjBjYWZlJTIwZnJpZW5kc3xlbnwxfHx8fDE3NzA3NzUyNjl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.8,
    reviewCount: 234,
    pricePoint: 2,
    distance: 6.5,
    category: 'Social',
    lat: 33.8901,
    lng: -118.4098,
    startDate: '02/12',
  },
  {
    id: 30,
    name: 'Trivia Night at The Brixton',
    location: '5905 S Main St, Redondo Beach, CA',
    city: 'Redondo Beach',
    state: 'CA',
    imageUrl: 'https://images.unsplash.com/photo-1561483947-05fdb2f05374?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cml2aWElMjBuaWdodCUyMHB1YiUyMHF1aXp8ZW58MXx8fHwxNzcwNzQ4OTc2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.6,
    reviewCount: 412,
    pricePoint: 2,
    distance: 5.3,
    category: 'Social',
    lat: 33.8345,
    lng: -118.3678,
    startDate: '02/14',
  }
];

export const mockSocialActivities: SocialActivity[] = [
  {
    id: '1',
    userName: 'Javier',
    userAvatar: 'https://images.unsplash.com/photo-1695485121912-25c7ea05119c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXN1YWwlMjBtYW4lMjBwb3J0cmFpdHxlbnwxfHx8fDE3Njg5Mzc0MjZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    eventName: 'LB Bouldering',
    eventImage: mockEvents[0].imageUrl,
    action: 'going',
    likes: 12,
    isLiked: false,
    isSaved: false,
    comments: [
      {
        id: 'c1',
        userName: 'Sarah',
        userAvatar: 'https://images.unsplash.com/photo-1595085610896-fb31cfd5d4b7?w=400',
        text: 'Looks amazing! I want to join!',
        timestamp: new Date('2025-01-27T10:30:00')
      },
      {
        id: 'c2',
        userName: 'Emma',
        userAvatar: 'https://images.unsplash.com/photo-1595085610896-fb31cfd5d4b7?w=400',
        text: 'Let me know when you go next time',
        timestamp: new Date('2025-01-27T11:15:00')
      }
    ]
  },
  {
    id: '2',
    userName: 'Sarah',
    userAvatar: 'https://images.unsplash.com/photo-1595085610896-fb31cfd5d4b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWlsaW5nJTIwd29tYW4lMjBwcm9maWxlfGVufDF8fHx8MTc2OTAyNTU2MXww&ixlib=rb-4.1.0&q=80&w=1080',
    eventName: 'Paint & Sip',
    eventImage: mockEvents[1].imageUrl,
    action: 'interested',
    likes: 8,
    isLiked: true,
    isSaved: true,
    comments: [
      {
        id: 'c3',
        userName: 'Mike',
        userAvatar: 'https://images.unsplash.com/photo-1653771926391-d1b5608c90b2?w=400',
        text: 'This looks fun! Count me in',
        timestamp: new Date('2025-01-27T14:20:00')
      }
    ]
  },
  {
    id: '3',
    userName: 'Mike',
    userAvatar: 'https://images.unsplash.com/photo-1653771926391-d1b5608c90b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMHBlcnNvbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc2OTAxNDg0NXww&ixlib=rb-4.1.0&q=80&w=1080',
    eventName: 'Sunset Yoga',
    eventImage: mockEvents[2].imageUrl,
    action: 'rated',
    rating: 4.9,
    eventLocation: 'Manhattan Beach, CA',
    reviewImages: [
      'https://images.unsplash.com/photo-1616940779493-6958fbd615fe?w=800',
      'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800',
      'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800'
    ],
    reviewText: 'Amazing yoga session with a beautiful sunset view. The instructor was very knowledgeable and the atmosphere was perfect for relaxation.',
    likes: 24,
    isLiked: true,
    isSaved: false,
    comments: [
      {
        id: 'c4',
        userName: 'Javier',
        userAvatar: 'https://images.unsplash.com/photo-1695485121912-25c7ea05119c?w=400',
        text: 'Great review! I need to check this out',
        timestamp: new Date('2025-01-27T18:45:00')
      },
      {
        id: 'c5',
        userName: 'Sarah',
        userAvatar: 'https://images.unsplash.com/photo-1595085610896-fb31cfd5d4b7?w=400',
        text: 'The sunset looks incredible!',
        timestamp: new Date('2025-01-27T19:10:00')
      },
      {
        id: 'c6',
        userName: 'Emma',
        userAvatar: 'https://images.unsplash.com/photo-1595085610896-fb31cfd5d4b7?w=400',
        text: 'Love this place, been there before',
        timestamp: new Date('2025-01-27T20:00:00')
      }
    ]
  },
  {
    id: '4',
    userName: 'Emma',
    userAvatar: 'https://images.unsplash.com/photo-1718113460570-45a11d4226db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHdvbWFuJTIwcG9ydHJhaXQlMjBjYXN1YWx8ZW58MXx8fHwxNzY5NTIyOTMxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    eventName: 'Kayaking Adventure',
    eventImage: mockEvents[12].imageUrl,
    action: 'going',
    likes: 15,
    isLiked: false,
    isSaved: false,
    comments: [
      {
        id: 'c7',
        userName: 'Javier',
        userAvatar: 'https://images.unsplash.com/photo-1695485121912-25c7ea05119c?w=400',
        text: 'I\'ve been wanting to try this!',
        timestamp: new Date('2025-01-26T09:30:00')
      }
    ]
  },
  {
    id: '5',
    userName: 'Alex',
    userAvatar: 'https://images.unsplash.com/photo-1762708590808-c453c0e4fb0f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMG1hbiUyMHBvcnRyYWl0JTIwY2FzdWFsfGVufDF8fHx8MTc2OTQ4MDE2N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    eventName: 'Trivia Night',
    eventImage: mockEvents[14].imageUrl,
    action: 'interested',
    likes: 6,
    isLiked: false,
    isSaved: true,
    comments: []
  },
  {
    id: '6',
    userName: 'Sarah',
    userAvatar: 'https://images.unsplash.com/photo-1595085610896-fb31cfd5d4b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWlsaW5nJTIwd29tYW4lMjBwcm9maWxlfGVufDF8fHx8MTc2OTAyNTU2MXww&ixlib=rb-4.1.0&q=80&w=1080',
    eventName: 'Reformer Pilates',
    eventImage: mockEvents[16].imageUrl,
    action: 'rated',
    rating: 2.3,
    eventLocation: 'Playa del Rey, CA',
    reviewImages: [
      'https://images.unsplash.com/photo-1604467731651-3d8b9c702b86?w=800',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800'
    ],
    reviewText: 'The class was overcrowded and the equipment felt outdated. Expected more for the price point.',
    likes: 18,
    isLiked: false,
    isSaved: true,
    comments: [
      {
        id: 'c8',
        userName: 'Emma',
        userAvatar: 'https://images.unsplash.com/photo-1718113460570-45a11d4226db?w=400',
        text: 'Thanks for the honest review!',
        timestamp: new Date('2025-01-25T16:20:00')
      }
    ]
  },
  {
    id: '7',
    userName: 'Javier',
    userAvatar: 'https://images.unsplash.com/photo-1695485121912-25c7ea05119c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXN1YWwlMjBtYW4lMjBwb3J0cmFpdHxlbnwxfHx8fDE3Njg5Mzc0MjZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    eventName: 'Outdoor Cinema Night',
    eventImage: mockEvents[17].imageUrl,
    action: 'going',
    likes: 20,
    isLiked: true,
    isSaved: false,
    comments: [
      {
        id: 'c9',
        userName: 'Mike',
        userAvatar: 'https://images.unsplash.com/photo-1653771926391-d1b5608c90b2?w=400',
        text: 'What movie are they showing?',
        timestamp: new Date('2025-01-24T20:15:00')
      },
      {
        id: 'c10',
        userName: 'Sarah',
        userAvatar: 'https://images.unsplash.com/photo-1595085610896-fb31cfd5d4b7?w=400',
        text: 'I\'ll bring snacks!',
        timestamp: new Date('2025-01-24T20:30:00')
      }
    ]
  },
  {
    id: '8',
    userName: 'Mike',
    userAvatar: 'https://images.unsplash.com/photo-1653771926391-d1b5608c90b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMHBlcnNvbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc2OTAxNDg0NXww&ixlib=rb-4.1.0&q=80&w=1080',
    eventName: 'Omakase Sushi',
    eventImage: mockEvents[15].imageUrl,
    action: 'interested',
    likes: 11,
    isLiked: true,
    isSaved: false,
    comments: [
      {
        id: 'c11',
        userName: 'Emma',
        userAvatar: 'https://images.unsplash.com/photo-1718113460570-45a11d4226db?w=400',
        text: 'This place looks incredible!',
        timestamp: new Date('2025-01-23T18:00:00')
      }
    ]
  },
  {
    id: '9',
    userName: 'Emma',
    userAvatar: 'https://images.unsplash.com/photo-1718113460570-45a11d4226db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHdvbWFuJTIwcG9ydHJhaXQlMjBjYXN1YWx8ZW58MXx8fHwxNzY5NTIyOTMxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    eventName: 'Comedy Night',
    eventImage: mockEvents[10].imageUrl,
    action: 'rated',
    rating: 1.5,
    eventLocation: 'Lomita, CA',
    reviewImages: [
      'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800'
    ],
    reviewText: 'Really disappointing lineup. Most jokes fell flat and the venue was uncomfortably hot with poor ventilation.',
    likes: 5,
    isLiked: false,
    isSaved: false,
    comments: [
      {
        id: 'c12',
        userName: 'Javier',
        userAvatar: 'https://images.unsplash.com/photo-1695485121912-25c7ea05119c?w=400',
        text: 'Sorry you had a bad experience!',
        timestamp: new Date('2025-01-22T21:45:00')
      }
    ]
  },
  {
    id: '10',
    userName: 'Sarah',
    userAvatar: 'https://images.unsplash.com/photo-1595085610896-fb31cfd5d4b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWlsaW5nJTIwd29tYW4lMjBwcm9maWxlfGVufDF8fHx8MTc2OTAyNTU2MXww&ixlib=rb-4.1.0&q=80&w=1080',
    eventName: 'Pottery Workshop',
    eventImage: mockEvents[8].imageUrl,
    action: 'rated',
    rating: 2.8,
    eventLocation: 'San Pedro, CA',
    reviewImages: [
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800'
    ],
    reviewText: 'The instructor seemed distracted and didn\'t provide much guidance. Space was cramped and materials felt cheap.',
    likes: 7,
    isLiked: false,
    isSaved: false,
    comments: []
  },
  {
    id: '11',
    userName: 'Mike',
    userAvatar: 'https://images.unsplash.com/photo-1653771926391-d1b5608c90b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMHBlcnNvbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc2OTAxNDg0NXww&ixlib=rb-4.1.0&q=80&w=1080',
    eventName: 'Live Music Night',
    eventImage: mockEvents[4].imageUrl,
    action: 'rated',
    rating: 4.2,
    eventLocation: 'Redondo Beach, CA',
    reviewImages: [
      'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800'
    ],
    reviewText: 'Great atmosphere and talented musicians! Only downside was the long wait for drinks at the bar.',
    likes: 16,
    isLiked: true,
    isSaved: false,
    comments: [
      {
        id: 'c13',
        userName: 'Sarah',
        userAvatar: 'https://images.unsplash.com/photo-1595085610896-fb31cfd5d4b7?w=400',
        text: 'Love this venue!',
        timestamp: new Date('2025-01-18T22:30:00')
      }
    ]
  },
  {
    id: '12',
    userName: 'Javier',
    userAvatar: 'https://images.unsplash.com/photo-1695485121912-25c7ea05119c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXN1YWwlMjBtYW4lMjBwb3J0cmFpdHxlbnwxfHx8fDE3Njg5Mzc0MjZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    eventName: 'Spin Class Studio',
    eventImage: mockEvents[9].imageUrl,
    action: 'rated',
    rating: 1.2,
    eventLocation: 'Carson, CA',
    reviewImages: [],
    reviewText: 'Bikes were broken and staff was rude when I complained. Music was way too loud and gave me a headache.',
    likes: 3,
    isLiked: false,
    isSaved: false,
    comments: []
  },
  {
    id: '13',
    userName: 'Emma',
    userAvatar: 'https://images.unsplash.com/photo-1718113460570-45a11d4226db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHdvbWFuJTIwcG9ydHJhaXQlMjBjYXN1YWx8ZW58MXx8fHwxNzY5NTIyOTMxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    eventName: 'Beachside Volleyball',
    eventImage: mockEvents[6].imageUrl,
    action: 'rated',
    rating: 3.5,
    eventLocation: 'Hermosa Beach, CA',
    reviewImages: [
      'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800'
    ],
    reviewText: 'Fun casual atmosphere but nets were in poor condition. Good for beginners but competitive players might be disappointed.',
    likes: 9,
    isLiked: false,
    isSaved: false,
    comments: [
      {
        id: 'c14',
        userName: 'Mike',
        userAvatar: 'https://images.unsplash.com/photo-1653771926391-d1b5608c90b2?w=400',
        text: 'Fair assessment, agreed on the nets',
        timestamp: new Date('2025-01-16T15:00:00')
      }
    ]
  }
];

export const categories = [
  'All',
  'Arts & Culture',
  'Entertainment',
  'Active & Outdoors',
  'Food & Drink',
  'Learning & Tech',
  'Wellness',
  'Social',
];

export const mockPosts: Post[] = [
  {
    id: 'p1',
    userId: 'f1',
    userName: 'Sarah',
    userAvatar: 'https://images.unsplash.com/photo-1595085610896-fb31cfd5d4b7?w=400',
    imageUrl: 'https://images.unsplash.com/photo-1616940779493-6958fbd615fe?w=1080',
    caption: 'Amazing sunset yoga session! 🧘‍♀️',
    timestamp: new Date('2025-01-26T18:30:00')
  },
  {
    id: 'p2',
    userId: 'f2',
    userName: 'Javier',
    userAvatar: 'https://images.unsplash.com/photo-1695485121912-25c7ea05119c?w=400',
    imageUrl: 'https://images.unsplash.com/photo-1740389790146-be99a9a2d7e1?w=1080',
    caption: 'Crushed some new routes today! 💪',
    timestamp: new Date('2025-01-25T14:20:00')
  },
  {
    id: 'p3',
    userId: 'f3',
    userName: 'Mike',
    userAvatar: 'https://images.unsplash.com/photo-1653771926391-d1b5608c90b2?w=400',
    imageUrl: 'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=1080',
    caption: 'Perfect spot for remote work ☕',
    timestamp: new Date('2025-01-24T10:15:00')
  }
];

export const mockConversations: Conversation[] = [
  {
    id: 'c1',
    friendId: 'f1',
    friendName: 'Sarah',
    friendAvatar: 'https://images.unsplash.com/photo-1595085610896-fb31cfd5d4b7?w=400',
    lastMessage: 'See you at yoga tonight!',
    lastMessageTime: new Date('2025-01-27T14:30:00'),
    unreadCount: 2,
    messages: [
      {
        id: 'm1',
        senderId: 'f1',
        text: 'Hey! Want to join me for sunset yoga?',
        timestamp: new Date('2025-01-27T14:15:00')
      },
      {
        id: 'm2',
        senderId: 'current',
        text: 'That sounds great! What time?',
        timestamp: new Date('2025-01-27T14:20:00')
      },
      {
        id: 'm3',
        senderId: 'f1',
        text: '6:30 PM at Manhattan Beach',
        timestamp: new Date('2025-01-27T14:25:00')
      },
      {
        id: 'm4',
        senderId: 'f1',
        text: 'See you at yoga tonight!',
        timestamp: new Date('2025-01-27T14:30:00')
      }
    ]
  },
  {
    id: 'c2',
    friendId: 'f2',
    friendName: 'Javier',
    friendAvatar: 'https://images.unsplash.com/photo-1695485121912-25c7ea05119c?w=400',
    lastMessage: 'Yeah, I loved it! Great workout',
    lastMessageTime: new Date('2025-01-26T19:45:00'),
    unreadCount: 0,
    messages: [
      {
        id: 'm5',
        senderId: 'current',
        text: 'How was the bouldering gym?',
        timestamp: new Date('2025-01-26T19:30:00')
      },
      {
        id: 'm6',
        senderId: 'f2',
        text: 'Yeah, I loved it! Great workout',
        timestamp: new Date('2025-01-26T19:45:00')
      }
    ]
  },
  {
    id: 'c3',
    friendId: 'f3',
    friendName: 'Mike',
    friendAvatar: 'https://images.unsplash.com/photo-1653771926391-d1b5608c90b2?w=400',
    lastMessage: 'Perfect! See you there',
    lastMessageTime: new Date('2025-01-25T16:20:00'),
    unreadCount: 0,
    messages: [
      {
        id: 'm7',
        senderId: 'current',
        text: 'Coffee tomorrow at 10?',
        timestamp: new Date('2025-01-25T16:10:00')
      },
      {
        id: 'm8',
        senderId: 'f3',
        text: 'Perfect! See you there',
        timestamp: new Date('2025-01-25T16:20:00')
      }
    ]
  },
  {
    id: 'c4',
    friendId: 'f4',
    friendName: 'Emma',
    friendAvatar: 'https://images.unsplash.com/photo-1595085610896-fb31cfd5d4b7?w=400',
    lastMessage: 'Would love to!',
    lastMessageTime: new Date('2025-01-24T12:00:00'),
    unreadCount: 1,
    messages: [
      {
        id: 'm9',
        senderId: 'current',
        text: 'Want to check out the paint & sip class this weekend?',
        timestamp: new Date('2025-01-24T11:45:00')
      },
      {
        id: 'm10',
        senderId: 'f4',
        text: 'Would love to!',
        timestamp: new Date('2025-01-24T12:00:00')
      }
    ]
  }
];