import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function AuthCallback() {
  const params = useLocalSearchParams<{ code?: string; error?: string }>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const store = async () => {
      if (params.code) {
        await AsyncStorage.setItem('@ms_auth_code', params.code);
      }
      setReady(true);
    };
    store();
  }, [params.code]);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Redirect href="/" />;
}
