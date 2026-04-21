export const ALL_CATEGORIES = [
  'Arts', 'Business', 'Comedy', 'Education', 'Family', 'Fashion',
  'Film', 'Fitness', 'Food & Drink', 'Gaming', 'Health & Wellness', 'Music',
  'Nightlife', 'Outdoors', 'Sports', 'Tech', 'Theater', 'Travel',
] as const;

export type CategoryName = (typeof ALL_CATEGORIES)[number];
