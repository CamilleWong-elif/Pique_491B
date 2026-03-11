// PrivacyPolicyScreen.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Linking,
} from "react-native";
import { ArrowLeft, Mail, MessageCircle, Phone } from "lucide-react-native";

type Props = {
  onNavigate: (page: string) => void;
};

export function PrivacyPolicyScreen({ onNavigate }: Props) {
  const topPad = Platform.OS === "android" ? (StatusBar.currentHeight || 0) : 0;

  const openMail = (email: string) => Linking.openURL(`mailto:${email}`);
  const openPhone = (phone: string) => Linking.openURL(`tel:${phone}`);

  const Bullet = ({ children }: { children: React.ReactNode }) => (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletDot}>•</Text>
      <Text style={styles.p}>{children}</Text>
    </View>
  );

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <Text style={styles.h2}>{children}</Text>
  );

  const SubTitle = ({ children }: { children: React.ReactNode }) => (
    <Text style={styles.h3}>{children}</Text>
  );

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
            <ArrowLeft size={20} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.updated}>Last Updated: February 11, 2026</Text>

        {/* 1 */}
        <View style={styles.section}>
          <SectionTitle>1. Introduction</SectionTitle>
          <Text style={styles.p}>
            Pique ("we," "our," or "us") is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, disclose, and
            safeguard your information when you use our mobile application and
            services (collectively, the "Service").
          </Text>
          <Text style={styles.p}>
            Please read this Privacy Policy carefully. By using the Service, you
            agree to the collection and use of information in accordance with
            this policy.
          </Text>
        </View>

        {/* 2 */}
        <View style={styles.section}>
          <SectionTitle>2. Information We Collect</SectionTitle>

          <SubTitle>2.1 Personal Information</SubTitle>
          <Text style={styles.p}>We collect personal information that you voluntarily provide when you:</Text>
          <Bullet>Register for an account (name, email address, phone number, date of birth)</Bullet>
          <Bullet>Create a profile (profile photo, bio, interests)</Bullet>
          <Bullet>Post reviews or upload photos</Bullet>
          <Bullet>Make purchases or payments (billing information, payment card details)</Bullet>
          <Bullet>Communicate with us or other users</Bullet>

          <SubTitle>2.2 Location Information</SubTitle>
          <Text style={styles.p}>
            With your permission, we collect and process information about your
            location to provide location-based features, including:
          </Text>
          <Bullet>Precise geolocation data (GPS, WiFi, cellular data)</Bullet>
          <Bullet>Location you manually enter or select</Bullet>
          <Bullet>Information about nearby events and activities</Bullet>

          <SubTitle>2.3 Usage Data</SubTitle>
          <Text style={styles.p}>
            We automatically collect information about how you interact with the
            Service:
          </Text>
          <Bullet>Device information (device type, operating system, unique device identifiers)</Bullet>
          <Bullet>App usage data (features used, time spent, clicks, interactions)</Bullet>
          <Bullet>Log data (IP address, browser type, pages visited, time stamps)</Bullet>
          <Bullet>Cookies and similar tracking technologies</Bullet>

          <SubTitle>2.4 Social Media Information</SubTitle>
          <Text style={styles.p}>
            If you connect your social media accounts to the Service, we may
            collect information from those accounts, including your profile
            information, friend lists, and content you've shared.
          </Text>
        </View>

        {/* 3 */}
        <View style={styles.section}>
          <SectionTitle>3. How We Use Your Information</SectionTitle>
          <Text style={styles.p}>We use the information we collect to:</Text>
          <Bullet>Provide, maintain, and improve the Service</Bullet>
          <Bullet>Personalize your experience and provide tailored recommendations</Bullet>
          <Bullet>Connect you with friends and show you relevant events</Bullet>
          <Bullet>Process transactions and send transaction notifications</Bullet>
          <Bullet>Send you updates, marketing communications, and promotional materials</Bullet>
          <Bullet>Respond to your comments, questions, and customer service requests</Bullet>
          <Bullet>Monitor and analyze usage trends and activities</Bullet>
          <Bullet>Detect, prevent, and address technical issues and fraudulent activity</Bullet>
          <Bullet>Comply with legal obligations and enforce our Terms and Conditions</Bullet>
        </View>

        {/* 4 */}
        <View style={styles.section}>
          <SectionTitle>4. How We Share Your Information</SectionTitle>
          <Text style={styles.p}>We may share your information in the following circumstances:</Text>

          <SubTitle>4.1 With Other Users</SubTitle>
          <Text style={styles.p}>
            Your profile information, reviews, photos, and activity may be
            visible to other users of the Service based on your privacy settings.
          </Text>

          <SubTitle>4.2 With Service Providers</SubTitle>
          <Text style={styles.p}>
            We share information with third-party service providers who perform
            services on our behalf, such as payment processing, data analysis,
            email delivery, hosting services, and customer service.
          </Text>

          <SubTitle>4.3 For Legal Purposes</SubTitle>
          <Text style={styles.p}>
            We may disclose your information if required by law or in response
            to valid legal requests, such as subpoenas, court orders, or
            government investigations.
          </Text>

          <SubTitle>4.4 Business Transfers</SubTitle>
          <Text style={styles.p}>
            In the event of a merger, acquisition, or sale of assets, your
            information may be transferred as part of that transaction.
          </Text>

          <SubTitle>4.5 With Your Consent</SubTitle>
          <Text style={styles.p}>
            We may share your information for other purposes with your explicit
            consent.
          </Text>
        </View>

        {/* 5 */}
        <View style={styles.section}>
          <SectionTitle>5. Cookies and Tracking Technologies</SectionTitle>
          <Text style={styles.p}>
            We use cookies, web beacons, and similar tracking technologies to
            collect and store information about your preferences and activities.
          </Text>

          <SubTitle>5.1 Types of Cookies We Use</SubTitle>
          <Bullet><Text style={styles.bold}>Essential Cookies:</Text> Necessary for the Service to function properly</Bullet>
          <Bullet><Text style={styles.bold}>Analytics Cookies:</Text> Help us understand how users interact with the Service</Bullet>
          <Bullet><Text style={styles.bold}>Functional Cookies:</Text> Remember your preferences and settings</Bullet>
          <Bullet><Text style={styles.bold}>Advertising Cookies:</Text> Deliver relevant advertisements and track campaign effectiveness</Bullet>

          <SubTitle>5.2 EU Cookie Law Compliance</SubTitle>
          <Text style={styles.p}>
            <Text style={styles.bold}>For European Union Users:</Text> We comply with the EU Cookie Law (ePrivacy Directive)
            and GDPR requirements. When you first access our Service from the EU,
            you will be presented with a cookie consent banner.
          </Text>
          <Text style={styles.p}>You have the right to:</Text>
          <Bullet>Accept or reject non-essential cookies</Bullet>
          <Bullet>Withdraw your consent at any time through your device settings</Bullet>
          <Bullet>Opt-out of targeted advertising cookies</Bullet>
          <Text style={styles.p}>
            You can manage your cookie preferences through your browser settings.
            Note that disabling certain cookies may limit your ability to use
            some features of the Service.
          </Text>
        </View>

        {/* 6 */}
        <View style={styles.section}>
          <SectionTitle>6. California Privacy Rights (CCPA)</SectionTitle>
          <Text style={styles.p}>
            <Text style={styles.bold}>For California Residents:</Text> The California Consumer Privacy Act (CCPA) provides
            California residents with specific rights regarding their personal
            information.
          </Text>

          <SubTitle>6.1 Your Rights</SubTitle>
          <Text style={styles.p}>California residents have the right to:</Text>
          <Bullet><Text style={styles.bold}>Right to Know:</Text> Request information about categories and specific pieces of personal information we have collected</Bullet>
          <Bullet><Text style={styles.bold}>Right to Delete:</Text> Request deletion of your personal information, subject to certain exceptions</Bullet>
          <Bullet><Text style={styles.bold}>Right to Opt-Out:</Text> Opt-out of the "sale" of your personal information (we do not sell personal information)</Bullet>
          <Bullet><Text style={styles.bold}>Right to Non-Discrimination:</Text> Not be discriminated against for exercising your CCPA rights</Bullet>

          <SubTitle>6.2 Categories of Personal Information Collected</SubTitle>
          <Text style={styles.p}>
            In the past 12 months, we have collected the following categories of personal information:
          </Text>
          <Bullet>Identifiers (name, email, phone number)</Bullet>
          <Bullet>Commercial information (purchase history, payment information)</Bullet>
          <Bullet>Internet or network activity (browsing history, app interactions)</Bullet>
          <Bullet>Geolocation data (precise location information)</Bullet>
          <Bullet>Visual information (photos, profile pictures)</Bullet>
          <Bullet>Inferences (preferences, characteristics, behavior)</Bullet>

          <SubTitle>6.3 Do Not Sell My Personal Information</SubTitle>
          <Text style={styles.p}>
            We do not sell your personal information to third parties. We may share information with
            service providers and partners as described in this Privacy Policy, but we do not receive
            monetary compensation for such sharing.
          </Text>

          <SubTitle>6.4 How to Exercise Your Rights</SubTitle>
          <Text style={styles.p}>
            To exercise your California privacy rights, please contact us using the information in the
            "Contact Us" section below. We will verify your identity before processing your request.
          </Text>
          <Text style={styles.p}>
            You may also designate an authorized agent to make requests on your behalf. The authorized
            agent must provide proof of authorization.
          </Text>
        </View>

        {/* 7 */}
        <View style={styles.section}>
          <SectionTitle>7. European Data Protection Rights (GDPR)</SectionTitle>
          <Text style={styles.p}>
            <Text style={styles.bold}>For European Union Users:</Text> If you are in the European Economic Area (EEA), you have certain
            data protection rights under the General Data Protection Regulation (GDPR).
          </Text>

          <SubTitle>7.1 Your Rights</SubTitle>
          <Bullet><Text style={styles.bold}>Right of Access:</Text> Request a copy of your personal data</Bullet>
          <Bullet><Text style={styles.bold}>Right to Rectification:</Text> Request correction of inaccurate data</Bullet>
          <Bullet><Text style={styles.bold}>Right to Erasure:</Text> Request deletion of your data ("right to be forgotten")</Bullet>
          <Bullet><Text style={styles.bold}>Right to Restrict Processing:</Text> Request limitation of how we use your data</Bullet>
          <Bullet><Text style={styles.bold}>Right to Data Portability:</Text> Receive your data in a portable format</Bullet>
          <Bullet><Text style={styles.bold}>Right to Object:</Text> Object to processing of your data for certain purposes</Bullet>
          <Bullet><Text style={styles.bold}>Right to Withdraw Consent:</Text> Withdraw consent at any time where we rely on consent</Bullet>

          <SubTitle>7.2 Legal Basis for Processing</SubTitle>
          <Text style={styles.p}>We process your personal data based on the following legal grounds:</Text>
          <Bullet>Performance of a contract with you</Bullet>
          <Bullet>Your consent</Bullet>
          <Bullet>Compliance with legal obligations</Bullet>
          <Bullet>Our legitimate interests (e.g., improving the Service, fraud prevention)</Bullet>

          <SubTitle>7.3 Data Transfers</SubTitle>
          <Text style={styles.p}>
            Your information may be transferred to and processed in the United States. We ensure appropriate
            safeguards are in place for international data transfers, including Standard Contractual Clauses
            approved by the European Commission.
          </Text>
        </View>

        {/* 8 */}
        <View style={styles.section}>
          <SectionTitle>8. Data Security</SectionTitle>
          <Text style={styles.p}>We implement reasonable security measures to protect your information from unauthorized access, alteration, disclosure, or destruction. These measures include:</Text>
          <Bullet>Encryption of data in transit and at rest</Bullet>
          <Bullet>Regular security assessments and audits</Bullet>
          <Bullet>Access controls and authentication requirements</Bullet>
          <Bullet>Employee training on data protection</Bullet>
          <Text style={styles.p}>
            However, no method of transmission over the internet or electronic storage is 100% secure. While we strive
            to protect your information, we cannot guarantee absolute security.
          </Text>
        </View>

        {/* 9 */}
        <View style={styles.section}>
          <SectionTitle>9. Data Retention</SectionTitle>
          <Text style={styles.p}>
            We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy,
            unless a longer retention period is required or permitted by law.
          </Text>
          <Text style={styles.p}>
            When you delete your account, we will delete or anonymize your personal information within 90 days, except where
            we are required to retain it for legal, regulatory, or legitimate business purposes.
          </Text>
        </View>

        {/* 10 */}
        <View style={styles.section}>
          <SectionTitle>10. Children's Privacy</SectionTitle>
          <Text style={styles.p}>
            Our Service is not intended for children under the age of 13. We do not knowingly collect personal information from
            children under 13. If you are a parent or guardian and believe your child has provided us with personal information,
            please contact us.
          </Text>
          <Text style={styles.p}>
            For users between 13 and 18, we recommend parental guidance when using the Service.
          </Text>
        </View>

        {/* 11 */}
        <View style={styles.section}>
          <SectionTitle>11. Your Privacy Choices</SectionTitle>
          <Text style={styles.p}>You have several choices regarding your information:</Text>
          <Bullet><Text style={styles.bold}>Account Information:</Text> Update your profile information in the app settings</Bullet>
          <Bullet><Text style={styles.bold}>Location Services:</Text> Disable location tracking in your device settings</Bullet>
          <Bullet><Text style={styles.bold}>Marketing Communications:</Text> Opt-out of promotional emails by clicking "unsubscribe"</Bullet>
          <Bullet><Text style={styles.bold}>Push Notifications:</Text> Disable notifications in your device settings</Bullet>
          <Bullet><Text style={styles.bold}>Cookies:</Text> Manage cookies through your browser settings</Bullet>
          <Bullet><Text style={styles.bold}>Account Deletion:</Text> Delete your account through the app settings</Bullet>
        </View>

        {/* 12 */}
        <View style={styles.section}>
          <SectionTitle>12. Third-Party Links and Services</SectionTitle>
          <Text style={styles.p}>
            The Service may contain links to third-party websites and services. We are not responsible for the privacy practices
            of these third parties. We encourage you to read their privacy policies.
          </Text>
          <Text style={styles.p}>
            Some features may use third-party APIs or services (e.g., Google Maps, payment processors). These third parties may
            collect information as described in their own privacy policies.
          </Text>
        </View>

        {/* 13 */}
        <View style={styles.section}>
          <SectionTitle>13. Changes to This Privacy Policy</SectionTitle>
          <Text style={styles.p}>We may update this Privacy Policy from time to time. We will notify you of any material changes by:</Text>
          <Bullet>Posting the new Privacy Policy on this page</Bullet>
          <Bullet>Updating the "Last Updated" date</Bullet>
          <Bullet>Sending you an in-app notification or email</Bullet>
          <Text style={styles.p}>
            Your continued use of the Service after changes become effective constitutes your acceptance of the revised Privacy Policy.
          </Text>
        </View>

        {/* 14 */}
        <View style={styles.section}>
          <SectionTitle>14. International Users</SectionTitle>
          <Text style={styles.p}>
            If you are accessing the Service from outside the United States, please be aware that your information may be transferred
            to, stored, and processed in the United States. By using the Service, you consent to the transfer of your information to
            the United States and other countries where we operate.
          </Text>
        </View>

        {/* 15 */}
        <View style={[styles.section, styles.contactSection]}>
          <Text style={styles.h1b}>15. Contact Us & Support</Text>
          <Text style={styles.p}>
            If you have any questions about this Privacy Policy, want to exercise your privacy rights, or need support, please contact us:
          </Text>

          {/* Email Support */}
          <View style={[styles.supportCard, styles.supportBlue]}>
            <View style={[styles.supportIcon, { backgroundColor: "#3B82F6" }]}>
              <Mail size={18} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.supportTitle}>Email Support</Text>
              <Text style={styles.supportSub}>For general inquiries and support</Text>
              <Text style={[styles.link, { color: "#2563EB" }]} onPress={() => openMail("support@pique.app")}>
                support@pique.app
              </Text>
            </View>
          </View>

          {/* Privacy */}
          <View style={[styles.supportCard, styles.supportPurple]}>
            <View style={[styles.supportIcon, { backgroundColor: "#A855F7" }]}>
              <Mail size={18} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.supportTitle}>Privacy & Data Rights</Text>
              <Text style={styles.supportSub}>For CCPA, GDPR requests and data inquiries</Text>
              <Text style={[styles.link, { color: "#7C3AED" }]} onPress={() => openMail("privacy@pique.app")}>
                privacy@pique.app
              </Text>
            </View>
          </View>

          {/* Phone */}
          <View style={[styles.supportCard, styles.supportGreen]}>
            <View style={[styles.supportIcon, { backgroundColor: "#22C55E" }]}>
              <Phone size={18} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.supportTitle}>Phone Support</Text>
              <Text style={styles.supportSub}>Monday - Friday, 9am - 6pm PST</Text>
              <Text style={[styles.link, { color: "#16A34A" }]} onPress={() => openPhone("+13105551234")}>
                (310) 555-1234
              </Text>
            </View>
          </View>

          {/* In-App */}
          <View style={[styles.supportCard, styles.supportOrange]}>
            <View style={[styles.supportIcon, { backgroundColor: "#F97316" }]}>
              <MessageCircle size={18} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.supportTitle}>In-App Chat Support</Text>
              <Text style={styles.supportSub}>Get instant help from our support team</Text>
              <Text style={[styles.link, { color: "#EA580C" }]}>
                Available in Settings → Help & Support
              </Text>
            </View>
          </View>

          {/* Address */}
          <View style={styles.addressCard}>
            <Text style={styles.supportTitle}>Mailing Address</Text>
            <Text style={styles.addrText}>
              Pique, Inc.{"\n"}
              123 Beach Blvd, Suite 200{"\n"}
              Manhattan Beach, CA 90266{"\n"}
              United States
            </Text>
          </View>

          {/* Response time */}
          <View style={styles.responseCard}>
            <Text style={styles.responseText}>
              <Text style={styles.bold}>Response Time:</Text> We aim to respond to all inquiries within 24-48 hours. For privacy
              rights requests, we will respond within 45 days as required by applicable law.
            </Text>
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
    paddingHorizontal: 21,
    paddingBottom: 12,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "900", color: "#111" },

  scroll: { flex: 1 },
  content: { paddingHorizontal: 21, paddingTop: 18, paddingBottom: 100 },

  updated: { fontSize: 12, color: "#6B7280", marginBottom: 18 },

  section: { marginBottom: 18 },
  contactSection: { borderTopWidth: 2, borderTopColor: "#D1D5DB", paddingTop: 18, marginTop: 10 },

  h2: { fontSize: 16, fontWeight: "900", color: "#111", marginBottom: 10 },
  h3: { fontSize: 14, fontWeight: "800", color: "#111", marginTop: 10, marginBottom: 8 },
  h1b: { fontSize: 18, fontWeight: "900", color: "#111", marginBottom: 10 },

  p: { fontSize: 14, color: "#374151", lineHeight: 20, marginBottom: 8 },
  bold: { fontWeight: "900", color: "#111" },

  bulletRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 6, paddingRight: 6 },
  bulletDot: { width: 18, fontSize: 16, lineHeight: 20, color: "#374151" },

  supportCard: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
  },
  supportIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  supportTitle: { fontSize: 14, fontWeight: "900", color: "#111", marginBottom: 2 },
  supportSub: { fontSize: 13, color: "#4B5563", marginBottom: 8 },
  link: { fontSize: 13, fontWeight: "800" },

  supportBlue: { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" },
  supportPurple: { backgroundColor: "#F5F3FF", borderColor: "#DDD6FE" },
  supportGreen: { backgroundColor: "#ECFDF5", borderColor: "#BBF7D0" },
  supportOrange: { backgroundColor: "#FFF7ED", borderColor: "#FED7AA" },

  addressCard: {
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  addrText: { fontSize: 13, color: "#374151", lineHeight: 18, marginTop: 6 },

  responseCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
  },
  responseText: { fontSize: 12, color: "#374151", lineHeight: 18 },
});

export default PrivacyPolicyScreen;