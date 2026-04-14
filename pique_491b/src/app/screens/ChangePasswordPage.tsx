import { auth } from "@/firebase";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { ChevronLeft, Lock, ShieldCheck } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  onNavigate: (page: string) => void;
};

export function ChangePasswordScreen({ onNavigate }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const user = auth.currentUser;

  const hasPasswordProvider = useMemo(
    () => !!user?.providerData.some((provider) => provider.providerId === "password"),
    [user]
  );

  const resetMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const validateInputs = () => {
    if (!user || !user.email) {
      setError("You must be signed in with an email account to change your password.");
      return false;
    }

    if (!hasPasswordProvider) {
      setError(
        "This account was created with a third-party provider and does not have a password to change."
      );
      return false;
    }

    if (!currentPassword) {
      setError("Please enter your current password.");
      return false;
    }

    if (!newPassword) {
      setError("Please enter a new password.");
      return false;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return false;
    }

    if (newPassword === currentPassword) {
      setError("New password must be different from your current password.");
      return false;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return false;
    }

    return true;
  };

  const handleChangePassword = async () => {
    resetMessages();
    if (!validateInputs() || !user || !user.email) return;

    setIsSaving(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Password updated successfully.");
    } catch (err: any) {
      if (err?.code === "auth/wrong-password" || err?.code === "auth/invalid-credential") {
        setError("Your current password is incorrect.");
      } else if (err?.code === "auth/weak-password") {
        setError("Your new password is too weak. Please choose a stronger password.");
      } else if (err?.code === "auth/too-many-requests") {
        setError("Too many attempts. Please wait a moment and try again.");
      } else if (err?.code === "auth/requires-recent-login") {
        setError("Please sign in again and retry changing your password.");
      } else {
        setError("Unable to update password right now. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={[styles.header, { paddingTop: 12 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => onNavigate("settings")}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Back to settings"
          >
            <ChevronLeft size={20} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Change Password</Text>
        </View>
      </View>

      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.titleRow}>
            <ShieldCheck size={20} color="#2563EB" />
            <Text style={styles.title}>Update your account password</Text>
          </View>

          <Text style={styles.description}>
            For security, enter your current password before setting a new one.
          </Text>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Current Password</Text>
            <View style={styles.inputWrap}>
              <Lock size={18} color="#9CA3AF" />
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={(text) => {
                  setCurrentPassword(text);
                  if (error || success) resetMessages();
                }}
                secureTextEntry
                placeholder="Enter current password"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                editable={!isSaving && hasPasswordProvider}
              />
            </View>
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.inputWrap}>
              <Lock size={18} color="#9CA3AF" />
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  if (error || success) resetMessages();
                }}
                secureTextEntry
                placeholder="At least 6 characters"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                editable={!isSaving && hasPasswordProvider}
              />
            </View>
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.inputWrap}>
              <Lock size={18} color="#9CA3AF" />
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (error || success) resetMessages();
                }}
                secureTextEntry
                placeholder="Re-enter new password"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                editable={!isSaving && hasPasswordProvider}
              />
            </View>
          </View>

          {!hasPasswordProvider && (
            <Text style={styles.warning}>
              This account signs in with a third-party provider, so password changes are
              unavailable here.
            </Text>
          )}

          {!!error && <Text style={styles.errorText}>{error}</Text>}
          {!!success && <Text style={styles.successText}>{success}</Text>}

          <TouchableOpacity
            style={[
              styles.saveBtn,
              (isSaving || !hasPasswordProvider) && styles.saveBtnDisabled,
            ]}
            onPress={handleChangePassword}
            disabled={isSaving || !hasPasswordProvider}
            accessibilityRole="button"
            accessibilityLabel="Save new password"
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>Save New Password</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default ChangePasswordScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },

  header: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "900", color: "#111" },

  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 22,
  },
  card: {
    borderRadius: 18,
    backgroundColor: "#F9FAFB",
    padding: 16,
    gap: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
    flex: 1,
  },
  description: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 20,
  },

  fieldWrap: { gap: 8 },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },
  inputWrap: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    height: 46,
    fontSize: 14,
    color: "#111827",
  },

  warning: {
    fontSize: 13,
    lineHeight: 19,
    color: "#92400E",
    backgroundColor: "#FFFBEB",
    borderColor: "#FCD34D",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  errorText: {
    fontSize: 13,
    color: "#B91C1C",
    fontWeight: "600",
  },
  successText: {
    fontSize: 13,
    color: "#047857",
    fontWeight: "600",
  },

  saveBtn: {
    marginTop: 4,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnDisabled: {
    backgroundColor: "#93C5FD",
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
});