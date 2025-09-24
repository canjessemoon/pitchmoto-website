import { Navigation } from '@/components/ui/navigation'
import Link from 'next/link'
import { ArrowRight, Search, Filter, Heart, MessageCircle, TrendingUp } from 'lucide-react'

export default function HowItWorksInvestorsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Smarter dealflow, any day of the year.
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Find startups beyond your network, save time sourcing. 
            Discover structured, searchable pitches from founders actively raising capital.
          </p>
          <Link
            href="/signup/investor"
            className="inline-flex items-center px-8 py-3 border border-transparent text-lg font-medium rounded-md text-white bg-blue-600 hover:bg-indigo-500 transition-colors"
          >
            Discover your next deal today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>

        {/* Why It Matters */}
        <div className="bg-gray-50 rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Why investors choose PitchMoto
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Expanded sourcing</h3>
              <p className="text-gray-600">Discover deals beyond your existing network</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Efficient filtering</h3>
              <p className="text-gray-600">Find exactly what you're looking for with smart filters</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Quality deals</h3>
              <p className="text-gray-600">Structured pitches with all the info you need</p>
            </div>
          </div>
        </div>

        {/* How It Works - Investor Flow */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            How it works for investors
          </h2>
          
          <div className="space-y-12">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">1</div>
                  <h3 className="text-2xl font-semibold">Create your investor profile</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Set your investment preferences including stage, sector, geography, and check size. 
                  This helps founders understand what you're looking for.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center"><span className="text-blue-600 mr-2">✓</span>Investment stage preferences</li>
                  <li className="flex items-center"><span className="text-blue-600 mr-2">✓</span>Sector and industry focus</li>
                  <li className="flex items-center"><span className="text-blue-600 mr-2">✓</span>Geographic preferences</li>
                  <li className="flex items-center"><span className="text-blue-600 mr-2">✓</span>Check size ranges</li>
                </ul>
              </div>
              <div className="md:w-1/2">
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <Search className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-500">Investor profile creation interface</p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-8">
              <div className="md:w-1/2">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">2</div>
                  <h3 className="text-2xl font-semibold">Browse and filter structured pitches</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Every pitch is structured with consistent information. Filter by stage, sector, 
                  funding amount, location, and more to find exactly what you're looking for.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center"><span className="text-blue-600 mr-2">✓</span>Smart filtering by multiple criteria</li>
                  <li className="flex items-center"><span className="text-blue-600 mr-2">✓</span>Consistent pitch formats</li>
                  <li className="flex items-center"><span className="text-blue-600 mr-2">✓</span>Key metrics at a glance</li>
                </ul>
              </div>
              <div className="md:w-1/2">
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <Filter className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-500">Pitch browsing and filtering interface</p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">3</div>
                  <h3 className="text-2xl font-semibold">Upvote, comment, and track favorites</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Show interest by upvoting promising startups. Save your favorites to watchlists 
                  and add comments for your deal notes.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center"><span className="text-blue-600 mr-2">✓</span>Upvote promising startups</li>
                  <li className="flex items-center"><span className="text-blue-600 mr-2">✓</span>Organized watchlists</li>
                  <li className="flex items-center"><span className="text-blue-600 mr-2">✓</span>Private deal notes</li>
                </ul>
              </div>
              <div className="md:w-1/2">
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <Heart className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-500">Engagement and watchlist interface</p>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-8">
              <div className="md:w-1/2">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">4</div>
                  <h3 className="text-2xl font-semibold">Message founders directly</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  When you find a startup you want to learn more about, reach out directly through 
                  our messaging system. No need for warm introductions.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center"><span className="text-blue-600 mr-2">✓</span>Direct founder messaging</li>
                  <li className="flex items-center"><span className="text-blue-600 mr-2">✓</span>Schedule meetings</li>
                  <li className="flex items-center"><span className="text-blue-600 mr-2">✓</span>Request additional information</li>
                </ul>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <p className="text-blue-800 text-sm font-medium">
                    💎 Premium feature: Direct messaging available with investor subscription
                  </p>
                </div>
              </div>
              <div className="md:w-1/2">
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <MessageCircle className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-500">Direct messaging interface</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Proof Section */}
        <div className="bg-blue-50 rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            What you'll discover
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">200+</div>
              <h3 className="text-lg font-semibold mb-2">Active Startups</h3>
              <p className="text-gray-600 text-sm">From pre-seed to Series A across all industries</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">15</div>
              <h3 className="text-lg font-semibold mb-2">Industries</h3>
              <p className="text-gray-600 text-sm">FinTech, HealthTech, SaaS, AI, and more</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
              <h3 className="text-lg font-semibold mb-2">Access</h3>
              <p className="text-gray-600 text-sm">No waiting for demo days or pitch events</p>
            </div>
          </div>
        </div>

        {/* Pricing Preview */}
        <div className="bg-gray-50 rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Flexible access options
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-6 border">
              <h3 className="text-xl font-semibold mb-4">Free Access</h3>
              <ul className="space-y-2 text-gray-600 mb-6">
                <li className="flex items-center"><span className="text-blue-600 mr-2">✓</span>Browse all public pitches</li>
                <li className="flex items-center"><span className="text-blue-600 mr-2">✓</span>Upvote startups</li>
                <li className="flex items-center"><span className="text-blue-600 mr-2">✓</span>Create watchlists</li>
                <li className="flex items-center"><span className="text-blue-600 mr-2">✓</span>View founder profiles</li>
              </ul>
              <div className="text-2xl font-bold mb-2">Free</div>
              <p className="text-gray-500 text-sm">Perfect for exploring the platform</p>
            </div>
            <div className="bg-white rounded-lg p-6 border-2 border-blue-600">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Premium Access</h3>
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">Popular</span>
              </div>
              <ul className="space-y-2 text-gray-600 mb-6">
                <li className="flex items-center"><span className="text-blue-600 mr-2">✓</span>Everything in Free</li>
                <li className="flex items-center"><span className="text-blue-600 mr-2">✓</span>Direct messaging with founders</li>
                <li className="flex items-center"><span className="text-blue-600 mr-2">✓</span>Advanced filtering options</li>
                <li className="flex items-center"><span className="text-blue-600 mr-2">✓</span>Priority deal notifications</li>
              </ul>
              <div className="text-2xl font-bold mb-2">$49<span className="text-lg font-normal text-gray-500">/month</span></div>
              <p className="text-gray-500 text-sm">For active investors</p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to find your next investment?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join investors already discovering deals on PitchMoto
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup/investor"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-lg font-medium rounded-md text-white bg-blue-600 hover:bg-indigo-500 transition-colors"
            >
              Discover your next deal today
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