import { Navigation } from '@/components/ui/navigation'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            How PitchMoto Works
          </h1>
          <p className="text-xl text-gray-600">
            Connecting startups with investors in a few simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* For Everyone */}
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">1</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Your Profile</h3>
            <p className="text-gray-600">
              Founders and Investors showcase who they are and what they're looking for.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">2</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Share & Discover</h3>
            <p className="text-gray-600">
              Founders upload pitches. Investors browse, filter, and save startups they like.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">3</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect & Grow</h3>
            <p className="text-gray-600">
              Messaging and watchlists turn quick connections into lasting partnerships.
            </p>
          </div>
        </div>

        {/* Choose Your Path */}
        <div className="bg-gray-50 rounded-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Choose your path
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* For Founders */}
            <div className="bg-white rounded-lg p-8 border-2 border-transparent hover:border-blue-600 transition-colors">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">For Founders</h3>
              <p className="text-lg text-gray-600 mb-6">
                Raise smarter, not harder. Get discovered by investors actively looking for deals like yours.
              </p>
              <ul className="space-y-3 text-gray-600 mb-8">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  Upload your deck, video, or one-pager
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  Track engagement and analytics
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  Connect with interested investors
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  Always free to use
                </li>
              </ul>
              <div className="space-y-3">
                <Link
                  href="/how-it-works/founders"
                  className="block w-full text-center px-6 py-3 border border-blue-600 text-blue-600 font-medium rounded-md hover:bg-blue-50 transition-colors"
                >
                  Learn more for founders
                  <ArrowRight className="inline ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/signup/founder"
                  className="block w-full text-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-indigo-500 transition-colors"
                >
                  Join as Founder
                </Link>
              </div>
            </div>

            {/* For Investors */}
            <div className="bg-white rounded-lg p-8 border-2 border-transparent hover:border-blue-600 transition-colors">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">For Investors</h3>
              <p className="text-lg text-gray-600 mb-6">
                Smarter dealflow, any day of the year. Discover startups beyond your network.
              </p>
              <ul className="space-y-3 text-gray-600 mb-8">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  Browse structured, searchable pitches
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  Filter by industry, stage, and more
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  Save promising pitches to watchlists
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  Direct messaging (premium)
                </li>
              </ul>
              <div className="space-y-3">
                <Link
                  href="/how-it-works/investors"
                  className="block w-full text-center px-6 py-3 border border-blue-600 text-blue-600 font-medium rounded-md hover:bg-blue-50 transition-colors"
                >
                  Learn more for investors
                  <ArrowRight className="inline ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/signup/investor"
                  className="block w-full text-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-indigo-500 transition-colors"
                >
                  Join as Investor
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to homepage
          </Link>
        </div>
      </main>
    </div>
  )
}
