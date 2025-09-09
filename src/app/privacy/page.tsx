import { Navigation } from '@/components/ui/navigation'
import Link from 'next/link'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-[#405B53] mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#405B53] mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                PitchMoto ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform that connects startup founders with investors.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#405B53] mb-4">2. Information We Collect</h2>
              
              <div className="text-gray-700 space-y-4">
                <h3 className="text-lg font-semibold text-[#405B53]">2.1 Personal Information You Provide</h3>
                <ul className="list-disc ml-6 space-y-1">
                  <li><strong>Account Information:</strong> Name, email address, password, phone number</li>
                  <li><strong>Profile Information:</strong> Job title, company name, bio, profile photo</li>
                  <li><strong>Address Information:</strong> Business address, city, state/province, postal code, country</li>
                  <li><strong>For Founders:</strong> Company details, pitch decks, business plans, financial information</li>
                  <li><strong>For Investors:</strong> Investment preferences, portfolio information, fund details</li>
                  <li><strong>Payment Information:</strong> Credit card details for paid subscriptions (processed securely by third-party payment processors)</li>
                </ul>

                <h3 className="text-lg font-semibold text-[#405B53] mt-6">2.2 Information We Collect Automatically</h3>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Device information (IP address, browser type, operating system)</li>
                  <li>Usage data (pages visited, time spent, interactions)</li>
                  <li>Cookies and similar tracking technologies</li>
                  <li>Log files and analytics data</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#405B53] mb-4">3. How We Use Your Information</h2>
              <div className="text-gray-700 space-y-4">
                <p>We use the information we collect to:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Provide, operate, and maintain our platform</li>
                  <li>Create and manage user accounts</li>
                  <li>Facilitate connections between founders and investors</li>
                  <li>Process payments and manage subscriptions</li>
                  <li>Send administrative and promotional communications</li>
                  <li>Improve our services and develop new features</li>
                  <li>Ensure platform security and prevent fraud</li>
                  <li>Comply with legal obligations</li>
                  <li>Provide customer support</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#405B53] mb-4">4. How We Share Your Information</h2>
              <div className="text-gray-700 space-y-4">
                <h3 className="text-lg font-semibold text-[#405B53]">4.1 With Other Users</h3>
                <p>
                  Your profile information and content you choose to share (such as pitch decks) will be visible to other users of the platform according to your privacy settings and user type.
                </p>

                <h3 className="text-lg font-semibold text-[#405B53] mt-6">4.2 With Service Providers</h3>
                <p>
                  We may share your information with third-party service providers who perform services on our behalf, including payment processing, email delivery, hosting, analytics, and customer support.
                </p>

                <h3 className="text-lg font-semibold text-[#405B53] mt-6">4.3 For Legal Reasons</h3>
                <p>
                  We may disclose your information if required by law or if we believe such disclosure is necessary to protect our rights, comply with legal proceedings, or protect the safety of our users.
                </p>

                <h3 className="text-lg font-semibold text-[#405B53] mt-6">4.4 Business Transfers</h3>
                <p>
                  If we are involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#405B53] mb-4">5. Data Security</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure.
                </p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Secure authentication and access controls</li>
                  <li>Regular security audits and monitoring</li>
                  <li>Employee training on data protection</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#405B53] mb-4">6. Analytics and Tracking</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  <strong>By using Pitchmoto, you acknowledge that we collect and process certain analytics data in accordance with our Privacy Policy. Analytics data is used only to improve our services and is not sold to third parties.</strong>
                </p>
                <p>
                  We use Google Analytics to understand how users interact with our platform and improve our services. Our analytics implementation is configured to:
                </p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Anonymize IP addresses to protect user privacy</li>
                  <li>Remove personally identifiable information from tracking data</li>
                  <li>Disable cross-device tracking and ad personalization</li>
                  <li>Focus on aggregate usage patterns rather than individual behavior</li>
                </ul>
                <p>
                  You can opt out of Google Analytics by installing the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-[#E64E1B] hover:underline">Google Analytics Opt-out Browser Add-on</a>.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#405B53] mb-4">7. Your Rights and Choices</h2>
              <div className="text-gray-700 space-y-4">
                <p>Depending on your location, you may have certain rights regarding your personal information:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information (subject to certain exceptions)</li>
                  <li><strong>Portability:</strong> Request a copy of your data in a machine-readable format</li>
                  <li><strong>Objection:</strong> Object to certain types of processing</li>
                  <li><strong>Withdrawal of Consent:</strong> Withdraw consent where processing is based on consent</li>
                </ul>
                <p>
                  To exercise these rights, please contact us at privacy@pitchmoto.com.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#405B53] mb-4">8. Cookies and Tracking Technologies</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  We use cookies and similar tracking technologies to enhance your experience on our platform. You have full control over cookie settings through our cookie consent banner and your browser preferences.
                </p>
                <p>
                  For detailed information about our cookie usage, including types of cookies, third-party services, and your control options, please see our dedicated <Link href="/cookies" className="text-[#E64E1B] hover:underline">Cookie Policy</Link>.
                </p>
                <p>Summary of cookie types:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li><strong>Necessary cookies:</strong> Essential for platform functionality (always active)</li>
                  <li><strong>Analytics cookies:</strong> Help us understand platform usage (requires your consent)</li>
                  <li><strong>Preference cookies:</strong> Remember your settings (requires your consent)</li>
                  <li><strong>Marketing cookies:</strong> Currently not implemented</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#405B53] mb-4">9. Data Retention</h2>
              <p className="text-gray-700 mb-4">
                We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. When you delete your account, we will delete or anonymize your personal information, though some information may be retained for legal or legitimate business purposes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#405B53] mb-4">10. International Data Transfers</h2>
              <p className="text-gray-700 mb-4">
                Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your information in accordance with applicable data protection laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#405B53] mb-4">11. Children's Privacy</h2>
              <p className="text-gray-700 mb-4">
                Our platform is not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18. If you become aware that a child has provided us with personal information, please contact us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#405B53] mb-4">12. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. Your continued use of our platform after such modifications constitutes acceptance of the updated Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#405B53] mb-4">13. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
              </p>
              <div className="text-gray-700">
                <p><strong>Email:</strong> privacy@pitchmoto.com</p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link href="/" className="text-[#E64E1B] hover:text-orange-600">
              ← Back to PitchMoto
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
