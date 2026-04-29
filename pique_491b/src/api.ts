import { auth } from '@/firebase';
import { Platform } from 'react-native';

const DEFAULT_API_BASE = Platform.OS === 'android'
  ? 'http://10.0.2.2:3000'
  : 'http://localhost:3000';

function normalizeApiBase(rawBase: string): string {
  return rawBase
    .replace(/\/+$/, '')
    .replace(/\/api$/i, '');
}

const API_BASE = normalizeApiBase(process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_BASE);

async function getAuthHeaders(forceRefresh = false): Promise<Record<string, string>> {
  const user = auth.currentUser;
  if (!user) return {};
  try {
    const token = await user.getIdToken(forceRefresh);
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  } catch (error: any) {
    const cachedToken = (user as any)?.stsTokenManager?.accessToken;
    if (!forceRefresh && error?.code === 'auth/network-request-failed' && cachedToken) {
      console.warn('api.ts: Falling back to cached Firebase ID token due to network error.');
      return {
        Authorization: `Bearer ${cachedToken}`,
        'Content-Type': 'application/json',
      };
    }
    throw error;
  }
}

async function apiFetch<T = any>(path: string, options?: RequestInit): Promise<T> {
  const makeRequest = async (forceRefresh = false) => {
    const headers = await getAuthHeaders(forceRefresh);
    return fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { ...headers, ...(options?.headers as Record<string, string>) },
    });
  };

  let res = await makeRequest();
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    if (res.status === 401 && auth.currentUser) {
      try {
        await auth.currentUser.getIdToken(true);
        res = await makeRequest(true);
      } catch (refreshError) {
        console.warn('api.ts: Token refresh failed after expired-token response.', refreshError);
      }
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error ${res.status}`);
  }

  return res.json();
}

async function apiPublicFetch<T = any>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string>),
    },
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

export const apiGetEmailAuthStatus = (email: string) =>
  apiPublicFetch<{ exists: boolean; providers: string[]; hasPassword: boolean; primaryAuthProvider?: string }>(
    `/api/auth/email-auth-status?email=${encodeURIComponent(email.trim().toLowerCase())}`
  );

export const apiSubmitSurvey = (data: { gender: string; location: string; languages: string[]; preferredCategories: string[] }) =>
  apiFetch('/api/users/me/survey', { method: 'POST', body: JSON.stringify(data) });

// ── Events ──
export const apiGetEvents = (params?: {
  category?: string;
  search?: string;
  limit?: number;
  createdBy?: string;
  ids?: string[];
  cursor?: string;
  startDate?: string;
  endDate?: string;
  withCursor?: boolean;
}) => {
  const qs = new URLSearchParams();
  if (params?.category) qs.set('category', params.category);
  if (params?.search) qs.set('search', params.search);
  if (params?.createdBy) qs.set('createdBy', params.createdBy);
  if (params?.ids && params.ids.length > 0) qs.set('ids', params.ids.join(','));
  if (params?.cursor) qs.set('cursor', params.cursor);
  if (params?.startDate) qs.set('startDate', params.startDate);
  if (params?.endDate) qs.set('endDate', params.endDate);
  if (params?.withCursor) qs.set('withCursor', '1');
  qs.set('limit', String(params?.limit ?? 50));
  const query = qs.toString();
  return apiFetch(`/api/events${query ? `?${query}` : ''}`);
};

export const apiGetEvent = (id: string) =>
  apiFetch(`/api/events/${id}`);

// ── Recommendations ──
export const apiGetRecommendations = (limit?: number) =>
  apiFetch(`/api/recommendations?limit=${limit ?? 20}`);

// ── Notifications ──
export const apiGetNotifications = (limit?: number) =>
  apiFetch(`/api/notifications?limit=${limit ?? 50}`);

export const apiMarkNotificationRead = (notificationId: string) =>
  apiFetch('/api/notifications/read', {
    method: 'POST',
    body: JSON.stringify({ notificationId }),
  });

export const apiMarkAllNotificationsRead = () =>
  apiFetch('/api/notifications/read-all', {
    method: 'POST',
  });

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

export const apiDeleteAccount = () =>
  apiFetch('/api/users/me', { method: 'DELETE' });

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

export const apiGetFollowing = (userId?: string) =>
  userId
    ? apiFetch(`/api/users/${userId}/following`)
    : apiFetch('/api/users/me/following');

// ── Bookings ──
export const apiGetBookings = () =>
  apiFetch('/api/bookings');

export const apiCreateBooking = (data: { eventId: string; quantity: number; total: number; email: string; phoneNumber?: string }) =>
  apiFetch('/api/bookings', { method: 'POST', body: JSON.stringify(data) });

// ── Reviews ──
export const apiGetReviews = (eventId?: string) =>
  apiFetch(`/api/reviews${eventId ? `?eventId=${eventId}` : ''}`);

export const apiPostReview = (data: { eventId: string; rating: number; comment: string; images?: string[] }) =>
  apiFetch('/api/reviews', { method: 'POST', body: JSON.stringify(data) });

export const apiGetFriendReviews = (scope: 'mutual' | 'following' = 'mutual') =>
  apiFetch(`/api/reviews/friends?scope=${scope}`);

/** Hide a feed activity for the current user only (e.g. bookmark card); does not remove the bookmark. */
export const apiDismissFeedActivity = (activityId: string) =>
  apiFetch('/api/reviews/feed/dismiss', {
    method: 'POST',
    body: JSON.stringify({ activityId }),
  });

export const apiDeleteReview = (reviewId: string) =>
  apiFetch(`/api/reviews/${reviewId}`, { method: 'DELETE' });

export const apiToggleReviewLike = (reviewId: string) =>
  apiFetch(`/api/reviews/${reviewId}/like`, { method: 'POST' });

export const apiGetReviewComments = (reviewId: string) =>
  apiFetch(`/api/reviews/${reviewId}/comments`);

export type ReviewLiker = { userId: string; userName: string; userAvatar?: string | null };
export type ActivityLiker = { userId: string; userName: string; userAvatar?: string | null };

export const apiGetReviewLikes = (reviewId: string) =>
  apiFetch(`/api/reviews/${reviewId}/likes`) as Promise<ReviewLiker[]>;

export const apiPostReviewComment = (reviewId: string, text: string) =>
  apiFetch(`/api/reviews/${reviewId}/comments`, { method: 'POST', body: JSON.stringify({ text }) });

// ── Activities ──
export const apiToggleActivityLike = (activityId: string) =>
  apiFetch(`/api/activities/${activityId}/like`, { method: 'POST' });

export const apiGetActivityLikes = (activityId: string) =>
  apiFetch(`/api/activities/${activityId}/likes`) as Promise<ActivityLiker[]>;

export const apiGetActivityComments = (activityId: string) =>
  apiFetch(`/api/activities/${activityId}/comments`);

export const apiPostActivityComment = (activityId: string, text: string) =>
  apiFetch(`/api/activities/${activityId}/comments`, { method: 'POST', body: JSON.stringify({ text }) });

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

