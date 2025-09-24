import { Navigation } from '@/components/ui/navigation'
import Link from 'next/link'
import { ArrowRight, Upload, Eye, MessageCircle, TrendingUp } from 'lucide-react'

export default function HowItWorksFoundersPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Raise smarter, not harder.
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            No more waiting for demo days or cold intros. Publish once, reach many. 
            Get your startup in front of investors who are actively looking for deals like yours.
          </p>
          <Link
            href="/signup/founder"
            className="inline-flex items-center px-8 py-3 border border-transparent text-lg font-medium rounded-md text-white bg-blue-600 hover:bg-indigo-500 transition-colors"
          >
            Publish your first pitch today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>

        {/* Why It Matters */}
        <div className="bg-gray-50 rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Why founders choose PitchMoto
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Always discoverable</h3>
              <p className="text-gray-600">Your pitch works 24/7, not just during events</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Track engagement</h3>
              <p className="text-gray-600">See who's viewing and engaging with your pitch</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Direct connections</h3>
              <p className="text-gray-600">Investors reach out when they're interested</p>
            </div>
          </div>
        </div>

        {/* How It Works - Founder Flow */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            How it works for founders
          </h2>
          
          <div className="space-y-12">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">1</div>
                  <h3 className="text-2xl font-semibold">Create your startup profile</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Showcase your startup, team, and traction. Add your company details, founding story, 
                  and key metrics that investors care about.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center"><span className="text-blue-600 mr-2">✓</span>Company overview and mission</li>
                  <li className="flex items-center"><span className="text-blue-600 mr-2">✓</span>Team bios and backgrounds</li>
                  <li className="flex items-center"><span className="text-blue-600 mr-2">✓</span>Traction and key metrics</li>
                </ul>
              </div>
              <div className="md:w-1/2">
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <Upload className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-500">Profile creation interface preview</p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-8">
              <div className="md:w-1/2">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">2</div>
                  <h3 className="text-2xl font-semibold">Upload your deck, video, or one-pager</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Share your pitch materials in the format that works best for you. 
                  All formats are supported and beautifully displayed.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center"><span className="text-blue-600 mr-2">✓</span>PDF pitch decks</li>
                  <li className="flex items-center"><span className="text-blue-600 mr-2">✓</span>Demo videos</li>
                  <li className="flex items-center"><span className="text-blue-600 mr-2">✓</span>One-page summaries</li>
                </ul>
              </div>
              <div className="md:w-1/2">
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <Upload className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-500">Pitch upload interface preview</p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">3</div>
                  <h3 className="text-2xl font-semibold">Get discovered, track views & upvotes</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Your pitch appears in investor feeds based on their preferences. 
                  Track engagement and see what resonates.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center"><span className="text-blue-600 mr-2">✓</span>Real-time view analytics</li>
                  <li className="flex items-center"><span className="text-blue-600 mr-2">✓</span>Investor upvotes and saves</li>
                  <li className="flex items-center"><span className="text-blue-600 mr-2">✓</span>Engagement insights</li>
                </ul>
              </div>
              <div className="md:w-1/2">
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <Eye className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-500">Analytics dashboard preview</p>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-8">
              <div className="md:w-1/2">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">4</div>
                  <h3 className="text-2xl font-semibold">Connect with investors when they engage</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  When investors are interested, they can reach out directly. 
                  No more cold outreach - they come to you.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center"><span className="text-blue-600 mr-2">✓</span>Direct investor messages</li>
                  <li className="flex items-center"><span className="text-blue-600 mr-2">✓</span>Meeting requests</li>
                  <li className="flex items-center"><span className="text-blue-600 mr-2">✓</span>Investment conversations</li>
                </ul>
              </div>
              <div className="md:w-1/2">
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <MessageCircle className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-500">Messaging interface preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Proof Section */}
        <div className="bg-blue-50 rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Resources to help you shine
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Pitch Deck Templates</h3>
              <p className="text-gray-600 text-sm mb-4">Professional templates for different industries</p>
              <Link href="/resources" className="text-blue-600 hover:text-blue-800 font-medium">
                Download Templates →
              </Link>
            </div>
            <div className="bg-white rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Video Creation Guides</h3>
              <p className="text-gray-600 text-sm mb-4">Step-by-step guides for compelling pitch videos</p>
              <Link href="/resources" className="text-blue-600 hover:text-blue-800 font-medium">
                Learn Video Creation →
              </Link>
            </div>
            <div className="bg-white rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Financial Models</h3>
              <p className="text-gray-600 text-sm mb-4">Simple projection templates for growth modeling</p>
              <Link href="/resources" className="text-blue-600 hover:text-blue-800 font-medium">
                Get Templates →
              </Link>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to get discovered?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join hundreds of founders already raising on PitchMoto
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup/founder"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-lg font-medium rounded-md text-white bg-blue-600 hover:bg-indigo-500 transition-colors"
            >
              Publish your first pitch today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-lg font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Back to overview
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}