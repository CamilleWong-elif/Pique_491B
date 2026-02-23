import { mockFriends } from './mockData';
import { globalLeaderboardUsers } from './globalLeaderboard';

/**
 * Get avatar for a person by their name
 * This ensures consistent avatars across the entire app
 */
export function getAvatarByName(name: string): string | null {
  // First check in mockFriends
  const friend = mockFriends.find(f => f.name === name);
  if (friend) return friend.avatar;

  // Then check in global leaderboard
  const globalUser = globalLeaderboardUsers.find(u => u.name === name);
  if (globalUser) return globalUser.avatar;

  return null;
}

/**
 * Get avatar with fallback to generated avatar
 */
export function getAvatarWithFallback(name: string): string {
  const avatar = getAvatarByName(name);
  if (avatar) return avatar;

  // Generate consistent avatar based on name hash
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `https://i.pravatar.cc/150?img=${(hash % 70) + 1}`;
}
