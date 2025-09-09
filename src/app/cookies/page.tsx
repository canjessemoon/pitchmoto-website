import { Navigation } from '@/components/ui/navigation'
import Link from 'next/link'

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-[#405B53] mb-8">Cookie Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#405B53] mb-4">What are cookies?</h2>
              <p className="text-gray-700 mb-4">
                Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you visit a website. They help the website remember information about your visit, such as your preferred language and other settings, which can make your next visit easier and the site more useful to you.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#405B53] mb-4">How we use cookies</h2>
              <p className="text-gray-700 mb-4">
                PitchMoto uses cookies to enhance your browsing experience, analyze website performance, and provide personalized content. We are committed to being transparent about our cookie usage and giving you control over your preferences.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#405B53] mb-4">Types of cookies we use</h2>
              
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-[#405B53] mb-3">🔧 Necessary Cookies (Always Active)</h3>
                  <p className="text-gray-700 mb-3">
                    These cookies are essential for the proper functioning of our website. They enable basic features like page navigation, access to secure areas, and remember your cookie preferences. The website cannot function properly without these cookies.
                  </p>
                  <div className="text-sm text-gray-600">
                    <p><strong>Examples:</strong></p>
                    <ul className="list-disc ml-5 mt-1">
                      <li>Authentication cookies (keep you logged in)</li>
                      <li>Security cookies (protect against fraud)</li>
                      <li>Cookie consent preferences</li>
                      <li>Load balancing cookies</li>
                    </ul>
                    <p className="mt-2"><strong>Legal basis:</strong> Legitimate interest (essential for website functionality)</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-[#405B53] mb-3">📊 Analytics Cookies (Optional)</h3>
                  <p className="text-gray-700 mb-3">
                    These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. We use Google Analytics 4 with enhanced privacy settings to analyze website performance and improve user experience.
                  </p>
                  <div className="text-sm text-gray-600">
                    <p><strong>What we collect:</strong></p>
                    <ul className="list-disc ml-5 mt-1">
                      <li>Pages visited and time spent</li>
                      <li>Device type and browser information</li>
                      <li>General location (country/city level)</li>
                      <li>Referral sources (how you found us)</li>
                    </ul>
                    <p className="mt-2"><strong>Privacy protections:</strong></p>
                    <ul className="list-disc ml-5 mt-1">
                      <li>IP addresses are anonymized</li>
                      <li>No personally identifiable information collected</li>
                      <li>Data retention limited to 14 months</li>
                      <li>Cross-device tracking disabled</li>
                    </ul>
                    <p className="mt-2"><strong>Legal basis:</strong> Your consent</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-[#405B53] mb-3">⚙️ Preference Cookies (Optional)</h3>
                  <p className="text-gray-700 mb-3">
                    These cookies remember your settings and preferences to provide a more personalized experience on future visits, such as your preferred language, region, or accessibility settings.
                  </p>
                  <div className="text-sm text-gray-600">
                    <p><strong>Examples:</strong></p>
                    <ul className="list-disc ml-5 mt-1">
                      <li>Language preferences</li>
                      <li>Theme settings (dark/light mode)</li>
                      <li>Accessibility preferences</li>
                      <li>Form auto-fill preferences</li>
                    </ul>
                    <p className="mt-2"><strong>Legal basis:</strong> Your consent</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-[#405B53] mb-3">📢 Marketing Cookies (Optional)</h3>
                  <p className="text-gray-700 mb-3">
                    These cookies would be used to deliver relevant advertisements and track the effectiveness of marketing campaigns. <strong>Currently, we do not use marketing cookies on PitchMoto.</strong>
                  </p>
                  <div className="text-sm text-gray-600">
                    <p><strong>Status:</strong> Not implemented</p>
                    <p className="mt-2"><strong>Legal basis:</strong> Your consent (if implemented in the future)</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#405B53] mb-4">Third-party cookies</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  Some cookies on our website are set by third-party services. We only work with reputable partners who comply with privacy regulations.
                </p>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Google Analytics</h4>
                  <p className="text-blue-800 text-sm">
                    We use Google Analytics to understand website usage. Google may set cookies to enable this service. 
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                      Learn more about Google's privacy practices
                    </a>.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#405B53] mb-4">Your choices and controls</h2>
              <div className="text-gray-700 space-y-4">
                <h3 className="text-lg font-semibold text-[#405B53]">Cookie Consent Banner</h3>
                <p>
                  When you first visit PitchMoto, you'll see a cookie consent banner where you can:
                </p>
                <ul className="list-disc ml-6 space-y-1">
                  <li><strong>Accept All:</strong> Allow all cookie types</li>
                  <li><strong>Reject All:</strong> Only allow necessary cookies</li>
                  <li><strong>Customize:</strong> Choose specific cookie categories</li>
                </ul>

                <h3 className="text-lg font-semibold text-[#405B53] mt-6">Browser Settings</h3>
                <p>
                  You can also control cookies through your browser settings:
                </p>
                <ul className="list-disc ml-6 space-y-1">
                  <li><strong>Block all cookies:</strong> Most browsers allow you to block all cookies</li>
                  <li><strong>Delete existing cookies:</strong> Clear cookies already stored on your device</li>
                  <li><strong>Third-party cookie controls:</strong> Many browsers allow you to block third-party cookies specifically</li>
                </ul>
                <p className="text-sm text-gray-600 mt-2">
                  Note: Blocking necessary cookies may affect website functionality.
                </p>

                <h3 className="text-lg font-semibold text-[#405B53] mt-6">Google Analytics Opt-out</h3>
                <p>
                  You can opt out of Google Analytics specifically by installing the{' '}
                  <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-[#E64E1B] hover:underline">
                    Google Analytics Opt-out Browser Add-on
                  </a>.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#405B53] mb-4">Data retention</h2>
              <div className="text-gray-700 space-y-4">
                <ul className="list-disc ml-6 space-y-1">
                  <li><strong>Cookie consent preferences:</strong> Stored until you change them or clear your browser data</li>
                  <li><strong>Analytics data:</strong> Automatically deleted after 14 months</li>
                  <li><strong>Necessary cookies:</strong> Deleted when you close your browser session or after a set period</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#405B53] mb-4">International transfers</h2>
              <p className="text-gray-700 mb-4">
                Some of our third-party services (like Google Analytics) may transfer your data outside of your country. These transfers are protected by appropriate safeguards such as Standard Contractual Clauses and adequacy decisions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#405B53] mb-4">Updates to this policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Cookie Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by updating the "Last updated" date at the top of this policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#405B53] mb-4">Contact us</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about our use of cookies or this Cookie Policy, please contact us at:
              </p>
              <div className="text-gray-700">
                <p><strong>Email:</strong> privacy@pitchmoto.com</p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col sm:flex-row gap-4">
            <Link href="/" className="text-[#E64E1B] hover:text-orange-600">
              ← Back to PitchMoto
            </Link>
            <Link href="/privacy" className="text-[#405B53] hover:underline">
              View Privacy Policy
            </Link>
            <Link href="/terms" className="text-[#405B53] hover:underline">
              View Terms of Service
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
