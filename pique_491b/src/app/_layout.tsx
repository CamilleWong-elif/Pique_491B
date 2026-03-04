import { AuthProvider } from '@/context/AuthContext';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function Layout() {
  return (
    <AuthProvider>
      <StatusBar style="auto" backgroundColor="#ffffff" />
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}