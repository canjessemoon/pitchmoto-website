'use client'

import Link from 'next/link'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link href="/" className="flex justify-center">
            <span className="text-3xl font-bold">
              <span className="text-blue-600">Pitch</span>
              <span className="text-indigo-500">Moto</span>
            </span>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Join PitchMoto
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Choose how you'd like to get started
          </p>
          <p className="mt-1 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/signin" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>
        
        <div className="space-y-4">
          {/* Founder Signup */}
          <Link
            href="/signup/founder"
            className="group relative w-full flex items-center justify-center py-6 px-4 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-gray-50 transition-all duration-200"
          >
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                I'm a Founder
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Share my startup and pitch with investors
              </p>
              <div className="mt-3 text-xs text-gray-500">
                • Create startup profile<br />
                • Upload pitch deck & video<br />
                • Connect with investors<br />
                • Always free
              </div>
            </div>
          </Link>

          {/* Investor Signup */}
          <Link
            href="/signup/investor"
            className="group relative w-full flex items-center justify-center py-6 px-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-gray-50 transition-all duration-200"
          >
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-indigo-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-500">
                I'm an Investor
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Discover and invest in promising startups
              </p>
              <div className="mt-3 text-xs text-gray-500">
                • Browse startup pitches<br />
                • Upvote & comment<br />
                • Direct messaging<br />
                • Free & paid tiers
              </div>
            </div>
          </Link>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:text-blue-500">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-blue-600 hover:text-blue-500">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
