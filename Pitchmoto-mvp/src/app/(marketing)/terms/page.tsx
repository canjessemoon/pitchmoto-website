import Link from 'next/link'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using PitchMoto ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 mb-4">
                PitchMoto is a platform that connects startup founders with investors. Founders can create profiles, upload pitch decks, and showcase their startups. Investors can browse, discover, and connect with promising startups.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  <strong>3.1 Registration:</strong> You must register for an account to use certain features of the Service. You agree to provide accurate and complete information during registration.
                </p>
                <p>
                  <strong>3.2 Account Security:</strong> You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                </p>
                <p>
                  <strong>3.3 User Types:</strong> The Service supports two types of users: Founders (who create startup profiles and pitch content) and Investors (who browse and evaluate startups).
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Acceptable Use</h2>
              <div className="text-gray-700 space-y-4">
                <p>You agree not to use the Service to:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Upload false, misleading, or fraudulent information about your startup or investment credentials</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on intellectual property rights of others</li>
                  <li>Spam or send unsolicited communications</li>
                  <li>Use automated tools to access the Service without permission</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Content and Intellectual Property</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  <strong>5.1 User Content:</strong> You retain ownership of content you submit to the Service, but grant PitchMoto a license to use, display, and distribute your content on the platform.
                </p>
                <p>
                  <strong>5.2 Platform Content:</strong> The Service and its original content, features, and functionality are owned by PitchMoto and are protected by copyright, trademark, and other laws.
                </p>
                <p>
                  <strong>5.3 Content Moderation:</strong> We reserve the right to review, moderate, and remove content that violates these terms or our community guidelines.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Paid Services</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  <strong>6.1 Investor Subscriptions:</strong> Certain features require a paid subscription. Subscription fees are billed monthly and are non-refundable except as required by law.
                </p>
                <p>
                  <strong>6.2 Free Trial:</strong> New paid accounts may include a free trial period. You may cancel before the trial ends to avoid charges.
                </p>
                <p>
                  <strong>6.3 Founder Access:</strong> Founders always have free access to create profiles and upload pitch content.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Privacy and Data Protection</h2>
              <p className="text-gray-700 mb-4">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Disclaimers and Limitation of Liability</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  <strong>8.1 No Investment Advice:</strong> PitchMoto does not provide investment advice. All investment decisions are made at your own risk.
                </p>
                <p>
                  <strong>8.2 Due Diligence:</strong> Investors are responsible for conducting their own due diligence on any investment opportunities.
                </p>
                <p>
                  <strong>8.3 Information Accuracy:</strong> PitchMoto is not liable for the accuracy, completeness, or reliability of any information presented on the platform by users, including but not limited to pitch decks, financial statements, business plans, company profiles, or any other content. Users are solely responsible for verifying the accuracy of all information before making any investment or business decisions.
                </p>
                <p>
                  <strong>8.4 Platform Liability:</strong> PitchMoto is not liable for any losses resulting from interactions between users or investment decisions made through the platform.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Termination</h2>
              <p className="text-gray-700 mb-4">
                We may terminate or suspend your account and access to the Service immediately, without prior notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify these terms at any time. We will notify users of significant changes via email or platform notification. Continued use of the Service constitutes acceptance of the modified terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="text-gray-700">
                <p><strong>Email:</strong> legal@pitchmoto.com</p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link href="/" className="text-blue-600 hover:text-blue-500">
              ← Back to PitchMoto
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
