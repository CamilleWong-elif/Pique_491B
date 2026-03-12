// TermsConditionsScreen.tsx
import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Linking,
} from "react-native";
import { ArrowLeft } from "lucide-react-native";

type Props = {
  onNavigate: (page: string) => void;
};

export function TermsConditionsScreen({ onNavigate }: Props) {
  const topPad = Platform.OS === "android" ? (StatusBar.currentHeight || 0) : 0;

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <Text style={styles.h2}>{children}</Text>
  );

  const P = ({ children }: { children: React.ReactNode }) => (
    <Text style={styles.p}>{children}</Text>
  );

  const Bullet = ({ children }: { children: React.ReactNode }) => (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletDot}>•</Text>
      <Text style={styles.p}>{children}</Text>
    </View>
  );

  const openMail = (email: string) => Linking.openURL(`mailto:${email}`);

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
          <Text style={styles.headerTitle}>Terms & Conditions</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.updated}>Last Updated: February 11, 2026</Text>

        {/* 1. Introduction */}
        <View style={styles.section}>
          <SectionTitle>1. Introduction</SectionTitle>
          <P>
            Welcome to Pique ("we," "our," or "us"). These Terms and Conditions
            ("Terms") govern your access to and use of the Pique mobile
            application and related services (collectively, the "Service").
          </P>
          <P>
            By accessing or using our Service, you agree to be bound by these
            Terms. If you do not agree to these Terms, please do not use our
            Service.
          </P>
        </View>

        {/* 2. Eligibility */}
        <View style={styles.section}>
          <SectionTitle>2. Eligibility</SectionTitle>
          <P>
            You must be at least 13 years old to use our Service. By using the
            Service, you represent and warrant that:
          </P>
          <Bullet>You are at least 13 years of age</Bullet>
          <Bullet>You have the legal capacity to enter into these Terms</Bullet>
          <Bullet>You will comply with these Terms and all applicable laws</Bullet>
          <Bullet>You have not been previously suspended or removed from the Service</Bullet>
        </View>

        {/* 3. Account Registration */}
        <View style={styles.section}>
          <SectionTitle>3. Account Registration</SectionTitle>
          <P>To access certain features of the Service, you may need to register for an account. You agree to:</P>
          <Bullet>Provide accurate, current, and complete information during registration</Bullet>
          <Bullet>Maintain and promptly update your account information</Bullet>
          <Bullet>Maintain the security of your password and account</Bullet>
          <Bullet>Notify us immediately of any unauthorized use of your account</Bullet>
          <Bullet>Accept responsibility for all activities that occur under your account</Bullet>
        </View>

        {/* 4. User Content */}
        <View style={styles.section}>
          <SectionTitle>4. User Content</SectionTitle>
          <P>
            Our Service allows you to post, upload, and share content including
            photos, reviews, and event information ("User Content"). You retain
            all rights to your User Content, but grant us a license to use it.
          </P>
          <P>
            By posting User Content, you grant Pique a worldwide, non-exclusive,
            royalty-free, transferable license to use, reproduce, distribute,
            display, and perform your User Content in connection with operating
            and improving the Service.
          </P>
          <P>You represent and warrant that:</P>
          <Bullet>You own or have the necessary rights to your User Content</Bullet>
          <Bullet>Your User Content does not violate any laws or third-party rights</Bullet>
          <Bullet>Your User Content does not contain harmful, offensive, or inappropriate material</Bullet>
        </View>

        {/* 5. Prohibited Conduct */}
        <View style={styles.section}>
          <SectionTitle>5. Prohibited Conduct</SectionTitle>
          <P>You agree not to:</P>
          <Bullet>Use the Service for any illegal purpose or in violation of any laws</Bullet>
          <Bullet>Impersonate any person or entity or misrepresent your affiliation</Bullet>
          <Bullet>Harass, abuse, or harm other users</Bullet>
          <Bullet>Post false, misleading, or fraudulent content</Bullet>
          <Bullet>Spam or send unsolicited messages to other users</Bullet>
          <Bullet>Interfere with or disrupt the Service or servers</Bullet>
          <Bullet>Use automated systems or bots to access the Service</Bullet>
          <Bullet>Collect or harvest information about other users</Bullet>
          <Bullet>Reverse engineer or attempt to extract source code from the Service</Bullet>
        </View>

        {/* 6. Intellectual Property */}
        <View style={styles.section}>
          <SectionTitle>6. Intellectual Property</SectionTitle>
          <P>
            The Service and its original content (excluding User Content),
            features, and functionality are owned by Pique and are protected by
            international copyright, trademark, patent, trade secret, and other
            intellectual property laws.
          </P>
          <P>
            Our trademarks and trade dress may not be used in connection with any
            product or service without our prior written consent.
          </P>
        </View>

        {/* 7. Third-Party Services */}
        <View style={styles.section}>
          <SectionTitle>7. Third-Party Services</SectionTitle>
          <P>
            The Service may contain links to third-party websites or services
            that are not owned or controlled by Pique. We have no control over,
            and assume no responsibility for, the content, privacy policies, or
            practices of any third-party websites or services.
          </P>
          <P>
            You acknowledge and agree that Pique shall not be responsible or
            liable for any damage or loss caused by your use of any third-party services.
          </P>
        </View>

        {/* 8. Payment and Fees */}
        <View style={styles.section}>
          <SectionTitle>8. Payment and Fees</SectionTitle>
          <P>
            Certain features of the Service may require payment. By purchasing a
            paid feature, you agree to pay the applicable fees. All fees are
            non-refundable unless otherwise stated.
          </P>
          <P>
            We reserve the right to change our fees at any time, but we will
            provide advance notice of any fee changes.
          </P>
        </View>

        {/* 9. Disclaimer */}
        <View style={styles.section}>
          <SectionTitle>9. Disclaimer of Warranties</SectionTitle>
          <P>
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES
            OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
            IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
            PURPOSE, AND NON-INFRINGEMENT.
          </P>
          <P>
            We do not warrant that the Service will be uninterrupted, secure, or
            error-free, or that any defects will be corrected. You use the Service at your own risk.
          </P>
        </View>

        {/* 10. Limitation */}
        <View style={styles.section}>
          <SectionTitle>10. Limitation of Liability</SectionTitle>
          <P>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, PIQUE SHALL NOT BE LIABLE FOR
            ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
            OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR
            INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
          </P>
          <P>
            IN NO EVENT SHALL PIQUE'S AGGREGATE LIABILITY EXCEED THE AMOUNT YOU
            PAID TO PIQUE IN THE TWELVE (12) MONTHS PRIOR TO THE EVENT GIVING
            RISE TO THE CLAIM, OR $100, WHICHEVER IS GREATER.
          </P>
        </View>

        {/* 11-17 condensed for brevity but present */}
        <View style={styles.section}>
          <SectionTitle>11. Indemnification</SectionTitle>
          <P>
            You agree to indemnify, defend, and hold harmless Pique and its
            officers, directors, employees, and agents from any claims, liabilities,
            damages, losses, and expenses, including reasonable attorney's fees,
            arising out of or in any way connected with your access to or use of the Service,
            your User Content, or your violation of these Terms.
          </P>
        </View>

        <View style={styles.section}>
          <SectionTitle>12. Termination</SectionTitle>
          <P>
            We may terminate or suspend your account and access to the Service immediately,
            without prior notice or liability, for any reason, including if you breach these Terms.
          </P>
          <P>
            Upon termination, your right to use the Service will immediately cease.
            Provisions that by their nature should survive termination will remain in effect.
          </P>
        </View>

        <View style={styles.section}>
          <SectionTitle>13. Governing Law</SectionTitle>
          <P>
            These Terms shall be governed by and construed in accordance with the
            laws of the State of California, United States. Any legal action or proceeding
            arising under these Terms will be brought exclusively in the courts located in Los Angeles County, California.
          </P>
        </View>

        <View style={styles.section}>
          <SectionTitle>14. Dispute Resolution</SectionTitle>
          <P>
            Any dispute arising from these Terms or the Service shall be resolved through
            binding arbitration in accordance with the American Arbitration Association's rules,
            except that either party may bring an action in court to seek injunctive relief.
          </P>
          <P>
            You agree to waive your right to a jury trial and to participate in a class action lawsuit.
          </P>
        </View>

        <View style={styles.section}>
          <SectionTitle>15. Changes to Terms</SectionTitle>
          <P>
            We reserve the right to modify these Terms at any time. We will notify you of any changes
            by posting the new Terms on this page and updating the "Last Updated" date.
          </P>
          <P>
            Your continued use of the Service after any changes constitutes your acceptance of the new Terms.
          </P>
        </View>

        <View style={styles.section}>
          <SectionTitle>16. Severability</SectionTitle>
          <P>
            If any provision of these Terms is held to be invalid or unenforceable,
            the remaining provisions shall remain in full force and effect.
          </P>
        </View>

        <View style={styles.section}>
          <SectionTitle>17. Entire Agreement</SectionTitle>
          <P>
            These Terms constitute the entire agreement between you and Pique regarding the Service
            and supersede all prior agreements and understandings.
          </P>
        </View>

        {/* 18. Contact */}
        <View style={[styles.section, styles.contactSection]}>
          <SectionTitle>18. Contact Us</SectionTitle>
          <P>
            If you have any questions about these Terms, please contact us:
          </P>

          <View style={[styles.supportCard, styles.supportBlue]}>
            <View style={[styles.supportIcon, { backgroundColor: "#2563EB" }]}>
              <Text style={{ color: "#fff", fontWeight: "900" }}>@</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.supportTitle}>Legal</Text>
              <Text style={styles.supportSub}>Questions about the Terms</Text>
              <Text style={[styles.link, { color: "#2563EB" }]} onPress={() => openMail("legal@pique.app")}>
                legal@pique.app
              </Text>
            </View>
          </View>

          <View style={styles.addressCard}>
            <Text style={styles.supportTitle}>Mailing Address</Text>
            <Text style={styles.addrText}>
              Pique, Inc.{"\n"}
              123 Beach Blvd, Suite 200{"\n"}
              Manhattan Beach, CA 90266{"\n"}
              United States
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
  p: { fontSize: 14, color: "#374151", lineHeight: 20, marginBottom: 6 },
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

  addressCard: {
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  addrText: { fontSize: 13, color: "#374151", lineHeight: 18, marginTop: 6 },
});

export default TermsConditionsScreen;