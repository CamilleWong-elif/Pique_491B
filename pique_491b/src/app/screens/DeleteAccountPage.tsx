import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, TriangleAlert } from "lucide-react-native";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { auth } from "@/firebase";
import { apiDeleteAccount } from "@/api";
import { useAuth } from "@/context/AuthContext";

type Props = {
  onNavigate: (page: string) => void;
};

export function DeleteAccountScreen({ onNavigate }: Props) {
  const { user, signOut } = useAuth();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!password.trim()) {
      Alert.alert("Password required", "Please enter your password to confirm.");
      return;
    }

    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and all your data. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              // Re-authenticate before deleting
              const credential = EmailAuthProvider.credential(
                user?.email ?? "",
                password
              );
              await reauthenticateWithCredential(auth.currentUser!, credential);

              // Call backend to delete Firestore doc + Auth user
              await apiDeleteAccount();

              // Sign out locally (auth state will clear the app)
              await signOut();
            } catch (err: any) {
              setLoading(false);
              if (
                err.code === "auth/wrong-password" ||
                err.code === "auth/invalid-credential"
              ) {
                Alert.alert("Incorrect password", "The password you entered is wrong.");
              } else {
                Alert.alert("Error", err.message ?? "Failed to delete account.");
              }
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => onNavigate("settings")}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <ChevronLeft size={20} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delete Account</Text>
      </View>

      <View style={styles.content}>
        {/* Warning box */}
        <View style={styles.warningBox}>
          <TriangleAlert size={24} color="#DC2626" />
          <Text style={styles.warningTitle}>This action is permanent</Text>
          <Text style={styles.warningText}>
            Deleting your account will remove all your data including your profile,
            events, reviews, and messages. This cannot be undone.
          </Text>
        </View>

        {/* Password confirmation */}
        <Text style={styles.label}>Enter your password to confirm</Text>
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!loading}
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[styles.deleteBtn, loading && styles.deleteBtnDisabled]}
          onPress={handleDelete}
          disabled={loading}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Delete my account"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.deleteBtnText}>Delete My Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onNavigate("settings")}
          style={styles.cancelBtn}
          disabled={loading}
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "900", color: "#111" },

  content: { padding: 24, gap: 16 },

  warningBox: {
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#FECACA",
    marginBottom: 8,
  },
  warningTitle: { fontSize: 16, fontWeight: "800", color: "#DC2626" },
  warningText: { fontSize: 13, color: "#7F1D1D", textAlign: "center", lineHeight: 20 },

  label: { fontSize: 14, fontWeight: "700", color: "#374151" },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111",
    backgroundColor: "#F9FAFB",
  },

  deleteBtn: {
    backgroundColor: "#DC2626",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  deleteBtnDisabled: { opacity: 0.6 },
  deleteBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },

  cancelBtn: { alignItems: "center", paddingVertical: 12 },
  cancelBtnText: { fontSize: 14, color: "#6B7280", fontWeight: "700" },
});

export default DeleteAccountScreen;
