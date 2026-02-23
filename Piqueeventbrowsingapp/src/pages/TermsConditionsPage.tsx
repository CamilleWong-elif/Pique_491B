import { ArrowLeft } from 'lucide-react';

interface TermsConditionsPageProps {
  onNavigate: (page: string) => void;
}

export function TermsConditionsPage({ onNavigate }: TermsConditionsPageProps) {
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
          <h1 className="text-[20px] font-bold">Terms & Conditions</h1>
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
              Welcome to Pique ("we," "our," or "us"). These Terms and Conditions ("Terms") govern your access to and use of the Pique mobile application and related services (collectively, the "Service").
            </p>
            <p className="text-[14px] text-gray-700 leading-relaxed">
              By accessing or using our Service, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Service.
            </p>
          </section>

          {/* Eligibility */}
          <section>
            <h2 className="text-[16px] font-bold mb-3">2. Eligibility</h2>
            <p className="text-[14px] text-gray-700 leading-relaxed mb-2">
              You must be at least 13 years old to use our Service. By using the Service, you represent and warrant that:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-[14px] text-gray-700">
              <li>You are at least 13 years of age</li>
              <li>You have the legal capacity to enter into these Terms</li>
              <li>You will comply with these Terms and all applicable laws</li>
              <li>You have not been previously suspended or removed from the Service</li>
            </ul>
          </section>

          {/* Account Registration */}
          <section>
            <h2 className="text-[16px] font-bold mb-3">3. Account Registration</h2>
            <p className="text-[14px] text-gray-700 leading-relaxed mb-2">
              To access certain features of the Service, you may need to register for an account. You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-[14px] text-gray-700">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your password and account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Accept responsibility for all activities that occur under your account</li>
            </ul>
          </section>

          {/* User Content */}
          <section>
            <h2 className="text-[16px] font-bold mb-3">4. User Content</h2>
            <p className="text-[14px] text-gray-700 leading-relaxed mb-2">
              Our Service allows you to post, upload, and share content including photos, reviews, and event information ("User Content"). You retain all rights to your User Content, but grant us a license to use it.
            </p>
            <p className="text-[14px] text-gray-700 leading-relaxed mb-2">
              By posting User Content, you grant Pique a worldwide, non-exclusive, royalty-free, transferable license to use, reproduce, distribute, display, and perform your User Content in connection with operating and improving the Service.
            </p>
            <p className="text-[14px] text-gray-700 leading-relaxed mb-2">
              You represent and warrant that:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-[14px] text-gray-700">
              <li>You own or have the necessary rights to your User Content</li>
              <li>Your User Content does not violate any laws or third-party rights</li>
              <li>Your User Content does not contain harmful, offensive, or inappropriate material</li>
            </ul>
          </section>

          {/* Prohibited Conduct */}
          <section>
            <h2 className="text-[16px] font-bold mb-3">5. Prohibited Conduct</h2>
            <p className="text-[14px] text-gray-700 leading-relaxed mb-2">
              You agree not to:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-[14px] text-gray-700">
              <li>Use the Service for any illegal purpose or in violation of any laws</li>
              <li>Impersonate any person or entity or misrepresent your affiliation</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Post false, misleading, or fraudulent content</li>
              <li>Spam or send unsolicited messages to other users</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Use automated systems or bots to access the Service</li>
              <li>Collect or harvest information about other users</li>
              <li>Reverse engineer or attempt to extract source code from the Service</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-[16px] font-bold mb-3">6. Intellectual Property</h2>
            <p className="text-[14px] text-gray-700 leading-relaxed mb-2">
              The Service and its original content (excluding User Content), features, and functionality are owned by Pique and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <p className="text-[14px] text-gray-700 leading-relaxed">
              Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.
            </p>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-[16px] font-bold mb-3">7. Third-Party Services</h2>
            <p className="text-[14px] text-gray-700 leading-relaxed mb-2">
              The Service may contain links to third-party websites or services that are not owned or controlled by Pique. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.
            </p>
            <p className="text-[14px] text-gray-700 leading-relaxed">
              You acknowledge and agree that Pique shall not be responsible or liable for any damage or loss caused by your use of any third-party services.
            </p>
          </section>

          {/* Payment and Fees */}
          <section>
            <h2 className="text-[16px] font-bold mb-3">8. Payment and Fees</h2>
            <p className="text-[14px] text-gray-700 leading-relaxed mb-2">
              Certain features of the Service may require payment. By purchasing a paid feature, you agree to pay the applicable fees. All fees are non-refundable unless otherwise stated.
            </p>
            <p className="text-[14px] text-gray-700 leading-relaxed">
              We reserve the right to change our fees at any time, but we will provide advance notice of any fee changes.
            </p>
          </section>

          {/* Disclaimer of Warranties */}
          <section>
            <h2 className="text-[16px] font-bold mb-3">9. Disclaimer of Warranties</h2>
            <p className="text-[14px] text-gray-700 leading-relaxed mb-2">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p className="text-[14px] text-gray-700 leading-relaxed">
              We do not warrant that the Service will be uninterrupted, secure, or error-free, or that any defects will be corrected. You use the Service at your own risk.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-[16px] font-bold mb-3">10. Limitation of Liability</h2>
            <p className="text-[14px] text-gray-700 leading-relaxed mb-2">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, PIQUE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
            </p>
            <p className="text-[14px] text-gray-700 leading-relaxed">
              IN NO EVENT SHALL PIQUE'S AGGREGATE LIABILITY EXCEED THE AMOUNT YOU PAID TO PIQUE IN THE TWELVE (12) MONTHS PRIOR TO THE EVENT GIVING RISE TO THE CLAIM, OR $100, WHICHEVER IS GREATER.
            </p>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="text-[16px] font-bold mb-3">11. Indemnification</h2>
            <p className="text-[14px] text-gray-700 leading-relaxed">
              You agree to indemnify, defend, and hold harmless Pique and its officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses, including reasonable attorney's fees, arising out of or in any way connected with your access to or use of the Service, your User Content, or your violation of these Terms.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-[16px] font-bold mb-3">12. Termination</h2>
            <p className="text-[14px] text-gray-700 leading-relaxed mb-2">
              We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including if you breach these Terms.
            </p>
            <p className="text-[14px] text-gray-700 leading-relaxed">
              Upon termination, your right to use the Service will immediately cease. All provisions of these Terms which by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, and limitations of liability.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-[16px] font-bold mb-3">13. Governing Law</h2>
            <p className="text-[14px] text-gray-700 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions. Any legal action or proceeding arising under these Terms will be brought exclusively in the federal or state courts located in Los Angeles County, California.
            </p>
          </section>

          {/* Dispute Resolution */}
          <section>
            <h2 className="text-[16px] font-bold mb-3">14. Dispute Resolution</h2>
            <p className="text-[14px] text-gray-700 leading-relaxed mb-2">
              Any dispute arising from these Terms or the Service shall be resolved through binding arbitration in accordance with the American Arbitration Association's rules, except that either party may bring an action in court to seek injunctive relief.
            </p>
            <p className="text-[14px] text-gray-700 leading-relaxed">
              You agree to waive your right to a jury trial and to participate in a class action lawsuit.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-[16px] font-bold mb-3">15. Changes to Terms</h2>
            <p className="text-[14px] text-gray-700 leading-relaxed mb-2">
              We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms on this page and updating the "Last Updated" date.
            </p>
            <p className="text-[14px] text-gray-700 leading-relaxed">
              Your continued use of the Service after any changes constitutes your acceptance of the new Terms.
            </p>
          </section>

          {/* Severability */}
          <section>
            <h2 className="text-[16px] font-bold mb-3">16. Severability</h2>
            <p className="text-[14px] text-gray-700 leading-relaxed">
              If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.
            </p>
          </section>

          {/* Entire Agreement */}
          <section>
            <h2 className="text-[16px] font-bold mb-3">17. Entire Agreement</h2>
            <p className="text-[14px] text-gray-700 leading-relaxed">
              These Terms constitute the entire agreement between you and Pique regarding the Service and supersede all prior agreements and understandings.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-[16px] font-bold mb-3">18. Contact Us</h2>
            <p className="text-[14px] text-gray-700 leading-relaxed mb-2">
              If you have any questions about these Terms, please contact us:
            </p>
            <div className="text-[14px] text-gray-700 space-y-1">
              <p>Email: legal@pique.app</p>
              <p>Address: 123 Beach Blvd, Manhattan Beach, CA 90266</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
