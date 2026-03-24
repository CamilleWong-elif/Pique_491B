import { auth } from '@/firebase';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const user = auth.currentUser;
  if (!user) return {};
  const token = await user.getIdToken();
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

async function apiFetch<T = any>(path: string, options?: RequestInit): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...(options?.headers as Record<string, string>) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error ${res.status}`);
  }
  return res.json();
}

// ── Auth ──
export const apiRegister = (data: { fullName: string; username: string; dateOfBirth?: string }) =>
  apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(data) });

export const apiEnsureProfile = () =>
  apiFetch('/api/auth/ensure-profile', { method: 'POST' });

// ── Events ──
export const apiGetEvents = (params?: { category?: string; search?: string }) => {
  const qs = new URLSearchParams();
  if (params?.category) qs.set('category', params.category);
  if (params?.search) qs.set('search', params.search);
  const query = qs.toString();
  return apiFetch(`/api/events${query ? `?${query}` : ''}`);
};

export const apiGetEvent = (id: string) =>
  apiFetch(`/api/events/${id}`);

export const apiCreateEvent = (data: Record<string, any>) =>
  apiFetch('/api/events', { method: 'POST', body: JSON.stringify(data) });

export const apiToggleLike = (eventId: string) =>
  apiFetch(`/api/events/${eventId}/like`, { method: 'POST' });

// ── Users ──
export const apiGetUsers = () =>
  apiFetch('/api/users');

export const apiGetMe = () =>
  apiFetch('/api/users/me');

export const apiGetUser = (id: string) =>
  apiFetch(`/api/users/${id}`);

export const apiUpdateMe = (data: Record<string, any>) =>
  apiFetch('/api/users/me', { method: 'PUT', body: JSON.stringify(data) });

export const apiCheckUsername = (username: string) =>
  apiFetch<{ available: boolean }>(`/api/users/check-username/${encodeURIComponent(username)}`);

export const apiSearchUsers = (query: string) =>
  apiFetch(`/api/users/search?q=${encodeURIComponent(query)}`);

export const apiFollowUser = (userId: string) =>
  apiFetch(`/api/users/${userId}/follow`, { method: 'POST' });

export const apiUnfollowUser = (userId: string) =>
  apiFetch(`/api/users/${userId}/unfollow`, { method: 'POST' });

export const apiGetFollowers = (userId: string) =>
  apiFetch(`/api/users/${userId}/followers`);

export const apiGetFollowing = (userId: string) =>
  apiFetch(`/api/users/${userId}/following`);

// ── Bookings ──
export const apiGetBookings = () =>
  apiFetch('/api/bookings');

export const apiCreateBooking = (data: { eventId: string; quantity: number; total: number; email: string; phoneNumber?: string }) =>
  apiFetch('/api/bookings', { method: 'POST', body: JSON.stringify(data) });

// ── Reviews ──
export const apiGetReviews = (eventId?: string) =>
  apiFetch(`/api/reviews${eventId ? `?eventId=${eventId}` : ''}`);

export const apiPostReview = (data: { eventId: string; rating: number; comment: string }) =>
  apiFetch('/api/reviews', { method: 'POST', body: JSON.stringify(data) });

export const apiGetFriendReviews = () =>
  apiFetch('/api/reviews/friends');

// ── Leaderboard ──
export const apiGetLeaderboard = (mode: 'friends' | 'global' = 'friends') =>
  apiFetch(`/api/leaderboard?mode=${mode}`);

// ── Messages ──
export const apiGetConversations = () =>
  apiFetch('/api/messages/conversations');

export const apiGetMessages = (conversationId: string) =>
  apiFetch(`/api/messages/${conversationId}`);

export const apiSendMessage = (conversationId: string, text: string) =>
  apiFetch(`/api/messages/${conversationId}`, { method: 'POST', body: JSON.stringify({ text }) });

export const apiStartConversation = (recipientId: string) =>
  apiFetch('/api/messages/conversations/new', { method: 'POST', body: JSON.stringify({ recipientId }) });
