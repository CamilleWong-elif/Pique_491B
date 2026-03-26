import { auth, db } from '@/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

export interface UserProfile {
  displayName?: string;
  bio?: string;
  photoURL?: string;
  avatarDataUrl?: string;
  username?: string;
  followerCount?: string[];
  followingCount?: string[];
  updatedAt?: unknown;
}

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const profileUnsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      profileUnsubRef.current?.();
      profileUnsubRef.current = null;
      setUser(firebaseUser ?? null);
      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const profileRef = doc(db, 'users', firebaseUser.uid);
      const unsub = onSnapshot(
        profileRef,
        (snap) => {
          if (snap.exists()) {
            setProfile(snap.data() as UserProfile);
          } else {
            setProfile({
              displayName: firebaseUser.displayName ?? undefined,
              photoURL: firebaseUser.photoURL ?? undefined,
            });
          }
        },
        () => {
          setProfile({
            displayName: firebaseUser.displayName ?? undefined,
            photoURL: firebaseUser.photoURL ?? undefined,
          });
        }
      );
      profileUnsubRef.current = unsub;
      setLoading(false);
    });

    return () => {
      profileUnsubRef.current?.();
      unsubscribeAuth();
    };
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const refreshProfile = () => {
    if (!user) return;
    const profileRef = doc(db, 'users', user.uid);
    onSnapshot(profileRef, (snap) => {
      if (snap.exists()) setProfile(snap.data() as UserProfile);
    });
  };

  const value: AuthContextValue = {
    user,
    profile,
    loading,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx == null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
