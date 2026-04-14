// PaymentSuccessScreen.tsx
import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { CheckCircle } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export type Event = {
  id: string;
  name: string;
  city: string;
  state: string;
};

type Props = {
  event: Event;
  quantity: number;
  total: number;
  onComplete: () => void;     // "View My Bookings"
  onReturnHome: () => void;
};

export function PaymentSuccessScreen({
  event,
  quantity,
  total,
  onComplete,
  onReturnHome,
}: Props) {
  const confirmationNumber = useMemo(
    () => `EVT-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
    []
  );

  const eventDateStr = useMemo(() => {
    const currentDate = new Date();
    const eventDate = new Date(currentDate);
    eventDate.setDate(eventDate.getDate() + 7);

    return eventDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.container}>
        <View style={styles.card}>
          {/* Success Icon */}
          <View style={styles.iconWrap}>
            <View style={styles.iconCircle}>
              <CheckCircle size={60} color="#16A34A" />
            </View>
          </View>

          {/* Message */}
          <Text style={styles.title}>Payment Successful!</Text>
          <Text style={styles.subtitle}>Your booking has been confirmed</Text>

          {/* Details */}
          <View style={styles.detailsCard}>
            <View style={styles.confirmBlock}>
              <Text style={styles.muted12}>Confirmation Number</Text>
              <Text style={styles.confirmNumber}>{confirmationNumber}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.muted12}>Event</Text>
              <Text style={styles.detailStrong}>{event.name}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.muted12}>Location</Text>
              <Text style={styles.detailText}>
                {event.city}, {event.state}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.muted12}>Date &amp; Time</Text>
              <Text style={styles.detailText}>{eventDateStr}</Text>
              <Text style={styles.detailText}>7:00 PM</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.muted12}>Quantity</Text>
              <Text style={styles.detailText}>
                {quantity} {quantity === 1 ? "Ticket" : "Tickets"}
              </Text>
            </View>

            <View style={styles.totalBlock}>
              <Text style={styles.muted12}>Total Paid</Text>
              <Text style={styles.totalPaid}>${total.toFixed(2)}</Text>
            </View>
          </View>

          {/* Info */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Confirmation email sent!</Text>
            <Text style={styles.infoBody}>
              A confirmation email with your ticket details has been sent to your
              email address.
            </Text>
          </View>

          {/* Buttons */}
          <TouchableOpacity
            onPress={onComplete}
            style={[styles.btn, styles.primaryBtn]}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel="View My Bookings"
          >
            <Text style={styles.primaryText}>View My Bookings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onReturnHome}
            style={[styles.btn, styles.secondaryBtn]}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel="Return Home"
          >
            <Text style={styles.secondaryText}>Return Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  container: {
    flex: 1,
    paddingHorizontal: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  card: { width: "100%", maxWidth: 380 },

  iconWrap: { alignItems: "center", marginBottom: 18 },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#111",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },

  detailsCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
  },
  confirmBlock: {
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  muted12: { fontSize: 12, color: "#6B7280", marginBottom: 4 },
  confirmNumber: { fontSize: 18, fontWeight: "900", color: "#111" },

  detailRow: { marginBottom: 12 },
  detailStrong: { fontSize: 15, fontWeight: "800", color: "#111" },
  detailText: { fontSize: 14, color: "#111", marginTop: 2 },

  totalBlock: {
    paddingTop: 12,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  totalPaid: { fontSize: 20, fontWeight: "900", color: "#111" },

  infoCard: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  infoTitle: { fontSize: 13, fontWeight: "800", color: "#1E3A8A", marginBottom: 4 },
  infoBody: { fontSize: 12, color: "#1E40AF", lineHeight: 16 },

  btn: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: Platform.OS === "android" ? 0.25 : 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  primaryBtn: { backgroundColor: "#0284C7" },
  primaryText: { color: "#fff", fontSize: 16, fontWeight: "900" },

  secondaryBtn: { backgroundColor: "#E5E7EB", marginTop: 14 },
  secondaryText: { color: "#111", fontSize: 16, fontWeight: "900" },
});

export default PaymentSuccessScreen;