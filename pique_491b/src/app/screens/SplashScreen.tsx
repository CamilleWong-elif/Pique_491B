import { useEffect, useRef } from 'react';
import { View, Image, Animated, StyleSheet } from 'react-native';

const logo = require('@/assets/images/splash_logo.png');

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Recreates your scaleAndFade CSS animation
    Animated.timing(opacity, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();

    Animated.timing(scale, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();

    // Matches your original 2.5 second timer
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.Image
          source={logo}
          style={[styles.logo, { opacity, transform: [{ scale }] }]}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#298cf4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 288,   // equivalent to Tailwind's w-48 (48 * 5 = 288)
    height: 288,  // give it a fixed height since h-auto doesn't exist in RN
  },
});

export default SplashScreen;