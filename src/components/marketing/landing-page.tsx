'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/components/providers'
import { Navigation } from '@/components/ui/navigation'

export function LandingPage() {
  const { user, loading } = useAuth()
  const [email, setEmail] = useState('')

  console.log('LandingPage render:', { user, loading }) // Debug log

  const handleEmailSignup = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      // Simple mailto integration like the static site
      const subject = encodeURIComponent('New Email Signup from PitchMoto MVP')
      const body = encodeURIComponent(`New user signed up: ${email}`)
      window.location.href = `mailto:jdmoon@gmail.com?subject=${subject}&body=${body}`
      setEmail('')
      alert('Thank you for your interest! We will be in touch soon.')
    }
  }

  // Temporarily skip loading check to see if that's the issue
  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-lg">Loading...</div>
  //     </div>
  //   )
  // }

  // Show loading state but allow page to continue
  if (loading) {
    console.log('Auth is still loading...')
  }

  // If user is authenticated, redirect to dashboard
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome back!</h1>
          <Link 
            href="/app" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-500 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-16 md:py-24">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Where startups get discovered.</span>
            <span className="block text-blue-600">Where investors find their edge.</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Skip demo days and endless intros. Publish your pitch once, reach investors any time. For investors, discover startups beyond your network — structured, searchable, and ready to connect.
          </p>
          
          <div className="mt-8">
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Link
                href="/signup/founder"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-indigo-500 transition-colors"
              >
                Join as Founder
              </Link>
              <Link
                href="/signup/investor"
                className="inline-flex items-center justify-center px-6 py-3 border border-blue-600 text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 transition-colors"
              >
                Join as Investor
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 bg-gray-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                How PitchMoto Works
              </h2>
            </div>
            <div className="mt-16">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                <div className="text-center">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-sky-200 mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600">1</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Create Your Profile</h3>
                  <p className="text-gray-500">
                    Founders and Investors showcase who they are and what they're looking for.
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-sky-200 mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600">2</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Share Your Pitch</h3>
                  <p className="text-gray-500">
                    Founders upload a deck, video, or one-pager — all in one place.
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-sky-200 mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600">3</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Discover & Connect</h3>
                  <p className="text-gray-500">
                    Investors browse, filter, and save startups they like.
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-sky-200 mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600">4</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Build Relationships</h3>
                  <p className="text-gray-500">
                    Messaging and watchlists turn quick connections into lasting partnerships.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resources Section */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
                Pitch better, faster.
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We give founders the tools to shine.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Pitch Deck Templates</h3>
                <p className="text-gray-600 mb-4">
                  Professional pitch deck templates for different industries and business models.
                </p>
                <Link 
                  href="/resources"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Download Templates →
                </Link>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Video Creation Guides</h3>
                <p className="text-gray-600 mb-4">
                  Step-by-step guides to creating compelling pitch videos that capture investor attention.
                </p>
                <Link 
                  href="/resources"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Learn Video Creation →
                </Link>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Financial Models</h3>
                <p className="text-gray-600 mb-4">
                  Simple financial projection templates and guides to model your startup's growth.
                </p>
                <Link 
                  href="/resources"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Get Templates →
                </Link>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <Link
                href="/resources"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#405B53] hover:bg-green-700"
              >
                View All Resources
              </Link>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
            Ready to raise? Ready to invest?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            PitchMoto is where startups and investors meet — on your timeline, your way.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup/founder"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-indigo-500 transition-colors"
            >
              Join as Founder →
            </Link>
            <Link
              href="/signup/investor"
              className="inline-flex items-center justify-center px-6 py-3 border border-blue-600 text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 transition-colors"
            >
              Join as Investor →
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
