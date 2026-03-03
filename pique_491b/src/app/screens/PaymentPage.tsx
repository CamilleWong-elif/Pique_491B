// PaymentScreen.tsx
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  StatusBar,
  Modal,
  Alert,
} from "react-native";
import {
  ArrowLeft,
  CreditCard,
  Lock,
  CheckCircle,
  Mail,
} from "lucide-react-native";

export type Event = {
  id: string;
  name: string;
  city: string;
  state: string;
  pricePoint: number; // 1..4
};

type Props = {
  event: Event;
  onBack: () => void;
  onPaymentComplete: (quantity: number, total: number) => void;
};

export function PaymentScreen({ event, onBack, onPaymentComplete }: Props) {
  const [cardNumber, setCardNumber] = useState("4532 1234 5678 9010");
  const [cardName, setCardName] = useState("John Smith");
  const [expiryDate, setExpiryDate] = useState("12/28");
  const [cvv, setCvv] = useState("123");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const pricePerTicket =
    event.pricePoint === 1
      ? 25
      : event.pricePoint === 2
      ? 50
      : event.pricePoint === 3
      ? 100
      : 150;

  const subtotal = pricePerTicket * quantity;
  const serviceFee = subtotal * 0.1;
  const total = subtotal + serviceFee;

  const formattedToday = useMemo(() => {
    // Uses device locale; you can swap to Intl if you need consistent formatting
    const d = new Date();
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "").replace(/\D/g, "").slice(0, 16);
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(" ") : cleaned;
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 4);
    if (cleaned.length >= 3) return cleaned.slice(0, 2) + "/" + cleaned.slice(2);
    if (cleaned.length >= 2) return cleaned.slice(0, 2) + (cleaned.length === 2 ? "/" : "");
    return cleaned;
  };

  const canPay =
    !isProcessing &&
    cardNumber.trim().length >= 19 &&
    cardName.trim().length > 0 &&
    expiryDate.trim().length === 5 &&
    cvv.trim().length === 3 &&
    email.trim().length > 0;

  const handlePayment = () => {
    if (!canPay) return;

    setIsProcessing(true);

    // Simulate payment processing (same behavior as your web version)
    setTimeout(() => {
      setIsProcessing(false);
      setShowConfirmation(true);

      setTimeout(() => {
        setShowConfirmation(false);
        onPaymentComplete(quantity, total);
      }, 2500);
    }, 2000);
  };

  const topPad =
    Platform.OS === "android" ? (StatusBar.currentHeight || 0) : 0;

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: 12 + topPad }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={onBack}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <ArrowLeft size={20} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 170 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Event Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>{event.name}</Text>
            <Text style={styles.summarySub}>
              {event.city}, {event.state}
            </Text>
            <Text style={styles.summarySub}>{formattedToday}</Text>
          </View>

          {/* Quantity Selector */}
          <View style={styles.block}>
            <Text style={styles.label14}>Number of Tickets</Text>
            <View style={styles.qtyRow}>
              <TouchableOpacity
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                style={styles.qtyBtn}
                accessibilityRole="button"
                accessibilityLabel="Decrease ticket quantity"
              >
                <Text style={styles.qtyBtnText}>-</Text>
              </TouchableOpacity>

              <Text style={styles.qtyValue}>{quantity}</Text>

              <TouchableOpacity
                onPress={() => setQuantity((q) => Math.min(10, q + 1))}
                style={styles.qtyBtn}
                accessibilityRole="button"
                accessibilityLabel="Increase ticket quantity"
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Payment Form */}
          <View style={styles.block}>
            <View style={styles.formHeader}>
              <CreditCard size={20} color="#111" />
              <Text style={styles.formHeaderText}>Payment Information</Text>
            </View>

            {/* Card Number */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Card Number</Text>
              <TextInput
                value={cardNumber}
                onChangeText={(t) => setCardNumber(formatCardNumber(t))}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                style={styles.input}
                maxLength={19}
              />
            </View>

            {/* Cardholder */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Cardholder Name</Text>
              <TextInput
                value={cardName}
                onChangeText={setCardName}
                placeholder="John Doe"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
              />
            </View>

            {/* Expiry + CVV */}
            <View style={styles.grid2}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Expiry Date</Text>
                <TextInput
                  value={expiryDate}
                  onChangeText={(t) => setExpiryDate(formatExpiryDate(t))}
                  placeholder="MM/YY"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  style={styles.input}
                  maxLength={5}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>CVV</Text>
                <TextInput
                  value={cvv}
                  onChangeText={(t) => setCvv(t.replace(/\D/g, "").slice(0, 3))}
                  placeholder="123"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  secureTextEntry
                  style={styles.input}
                  maxLength={3}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>
                Email <Text style={{ color: "#DC2626" }}>*</Text>
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="john.doe@example.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            {/* Phone */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>
                Phone Number{" "}
                <Text style={{ color: "#6B7280" }}>(Optional)</Text>
              </Text>
              <TextInput
                value={phoneNumber}
                onChangeText={(t) =>
                  setPhoneNumber(t.replace(/\D/g, "").slice(0, 10))
                }
                placeholder="(123) 456-7890"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                style={styles.input}
                maxLength={10}
              />
            </View>
          </View>

          {/* Price Breakdown */}
          <View style={styles.block}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLeft}>
                Subtotal ({quantity} {quantity === 1 ? "ticket" : "tickets"})
              </Text>
              <Text style={styles.priceRight}>${subtotal.toFixed(2)}</Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceLeft}>Service Fee</Text>
              <Text style={styles.priceRight}>${serviceFee.toFixed(2)}</Text>
            </View>

            <View style={styles.priceDivider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLeft}>Total</Text>
              <Text style={styles.totalRight}>${total.toFixed(2)}</Text>
            </View>
          </View>

          {/* Security Notice */}
          <View style={styles.securityCard}>
            <Lock size={16} color="#16A34A" />
            <Text style={styles.securityText}>
              Your payment information is encrypted and secure
            </Text>
          </View>

          {/* Non-refundable */}
          <View style={styles.warnCard}>
            <Text style={styles.warnTitle}>Please note: All ticket sales are final</Text>
            <Text style={styles.warnBody}>
              Tickets are non-refundable and cannot be exchanged. Please review your
              order carefully before completing your purchase.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Pay Button */}
      <View style={styles.payBar} pointerEvents="box-none">
        <TouchableOpacity
          onPress={handlePayment}
          disabled={!canPay}
          activeOpacity={0.9}
          style={[styles.payBtn, canPay ? styles.payBtnOn : styles.payBtnOff]}
          accessibilityRole="button"
          accessibilityLabel="Pay"
        >
          <Text style={styles.payBtnText}>
            {isProcessing ? "Processing..." : `Pay $${total.toFixed(2)}`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Confirmation Modal */}
      <Modal visible={showConfirmation} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.successCircle}>
              <CheckCircle size={52} color="#16A34A" />
            </View>

            <Text style={styles.modalTitle}>Booking Confirmed!</Text>
            <Text style={styles.modalSub}>Your payment has been processed successfully</Text>

            <View style={styles.emailCard}>
              <View style={styles.emailRow}>
                <Mail size={20} color="#2563EB" />
                <Text style={styles.emailTitle}>Confirmation Email Sent</Text>
              </View>
              <Text style={styles.emailBody}>Check {email} for booking details</Text>
            </View>

            <Text style={styles.redirectText}>Redirecting to confirmation page...</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingHorizontal: 26,
    paddingBottom: 12,
    backgroundColor: "#fff",
  },
  headerRow: { flexDirection: "row", alignItems: "center" },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#111" },

  scroll: { flex: 1 },
  content: { paddingHorizontal: 26, paddingVertical: 24 },

  summaryCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
  },
  summaryTitle: { fontSize: 16, fontWeight: "700", color: "#111", marginBottom: 6 },
  summarySub: { fontSize: 13, color: "#6B7280", marginBottom: 2 },

  block: { marginBottom: 18 },

  label14: { fontSize: 14, fontWeight: "700", color: "#111", marginBottom: 10 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnText: { fontSize: 18, fontWeight: "800", color: "#111" },
  qtyValue: { width: 40, textAlign: "center", fontSize: 18, fontWeight: "800", color: "#111" },

  formHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  formHeaderText: { fontSize: 16, fontWeight: "800", color: "#111" },

  field: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, color: "#374151", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111",
  },
  grid2: { flexDirection: "row", gap: 12, marginBottom: 2 },

  priceRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  priceLeft: { fontSize: 14, color: "#6B7280" },
  priceRight: { fontSize: 14, fontWeight: "700", color: "#111" },
  priceDivider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 10 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalLeft: { fontSize: 16, fontWeight: "900", color: "#111" },
  totalRight: { fontSize: 16, fontWeight: "900", color: "#111" },

  securityCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ECFDF5",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  securityText: { fontSize: 12, color: "#166534", flex: 1 },

  warnCard: {
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  warnTitle: { fontSize: 12, fontWeight: "800", color: "#78350F", marginBottom: 6 },
  warnBody: { fontSize: 11, color: "#92400E", lineHeight: 16 },

  payBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 30,
    paddingHorizontal: 26,
    alignItems: "center",
  },
  payBtn: {
    width: "100%",
    maxWidth: 380,
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  payBtnOn: { backgroundColor: "#0284C7" },
  payBtnOff: { backgroundColor: "#9CA3AF" },
  payBtnText: { color: "#fff", fontSize: 16, fontWeight: "900" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 26,
  },
  modalCard: {
    width: "100%",
    maxWidth: 350,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  modalTitle: { fontSize: 22, fontWeight: "900", color: "#111", marginBottom: 6 },
  modalSub: { fontSize: 14, color: "#6B7280", marginBottom: 14, textAlign: "center" },

  emailCard: { width: "100%", backgroundColor: "#EFF6FF", borderRadius: 12, padding: 14, marginBottom: 10 },
  emailRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 4 },
  emailTitle: { fontSize: 14, fontWeight: "800", color: "#1E3A8A" },
  emailBody: { fontSize: 12, color: "#1E40AF", textAlign: "center" },

  redirectText: { fontSize: 12, color: "#6B7280", marginTop: 6 },
});