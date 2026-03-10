declare module 'expo-auth-session' {
  export function makeRedirectUri(options?: {
    useProxy?: boolean;
    path?: string;
  }): string;
  /** @deprecated Use makeRedirectUri instead. Returns https://auth.expo.io/@user/slug when logged in. */
  export function getRedirectUrl(path?: string): string;
}

declare module 'expo-auth-session/providers/google';
