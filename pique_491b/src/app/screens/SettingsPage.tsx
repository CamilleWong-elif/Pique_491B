// SettingsScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  StatusBar,
} from "react-native";
import {
  ChevronLeft,
  Bell,
  Lock,
  Globe,
  HelpCircle,
  Shield,
} from "lucide-react-native";

type Props = {
  onNavigate: (page: string) => void;
};

type Language = "English" | "Spanish" | "French" | "German" | "Italian" | "Portuguese";

export function SettingsScreen({ onNavigate }: Props) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [eventReminders, setEventReminders] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [privateProfile, setPrivateProfile] = useState(false);
  const [showActivity, setShowActivity] = useState(true);
  const [language, setLanguage] = useState<Language>("English");

  const topPad = Platform.OS === "android" ? (StatusBar.currentHeight || 0) : 0;

  const SettingRow = ({
    title,
    subtitle,
    right,
  }: {
    title: string;
    subtitle: string;
    right: React.ReactNode;
  }) => (
    <View style={styles.row}>
      <View style={{ flex: 1, paddingRight: 14 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSub}>{subtitle}</Text>
      </View>
      {right}
    </View>
  );

  const NavRow = ({
    title,
    subtitle,
    danger,
    onPress,
  }: {
    title: string;
    subtitle: string;
    danger?: boolean;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={styles.navRow}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <Text style={[styles.navTitle, danger && { color: "#DC2626" }]}>{title}</Text>
      <Text style={styles.navSub}>{subtitle}</Text>
    </TouchableOpacity>
  );

  const LangChip = ({ value }: { value: Language }) => {
    const on = language === value;
    return (
      <TouchableOpacity
        onPress={() => setLanguage(value)}
        style={[styles.chip, on ? styles.chipOn : styles.chipOff]}
        accessibilityRole="button"
        accessibilityLabel={`Set language to ${value}`}
      >
        <Text style={[styles.chipText, on ? styles.chipTextOn : styles.chipTextOff]}>
          {value}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: 12 + topPad }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => onNavigate("home")}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <ChevronLeft size={20} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Notifications */}
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Bell size={20} color="#374151" />
              <Text style={styles.sectionTitle}>Notifications</Text>
            </View>

            <View style={styles.card}>
              <SettingRow
                title="Push Notifications"
                subtitle="Receive notifications on your device"
                right={
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                  />
                }
              />
              <View style={styles.cardSep} />
              <SettingRow
                title="Event Reminders"
                subtitle="Get reminded about upcoming events"
                right={<Switch value={eventReminders} onValueChange={setEventReminders} />}
              />
              <View style={styles.cardSep} />
              <SettingRow
                title="Messages"
                subtitle="Notifications for new messages"
                right={
                  <Switch
                    value={messageNotifications}
                    onValueChange={setMessageNotifications}
                  />
                }
              />
            </View>
          </View>

          {/* Privacy */}
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Lock size={20} color="#374151" />
              <Text style={styles.sectionTitle}>Privacy</Text>
            </View>

            <View style={styles.card}>
              <SettingRow
                title="Private Profile"
                subtitle="Only followers can see your profile"
                right={<Switch value={privateProfile} onValueChange={setPrivateProfile} />}
              />
              <View style={styles.cardSep} />
              <SettingRow
                title="Show Activity Status"
                subtitle="Let others see when you're active"
                right={<Switch value={showActivity} onValueChange={setShowActivity} />}
              />
            </View>
          </View>

          {/* App Preferences */}
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Globe size={20} color="#374151" />
              <Text style={styles.sectionTitle}>App Preferences</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.prefLabel}>Language</Text>
              {/* RN replacement for <select>: chips */}
              <View style={styles.chipsWrap}>
                <LangChip value="English" />
                <LangChip value="Spanish" />
                <LangChip value="French" />
                <LangChip value="German" />
                <LangChip value="Italian" />
                <LangChip value="Portuguese" />
              </View>
            </View>
          </View>

          {/* Account */}
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Shield size={20} color="#374151" />
              <Text style={styles.sectionTitle}>Account</Text>
            </View>

            <View style={styles.card}>
              <NavRow
                title="Change Password"
                subtitle="Update your account password"
                onPress={() => onNavigate("changePassword")}
              />
              <View style={styles.cardSep} />
              <NavRow
                title="Blocked Users"
                subtitle="Manage your blocked list"
                onPress={() => onNavigate("blockedUsers")}
              />
              <View style={styles.cardSep} />
              <NavRow
                title="Delete Account"
                subtitle="Permanently delete your account"
                danger
                onPress={() => onNavigate("deleteAccount")}
              />
            </View>
          </View>

          {/* About */}
          <View style={[styles.section, { marginBottom: 10 }]}>
            <View style={styles.sectionTitleRow}>
              <HelpCircle size={20} color="#374151" />
              <Text style={styles.sectionTitle}>About</Text>
            </View>

            <View style={styles.card}>
              <NavRow title="App Version" subtitle="v1.0.0" onPress={() => {}} />
              <View style={styles.cardSep} />
              <NavRow
                title="Help Center"
                subtitle="Get help and support"
                onPress={() => onNavigate("helpCenter")}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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

  scroll: { flex: 1 },
  container: { paddingHorizontal: 18, paddingBottom: 20 },

  section: { marginTop: 22 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#111" },

  card: {
    backgroundColor: "#F9FAFB",
    borderRadius: 18,
    padding: 14,
  },
  cardSep: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 12 },

  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowTitle: { fontSize: 14, fontWeight: "700", color: "#1F2937" },
  rowSub: { fontSize: 12, color: "#4B5563", marginTop: 2 },

  navRow: { paddingHorizontal: 6, paddingVertical: 10, borderRadius: 12 },
  navTitle: { fontSize: 14, fontWeight: "700", color: "#1F2937" },
  navSub: { fontSize: 12, color: "#4B5563", marginTop: 2 },

  prefLabel: { fontSize: 14, fontWeight: "700", color: "#1F2937", marginBottom: 10 },

  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  chipOn: { backgroundColor: "#DBEAFE", borderColor: "#3B82F6" },
  chipOff: { backgroundColor: "#fff", borderColor: "#D1D5DB" },
  chipText: { fontSize: 12, fontWeight: "800" },
  chipTextOn: { color: "#1D4ED8" },
  chipTextOff: { color: "#374151" },
});

export default SettingsScreen;