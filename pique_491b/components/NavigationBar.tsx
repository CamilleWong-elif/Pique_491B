import { Home, MapPin } from 'lucide-react-native';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

type Page = 'home' | 'explore' | 'profile' | 'create' | 'leaderboard';

interface NavigationBarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onOpenMessages: () => void;
  unreadMessageCount?: number;
}

function CommunityIcon({ isActive }: { isActive: boolean }) {
  const color = isActive ? '#000000' : '#9ca3af';
  return (
    <Svg width={30} height={30} viewBox="0 0 30 30" fill="none">
      <Circle cx="7" cy="8" r="3.5" stroke={color} strokeWidth="2" />
      <Path d="M1 22C1 17.5 3.5 15 7 15C8.5 15 9.5 15.5 10.5 16.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Circle cx="15" cy="7" r="4.5" stroke={color} strokeWidth="2" />
      <Path d="M7 26C7 20.5 10 17 15 17C20 17 23 20.5 23 26" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Circle cx="23" cy="8" r="3.5" stroke={color} strokeWidth="2" />
      <Path d="M29 22C29 17.5 26.5 15 23 15C21.5 15 20.5 15.5 19.5 16.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function NavigationBar({ currentPage, onNavigate, unreadMessageCount = 0 }: NavigationBarProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>

        {/* Home */}
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('home')}>
          <Home size={30} color={currentPage === 'home' ? '#000000' : '#9ca3af'} />
          <Text style={[styles.label, currentPage === 'home' && styles.labelActive]}>Home</Text>
        </TouchableOpacity>

        {/* Explore */}
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('explore')}>
          <MapPin size={30} color={currentPage === 'explore' ? '#000000' : '#9ca3af'} />
          <Text style={[styles.label, currentPage === 'explore' && styles.labelActive]}>Explore</Text>
        </TouchableOpacity>

        {/* Community */}
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('leaderboard')}>
          <CommunityIcon isActive={currentPage === 'leaderboard'} />
          <Text style={[styles.label, currentPage === 'leaderboard' && styles.labelActive]}>Community</Text>
        </TouchableOpacity>

        {/* Profile */}
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('profile')}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1653771926391-d1b5608c90b2?w=400' }}
            style={styles.avatar}
          />
          <Text style={[styles.label, currentPage === 'profile' && styles.labelActive]}>My Profile</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 16,
    paddingHorizontal: 18,
    zIndex: 50,
  },
  container: {
    backgroundColor: '#ffffff',
    height: 70,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  label: {
    fontSize: 9,
    color: '#9ca3af',
  },
  labelActive: {
    color: '#000000',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
});