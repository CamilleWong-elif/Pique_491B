import { CheckCircle } from 'lucide-react-native';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface EventPostedPageProps {
  eventName: string;
  onNavigate: (page: string) => void;
}

export function EventPostedPage({ eventName, onNavigate }: EventPostedPageProps) {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.container}>
        <View style={styles.iconCircle}>
          <CheckCircle size={64} color="#16A34A" />
        </View>

        <Text style={styles.title}>Event Posted!</Text>
        <Text style={styles.subtitle}>
          Your event <Text style={styles.eventName}>{eventName}</Text> is now live and visible to others.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardText}>People can now discover and join your event.</Text>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={() => onNavigate('home')}>
          <Text style={styles.primaryText}>Go to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={() => onNavigate('create')}>
          <Text style={styles.secondaryText}>Create Another Event</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  eventName: {
    fontWeight: '700',
    color: '#111827',
  },
  card: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 32,
  },
  cardText: {
    fontSize: 13,
    color: '#15803D',
    textAlign: 'center',
  },
  primaryBtn: {
    backgroundColor: '#2C2C2C',
    borderRadius: 999,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 14,
  },
  primaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: '#e5e7eb',
    borderRadius: 999,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
  },
  secondaryText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default EventPostedPage;
