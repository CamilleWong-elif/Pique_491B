import { ArrowLeft, Mail, MessageCircle, Phone } from 'lucide-react';

interface PrivacyPolicyPageProps {
  onNavigate: (page: string) => void;
}

export function PrivacyPolicyPage({ onNavigate }: PrivacyPolicyPageProps) {
  return (
    <div className="bg-white min-h-[932px] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-[21px] pt-[59px] pb-4 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="flex-shrink-0 w-[40px] h-[40px] rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-[20px] font-bold">Privacy Policy</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-[21px] py-6 pb-[100px]">
        <p className="text-[12px] text-gray-500 mb-6">
          Last Updated: February 11, 2026
        </p>

        <div className="space-y-6">
          {/* Introduction */}
          <section>
            <h2 className="text-[16px] font-bold mb-3">1. Introduction</h2>
            <p className="text-[14px] text-gray-700 leading-relaxed mb-2">
              Pique ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and services (collectively, the "Service").
            </p>
            <p className="text-[14px] text-gray-700 leading-relaxed">
              Please read this Privacy Policy carefully. By using the Service, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-[16px] font-bold mb-3">2. Information We Collect</h2>
            
            <h3 className="text-[14px] font-semibold mb-2 mt-4">2.1 Personal Information</h3>
            <p className="text-[14px] text-gray-700 leading-relaxed mb-2">
              We collect personal information that you voluntarily provide when you:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-[14px] text-gray-700 mb-3">
              <li>Register for an account (name, email address, phone number, date of birth)</li>
              <li>Create a profile (profile photo, bio, interests)</li>
              <li>Post reviews or upload photos</li>
              <li>Make purchases or payments (billing information, payment card details)</li>
              <li>Communicate with us or other users</li>
            </ul>

            <h3 className="text-[14px] font-semibold mb-2 mt-4">2.2 Location Information</h3>
            <p className="text-[14px] text-gray-700 leading-relaxed mb-2">
              With your permission, we collect and process information about your location to provide location-based features, including:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-[14px] text-gray-700 mb-3">
              <li>Precise geolocation data (GPS, WiFi, cellular data)</li>
              <li>Location you manually enter or select</li>
              <li>Information about nearby events and activities</li>
            </ul>

            <h3 className="text-[14px] font-semibold mb-2 mt-4">2.3 Usage Data</h3>
            <p className="text-[14px] text-gray-700 leading-relaxed mb-2">
              We automatically collect information about how you interact with the Service:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-[14px] text-gray-700 mb-3">
              <li>Device information (device type, operating system, unique device identifiers)</li>
              <li>App usage data (features used, time spent, clicks, interactions)</li>
              <li>Log data (IP address, browser type, pages visited, time stamps)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <h3 className="text-[14px] font-semibold mb-2 mt-4">2.4 Social Media Information</h3>
            <p className="text-[14px] text-gray-700 leading-relaxed">
              If you connect your social media accounts to the Service, we may collect information from those accounts, including your profile information, friend lists, and content you've shared.
            </p>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-[16px] font-bold mb-3">3. How We Use Your Information</h2>
            <p className="text-[14px] text-gray-700 leading-relaxed mb-2">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-[14px] text-gray-700">
              <li>Provide, maintain, and improve the Service</li>
              <li>Personalize your experience and provide tailored recommendations</li>
              <li>Connect you with friends and show you relevant events</li>
              <li>Process transactions and send transaction notifications</li>
              <li>Send you updates, marketing communications, and promotional materials</li>
              <li>Respond to your comments, questions, and customer service requests</li>
              <li>Monitor and analyze usage trends and activities</li>
              <li>Detect, prevent, and address technical issues and fraudulent activity</li>
              <li>Comply with legal obligations and enforce our Terms and Conditions</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section>
            <h2 className="text-[16px] font-bold mb-3">4. How We Share Your Information</h2>
            <p className="text-[14px] text-gray-700 leading-relaxed mb-2">
              We may share your information in the following circumstances:
            </p>
            
            <h3 className="text-[14px] font-semibold mb-2 mt-4">4.1 With Other Users</h3>
            <p className="text-[14px] text-gray-700 leading-relaxed mb-3">
              Your profile information, reviews, photos, and activity may be visible to other users of the Service based on your privacy settings.
            </p>

            <h3 className="text-[14px] font-semibold mb-2 mt-4">4.2 With Service Providers</h3>
            <p className="text-[14px] text-gray-700 leading-relaxed mb-3">
              We share information with third-party service providers who perform services on our behalf, such as payment processing, data analysis, email delivery, hosting services, and customer service.
            </p>

            <h3 className="text-[14px] font-semibold mb-2 mt-4">4.3 For Legal Purposes</h3>
            <p className="text-[14px] text-gray-700 leading-relaxed mb-3">
              We may disclose your information if required by law or in response to valid legal requests, such as subpoenas, court orders, or government investigations.
            </p>

            <h3 className="text-[14px] font-semibold mb-2 mt-4">4.4 Business Transfers</h3>
            <p className="text-[14px] text-gray-700 leading-relaxed mb-3">
              In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.
            </p>

            <h3 className="text-[14px] font-semibold mb-2 mt-4">4.5 With Your Consent</h3>
            <p className="text-[14px] text-gray-700 leading-relaxed">
              We may share your information for other purposes with your explicit consent.
            </p>
          </section>

          {/* Cookies and Tracking */}
          <section>
            <h2 className="text-[16px] font-bold mb-3">5. Cookies and Tracking Technologies</h2>
            <p className="text-[14px] text-gray-700 leading-relaxed mb-2">
              We use cookies, web beacons, and similar tracking technologies to collect and store information about your preferences and activities.
            </p>
            
            <h3 className="text-[14px] font-semibold mb-2 mt-4">5.1 Types of Cookies We Use</h3>
            <ul className="list-disc pl-6 space-y-1 text-[14px] text-gray-700 mb-3">
              <li><strong>Essential Cookies:</strong> Necessary for the Service to function properly</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how users interact with the Service</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
              <li><strong>Advertising Cookies:</strong> Deliver relevant advertisements and track campaign effectiveness</li>
            </ul>

            <h3 className="text-[14px] font-semibold mb-2 mt-4">5.2 EU Cookie Law Compliance</h3>
            <p className="text-[14px] text-gray-700 leading-relaxed mb-2">
              <strong>For European Union Users:</strong> We comply with the EU Cookie Law (ePrivacy Directive) and GDPR requirements. When you first access our Service from the EU, you will be presented with a cookie consent banner.
            </p>
            <p className="text-[14px] text-gray-700 leading-relaxed mb-3">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-[14px] text-gray-700 mb-3">
              <li>Accept or reject non-essential cookies</li>
              <li>Withdraw your consent at any time through your device settings</li>
              <li>Opt-out of targeted advertising cookies</li>
            </ul>
            <p className="text-[14px] text-gray-700 leading-relaxed">
              You can manage your cookie preferences through your browser settings. Note that disabling certain cookies may limit your ability to use some features of the Service.
            </p>
          </section>

          {/* California Privacy Rights */}
          <section>
            <h2 className="text-[16px] font-bold mb-3">6. California Privacy Rights (CCPA)</h2>
            <p className="text-[14px] text-gray-700 leading-relaxed mb-2">
              <strong>For California Residents:</strong> The California Consumer Privacy Act (CCPA) provides California residents with specific rights regarding their personal information.
            </p>

            <h3 className="text-[14px] font-semibold mb-2 mt-4">6.1 Your Rights</h3>
            <p className="text-[14px] text-gray-700 leading-relaxed mb-2">
              California residents have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-[14px] text-gray-700 mb-3">
              <li><strong>Right to Know:</strong> Request information about the categories and specific pieces of personal information we have collected about you</li>
              <li><strong>Right to Delete:</strong> Request deletion of your personal information, subject to certain exceptions</li>
              <li><strong>Right to Opt-Out:</strong> Opt-out of the "sale" of your personal information (we do not sell personal information)</li>
              <li><strong>Right to Non-Discrimination:</strong> Not be discriminated against for exercising your CCPA rights</li>
            </ul>

            <h3 className="text-[14px] font-semibold mb-2 mt-4">6.2 Categories of Personal Information Collected</h3>
            <p className="text-[14px] text-gray-700 leading-relaxed mb-2">
              In the past 12 months, we have collected the following categories of personal information:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-[14px] text-gray-700 mb-3">
              <li>Identifiers (name, email, phone number)</li>
              <li>Commercial information (purchase history, payment information)</li>
              <li>Internet or network activity (browsing history, app interactions)</li>
              <li>Geolocation data (precise location information)</li>
              <li>Visual information (photos, profile pictures)</li>
              <li>Inferences (preferences, characteristics, behavior)</li>
            </ul>

            <h3 className="text-[14px] font-semibold mb-2 mt-4">6.3 Do Not Sell My Personal Information</h3>
            <p className="text-[14px] text-gray-700 leading-relaxed mb-2">
              We do not sell your personal information to third parties. We may share information with service providers and partners as described in this Privacy Policy, but we do not receive monetary compensation for such sharing.
            </p>

            <h3 className="text-[14px] font-semibold mb-2 mt-4">6.4 How to Exercise Your Rights</h3>
            <p className="text-[14px] text-gray-700 leading-relaxed mb-2">
              To exercise your California privacy rights, please contact us using the information in the "Contact Us" section below. We will verify your identity before processing your request.
            </p>
            <p className="text-[14px] text-gray-700 leading-relaxed">
              You may also designate an authorized agent to make requests on your behalf. The authorized agent must provide proof of authorization.
            </p>
          </section>

          {/* GDPR Rights */}
          <section>
            <h2 className="text-[16px] font-bold mb-3">7. European Data Protection Rights (GDPR)</h2>
            <p className="text-[14px] text-gray-700 leading-relaxed mb-2">
              <strong>For European Union Users:</strong> If you are in the European Economic Area (EEA), you have certain data protection rights under the General Data Protection Regulation (GDPR).
            </p>

            <h3 className="text-[14px] font-semibold mb-2 mt-4">7.1 Your Rights</h3>
            <ul className="list-disc pl-6 space-y-1 text-[14px] text-gray-700 mb-3">
              <li><strong>Right of Access:</strong> Request a copy of your personal data</li>
              <li><strong>Right to Rectification:</strong> Request correction of inaccurate data</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
              <li><strong>Right to Restrict Processing:</strong> Request limitation of how we use your data</li>
              <li><strong>Right to Data Portability:</strong> Receive your data in a portable format</li>
              <li><strong>Right to Object:</strong> Object to processing of your data for certain purposes</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time where we rely on consent</li>
            </ul>

            <h3 className="text-[14px] font-semibold mb-2 mt-4">7.2 Legal Basis for Processing</h3>
            <p className="text-[14px] text-gray-700 leading-relaxed mb-2">
              We process your personal data based on the following legal grounds:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-[14px] text-gray-700 mb-3">
              <li>Performance of a contract with you</li>
              <li>Your consent</li>
              <li>Compliance with legal obligations</li>
              <li>Our legitimate interests (e.g., improving the Service, fraud prevention)</li>
            </ul>

            <h3 className="text-[14px] font-semibold mb-2 mt-4">7.3 Data Transfers</h3>
            <p className="text-[14px] text-gray-700 leading-relaxed">
              Your information may be transferred to and processed in the United States. We ensure appropriate safeguards are in place for international data transfers, including Standard Contractual Clauses approved by the European Commission.
            </p>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-[16px] font-bold mb-3">8. Data Security</h2>
            <p className="text-[14px] text-gray-700 leading-relaxed mb-2">
              We implement reasonable security measures to protect your information from unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-[14px] text-gray-700 mb-3">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments and audits</li>
              <li>Access controls and authentication requirements</li>
              <li>Employee training on data protection</li>
            </ul>
            <p className="text-[14px] text-gray-700 leading-relaxed">
              However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-[16px] font-bold mb-3">9. Data Retention</h2>
            <p className="text-[14px] text-gray-700 leading-relaxed mb-2">
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
            </p>
            <p className="text-[14px] text-gray-700 leading-relaxed">
              When you delete your account, we will delete or anonymize your personal information within 90 days, except where we are required to retain it for legal, regulatory, or legitimate business purposes.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-[16px] font-bold mb-3">10. Children's Privacy</h2>
            <p className="text-[14px] text-gray-700 leading-relaxed mb-2">
              Our Service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
            </p>
            <p className="text-[14px] text-gray-700 leading-relaxed">
              For users between 13 and 18, we recommend parental guidance when using the Service.
            </p>
          </section>

          {/* Your Choices */}
          <section>
            <h2 className="text-[16px] font-bold mb-3">11. Your Privacy Choices</h2>
            <p className="text-[14px] text-gray-700 leading-relaxed mb-2">
              You have several choices regarding your information:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-[14px] text-gray-700 mb-3">
              <li><strong>Account Information:</strong> Update your profile information in the app settings</li>
              <li><strong>Location Services:</strong> Disable location tracking in your device settings</li>
              <li><strong>Marketing Communications:</strong> Opt-out of promotional emails by clicking "unsubscribe"</li>
              <li><strong>Push Notifications:</strong> Disable notifications in your device settings</li>
              <li><strong>Cookies:</strong> Manage cookies through your browser settings</li>
              <li><strong>Account Deletion:</strong> Delete your account through the app settings</li>
            </ul>
          </section>

          {/* Third-Party Links */}
          <section>
            <h2 className="text-[16px] font-bold mb-3">12. Third-Party Links and Services</h2>
            <p className="text-[14px] text-gray-700 leading-relaxed mb-2">
              The Service may contain links to third-party websites and services. We are not responsible for the privacy practices of these third parties. We encourage you to read their privacy policies.
            </p>
            <p className="text-[14px] text-gray-700 leading-relaxed">
              Some features may use third-party APIs or services (e.g., Google Maps, payment processors). These third parties may collect information as described in their own privacy policies.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section>
            <h2 className="text-[16px] font-bold mb-3">13. Changes to This Privacy Policy</h2>
            <p className="text-[14px] text-gray-700 leading-relaxed mb-2">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-[14px] text-gray-700 mb-3">
              <li>Posting the new Privacy Policy on this page</li>
              <li>Updating the "Last Updated" date</li>
              <li>Sending you an in-app notification or email</li>
            </ul>
            <p className="text-[14px] text-gray-700 leading-relaxed">
              Your continued use of the Service after changes become effective constitutes your acceptance of the revised Privacy Policy.
            </p>
          </section>

          {/* International Users */}
          <section>
            <h2 className="text-[16px] font-bold mb-3">14. International Users</h2>
            <p className="text-[14px] text-gray-700 leading-relaxed">
              If you are accessing the Service from outside the United States, please be aware that your information may be transferred to, stored, and processed in the United States. By using the Service, you consent to the transfer of your information to the United States and other countries where we operate.
            </p>
          </section>

          {/* Contact & Support */}
          <section className="border-t-2 border-gray-300 pt-6 mt-8">
            <h2 className="text-[18px] font-bold mb-4">15. Contact Us & Support</h2>
            <p className="text-[14px] text-gray-700 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy, want to exercise your privacy rights, or need support, please contact us:
            </p>

            {/* Support Contact Cards */}
            <div className="space-y-3">
              {/* Email Support */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[14px] font-semibold mb-1">Email Support</h3>
                    <p className="text-[13px] text-gray-600 mb-2">For general inquiries and support</p>
                    <a 
                      href="mailto:support@pique.app" 
                      className="text-[13px] text-blue-600 font-medium hover:text-blue-700"
                    >
                      support@pique.app
                    </a>
                  </div>
                </div>
              </div>

              {/* Privacy Inquiries */}
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[14px] font-semibold mb-1">Privacy & Data Rights</h3>
                    <p className="text-[13px] text-gray-600 mb-2">For CCPA, GDPR requests and data inquiries</p>
                    <a 
                      href="mailto:privacy@pique.app" 
                      className="text-[13px] text-purple-600 font-medium hover:text-purple-700"
                    >
                      privacy@pique.app
                    </a>
                  </div>
                </div>
              </div>

              {/* Phone Support */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[14px] font-semibold mb-1">Phone Support</h3>
                    <p className="text-[13px] text-gray-600 mb-2">Monday - Friday, 9am - 6pm PST</p>
                    <a 
                      href="tel:+13105551234" 
                      className="text-[13px] text-green-600 font-medium hover:text-green-700"
                    >
                      (310) 555-1234
                    </a>
                  </div>
                </div>
              </div>

              {/* In-App Support */}
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[14px] font-semibold mb-1">In-App Chat Support</h3>
                    <p className="text-[13px] text-gray-600 mb-2">Get instant help from our support team</p>
                    <p className="text-[13px] text-orange-600 font-medium">
                      Available in Settings → Help & Support
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mailing Address */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-[14px] font-semibold mb-2">Mailing Address</h3>
              <p className="text-[13px] text-gray-700 leading-relaxed">
                Pique, Inc.<br />
                123 Beach Blvd, Suite 200<br />
                Manhattan Beach, CA 90266<br />
                United States
              </p>
            </div>

            {/* Response Time */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-[12px] text-gray-700 leading-relaxed">
                <strong>Response Time:</strong> We aim to respond to all inquiries within 24-48 hours. For privacy rights requests, we will respond within 45 days as required by applicable law.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
