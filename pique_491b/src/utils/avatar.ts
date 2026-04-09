type AvatarSource = Record<string, unknown> | null | undefined;

const AVATAR_KEYS = [
  'avatarDataUrl',
  'photoURL',
  'photoUrl',
  'avatar',
  'friendAvatar',
  'userAvatar',
  'profilePicture',
] as const;

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function resolveAvatarUrl(...sources: AvatarSource[]): string | undefined {
  for (const source of sources) {
    if (!source || typeof source !== 'object') continue;
    for (const key of AVATAR_KEYS) {
      const candidate = asNonEmptyString(source[key]);
      if (candidate) return candidate;
    }
  }
  return undefined;
}

export function getAvatarFallback(name?: string): string {
  const seed = encodeURIComponent((name || 'user').trim() || 'user');
  return `https://api.dicebear.com/7.x/initials/png?seed=${seed}`;
}
