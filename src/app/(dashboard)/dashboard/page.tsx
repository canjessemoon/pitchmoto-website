'use client'

import { useAuth } from '@/components/providers'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState, useEffect, useCallback, Suspense } from 'react'

interface Startup {
  id: string
  name: string
  tagline: string
  description: string
}

interface Pitch {
  id: string
  title: string
  status: string
  startup: {
    name: string
  }
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  )
}

function DashboardContent() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [showSavedSuccess, setShowSavedSuccess] = useState(false)
  const [startups, setStartups] = useState<Startup[]>([])
  const [pitches, setPitches] = useState<Pitch[]>([])
  // Remove unused loadingData state
  // const [loadingData, setLoadingData] = useState(true)

  const fetchUserData = useCallback(async () => {
    if (!user?.id) return
    
    try {
      // Fetch startups
      const startupsResponse = await fetch(`/api/startups?user_id=${user.id}`)
      if (startupsResponse.ok) {
        const startupsData = await startupsResponse.json()
        setStartups(startupsData.startups || [])
      }

      // Fetch pitches
      const pitchesResponse = await fetch(`/api/pitches?user_id=${user.id}`)
      if (pitchesResponse.ok) {
        const pitchesData = await pitchesResponse.json()
        setPitches(pitchesData.pitches || [])
      }
    } catch (error) {
      // Handle error silently for production
    }
  }, [user?.id])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin')
    } else if (user && user.profile?.user_type === 'founder') {
      fetchUserData()
    }
  }, [user, loading, router, fetchUserData])

  // Handle saved parameter client-side only
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return
    
    const urlParams = new URLSearchParams(window.location.search)
    const saved = urlParams.get('saved')
    
    if (saved === 'true') {
      setShowSavedSuccess(true)
      // Remove the parameter from URL after showing the message
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('saved')
      router.replace(newUrl.pathname + newUrl.search)
      
      // Hide the success message after 5 seconds
      setTimeout(() => {
        setShowSavedSuccess(false)
      }, 5000)
    }
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-blue-600">
                PitchMoto
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, {user.profile?.full_name || user.email}
              </span>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {user.profile?.user_type || 'User'}
              </span>
              <button
                onClick={handleSignOut}
                className="text-gray-500 hover:text-gray-700"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Success Message */}
        {showSavedSuccess && (
          <div className="mb-6 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div className="flex items-center">
              <div className="text-emerald-800">
                <svg className="h-5 w-5 mr-2 inline" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Your pitch has been saved successfully! You can edit it anytime.
              </div>
            </div>
          </div>
        )}
        
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to PitchMoto Dashboard
              </h1>
              <p className="text-gray-600 mb-8">
                Your {user.profile?.user_type === 'founder' ? 'startup' : 'investment'} journey starts here.
              </p>
              
              {user.profile?.user_type === 'founder' ? (
                <div className="space-y-6">
                  {/* Progress Steps */}
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Startup Journey</h2>
                    
                    {/* Step 1: Create Startup */}
                    <div className="flex items-start space-x-4 mb-6">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        startups.length > 0 ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {startups.length > 0 ? '✓' : '1'}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Step 1: Create Your Startup Profile
                        </h3>
                        <p className="text-gray-600 mb-3">
                          {startups.length > 0 
                            ? `✓ Complete! You have ${startups.length} startup${startups.length > 1 ? 's' : ''} created.`
                            : 'Set up your startup profile with your company details, vision, and goals.'
                          }
                        </p>
                        {startups.length === 0 ? (
                          <Link 
                            href="/create-startup"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
                          >
                            Create Your Startup
                          </Link>
                        ) : (
                          <div className="space-y-2">
                            {startups.map((startup) => (
                              <div key={startup.id} className="bg-gray-50 p-3 rounded border">
                                <h4 className="font-medium text-gray-900">{startup.name}</h4>
                                <p className="text-sm text-gray-600">{startup.tagline}</p>
                              </div>
                            ))}
                            <Link 
                              href="/create-startup"
                              className="inline-block text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              + Create Another Startup
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Step 2: Create Pitch */}
                    <div className="flex items-start space-x-4 mb-6">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        pitches.length > 0 ? 'bg-green-100 text-green-600' : 
                        startups.length > 0 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {pitches.length > 0 ? '✓' : '2'}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Step 2: Create Your Pitch
                        </h3>
                        <p className="text-gray-600 mb-3">
                          {pitches.length > 0 
                            ? `✓ Complete! You have ${pitches.length} pitch${pitches.length > 1 ? 'es' : ''} created.`
                            : startups.length > 0 
                              ? 'Create compelling pitches to attract investors.'
                              : 'Complete Step 1 first to create pitches for your startup.'
                          }
                        </p>
                        {startups.length === 0 ? (
                          <span className="text-gray-400 text-sm">Complete Step 1 first</span>
                        ) : pitches.length === 0 ? (
                          <Link 
                            href="/create-pitch"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
                          >
                            Create Your First Pitch
                          </Link>
                        ) : (
                          <div className="space-y-2">
                            {pitches.map((pitch) => (
                              <div key={pitch.id} className="bg-gray-50 p-3 rounded border">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-medium text-gray-900">{pitch.title}</h4>
                                    <p className="text-sm text-gray-600">Startup: {pitch.startup.name}</p>
                                  </div>
                                  <span className={`text-xs px-2 py-1 rounded ${
                                    pitch.status === 'published' 
                                      ? 'bg-green-100 text-green-700' 
                                      : 'bg-yellow-100 text-yellow-700'
                                  }`}>
                                    {pitch.status === 'published' ? 'Published' : 'Draft'}
                                  </span>
                                </div>
                              </div>
                            ))}
                            <Link 
                              href="/create-pitch"
                              className="inline-block text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              + Create Another Pitch
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Step 3: Publish Pitches */}
                    <div className="flex items-start space-x-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        pitches.some(p => p.status === 'published') ? 'bg-green-100 text-green-600' :
                        pitches.length > 0 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {pitches.some(p => p.status === 'published') ? '✓' : '3'}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Step 3: Publish Your Pitches
                        </h3>
                        <p className="text-gray-600 mb-3">
                          {pitches.some(p => p.status === 'published') 
                            ? `✓ Complete! You have ${pitches.filter(p => p.status === 'published').length} published pitch${pitches.filter(p => p.status === 'published').length > 1 ? 'es' : ''}.`
                            : pitches.length > 0 
                              ? 'Publish your pitches to make them visible to investors.'
                              : 'Complete Steps 1 & 2 first to publish pitches.'
                          }
                        </p>
                        {pitches.length === 0 ? (
                          <span className="text-gray-400 text-sm">Complete Steps 1 & 2 first</span>
                        ) : (
                          <Link 
                            href="/pitches"
                            className={`px-4 py-2 rounded-lg font-medium ${
                              pitches.some(p => p.status === 'draft') 
                                ? 'bg-orange-500 text-white hover:bg-orange-600 border-2 border-orange-600' 
                                : 'bg-green-100 text-green-700 border-2 border-green-300'
                            }`}
                          >
                            {pitches.some(p => p.status === 'draft') ? 'Publish Your Pitches' : 'Manage Pitches'}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h3 className="text-lg font-semibold mb-2">Profile Settings</h3>
                      <p className="text-gray-600 mb-4 text-sm">Manage your account settings.</p>
                      <Link 
                        href="/profile"
                        className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                      >
                        Edit Profile →
                      </Link>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h3 className="text-lg font-semibold mb-2">View Discovery</h3>
                      <p className="text-gray-600 mb-4 text-sm">See how investors discover startups.</p>
                      <Link 
                        href="/discovery"
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        Browse Pitches →
                      </Link>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h3 className="text-lg font-semibold mb-2">Analytics</h3>
                      <p className="text-gray-600 mb-4 text-sm">Track your pitch performance.</p>
                      <span className="text-gray-400 text-sm">Coming Soon</span>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h3 className="text-lg font-semibold mb-2">Messages</h3>
                      <p className="text-gray-600 mb-4 text-sm">Connect with interested investors.</p>
                      <span className="text-gray-400 text-sm">Coming Soon</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h3 className="text-lg font-semibold mb-2">Profile Settings</h3>
                      <p className="text-gray-600 mb-4">Manage your profile and account settings.</p>
                      <Link 
                        href="/profile"
                        className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Edit Profile
                      </Link>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h3 className="text-lg font-semibold mb-2">Browse Pitches</h3>
                      <p className="text-gray-600 mb-4">Discover innovative startups and their pitches.</p>
                      <Link 
                        href="/browse"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-indigo-500"
                      >
                        Start Browsing
                      </Link>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h3 className="text-lg font-semibold mb-2">My Watchlist</h3>
                      <p className="text-gray-600 mb-4">Keep track of startups you're interested in.</p>
                      <Link 
                        href="/watchlist"
                        className="bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600"
                      >
                        View Watchlist
                      </Link>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h3 className="text-lg font-semibold mb-2">Messages</h3>
                      <p className="text-gray-600 mb-4">Connect with founders and discuss opportunities.</p>
                      <Link 
                        href="/messages"
                        className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Open Messages
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-500 mt-8">
                <p>This is the MVP dashboard. More features coming soon!</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
