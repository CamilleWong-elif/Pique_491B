export type EventSource = 'manual' | 'ticketmaster' | 'seatgeek' | 'ical';

export type Event = {
  id: string;
  name: string;
  imageUrl?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
  categories?: string[];
  city?: string;
  pricePoint?: number;
  rating?: number;
  distance?: number;
  createdAt?: string;
  source?: EventSource;
  externalId?: string;
  externalUrl?: string;
};
