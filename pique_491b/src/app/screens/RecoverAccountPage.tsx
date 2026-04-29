import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TriangleAlert } from "lucide-react-native";
import { apiRecoverAccount } from "@/api";
import { useAuth } from "@/context/AuthContext";

type Props = {
  onRecovered: () => void;
  onKeepDeleted: () => void;
};

export function RecoverAccountScreen({ onRecovered, onKeepDeleted }: Props) {
  const { profile, signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const deletionDate = profile?.scheduledDeletionAt
    ? new Date(profile.scheduledDeletionAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const daysLeft = profile?.scheduledDeletionAt
    ? Math.max(
        0,
        Math.ceil(
          (new Date(profile.scheduledDeletionAt).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 0;

  const handleRecover = async () => {
    setLoading(true);
    try {
      await apiRecoverAccount();
      onRecovered();
    } catch (err: any) {
      setLoading(false);
      Alert.alert("Error", err.message ?? "Failed to recover account. Try again.");
    }
  };

  const handleKeepDeleted = () => {
    Alert.alert(
      "Continue with deletion?",
      `Your account will be permanently deleted on ${deletionDate}. You can still log back in before then to recover it.`,
      [
        { text: "Stay here", style: "cancel" },
        {
          text: "Sign out",
          onPress: async () => {
            await signOut();
            onKeepDeleted();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.content}>
        <View style={styles.warningBox}>
          <TriangleAlert size={32} color="#DC2626" />
          <Text style={styles.warningTitle}>Your account is pending deletion</Text>
          <Text style={styles.warningText}>
            {daysLeft > 0
              ? `You have ${daysLeft} day${daysLeft === 1 ? "" : "s"} left to recover your account before all data is permanently deleted on ${deletionDate}.`
              : `Your account is scheduled to be permanently deleted on ${deletionDate}.`}
          </Text>
        </View>

        <Text style={styles.description}>
          Recovering your account will restore your profile, posts, and all data
          exactly as it was.
        </Text>

        <TouchableOpacity
          style={[styles.recoverBtn, loading && styles.btnDisabled]}
          onPress={handleRecover}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.recoverBtnText}>Recover My Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.keepDeletedBtn}
          onPress={handleKeepDeleted}
          disabled={loading}
        >
          <Text style={styles.keepDeletedBtnText}>Keep my account deleted</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff", justifyContent: "center" },
  content: { padding: 28, gap: 18 },

  warningBox: {
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
    marginBottom: 8,
  },
  warningTitle: { fontSize: 18, fontWeight: "900", color: "#DC2626", textAlign: "center" },
  warningText: { fontSize: 14, color: "#7F1D1D", textAlign: "center", lineHeight: 22 },

  description: {
    fontSize: 14,
    color: "#374151",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 8,
  },

  recoverBtn: {
    backgroundColor: "#298cf4",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.6 },
  recoverBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },

  keepDeletedBtn: { alignItems: "center", paddingVertical: 12 },
  keepDeletedBtnText: { fontSize: 14, color: "#6B7280", fontWeight: "700" },
});

export default RecoverAccountScreen;
