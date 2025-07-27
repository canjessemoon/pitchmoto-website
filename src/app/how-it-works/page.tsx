import { Navigation } from '@/components/ui/navigation'
import Link from 'next/link'

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#405B53] mb-4">
            How PitchMoto Works
          </h1>
          <p className="text-xl text-gray-600">
            Connecting startups with investors in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* For Founders */}
          <div className="text-center">
            <div className="w-16 h-16 bg-[#E64E1B] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">1</span>
            </div>
            <h3 className="text-xl font-semibold text-[#405B53] mb-2">Create Your Pitch</h3>
            <p className="text-gray-600">
              Upload your startup details, pitch deck, and demo video to showcase your vision.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-[#E64E1B] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">2</span>
            </div>
            <h3 className="text-xl font-semibold text-[#405B53] mb-2">Get Discovered</h3>
            <p className="text-gray-600">
              Investors browse and upvote pitches they find interesting and promising.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-[#E64E1B] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">3</span>
            </div>
            <h3 className="text-xl font-semibold text-[#405B53] mb-2">Connect & Grow</h3>
            <p className="text-gray-600">
              Interested investors reach out directly to discuss funding opportunities.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-12">
          {/* For Founders */}
          <div className="bg-gray-50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-[#405B53] mb-4">For Founders</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-[#E64E1B] mr-2">✓</span>
                Create compelling startup profiles
              </li>
              <li className="flex items-start">
                <span className="text-[#E64E1B] mr-2">✓</span>
                Upload pitch decks and demo videos
              </li>
              <li className="flex items-start">
                <span className="text-[#E64E1B] mr-2">✓</span>
                Track engagement and analytics
              </li>
              <li className="flex items-start">
                <span className="text-[#E64E1B] mr-2">✓</span>
                Connect with interested investors
              </li>
              <li className="flex items-start">
                <span className="text-[#E64E1B] mr-2">✓</span>
                Always free to use
              </li>
            </ul>
          </div>

          {/* For Investors */}
          <div className="bg-gray-50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-[#405B53] mb-4">For Investors</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-[#E64E1B] mr-2">✓</span>
                Discover trending startups
              </li>
              <li className="flex items-start">
                <span className="text-[#E64E1B] mr-2">✓</span>
                Filter by industry and stage
              </li>
              <li className="flex items-start">
                <span className="text-[#E64E1B] mr-2">✓</span>
                Upvote promising pitches
              </li>
              <li className="flex items-start">
                <span className="text-[#E64E1B] mr-2">✓</span>
                Build watchlists of favorites
              </li>
              <li className="flex items-start">
                <span className="text-[#E64E1B] mr-2">✓</span>
                Direct messaging (premium)
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/signup"
            className="bg-[#E64E1B] text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium inline-block"
          >
            Get Started Today
          </Link>
        </div>
      </main>
    </div>
  )
}
