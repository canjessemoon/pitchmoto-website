'use client'

import { useAuth } from '@/components/providers'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showSavedSuccess, setShowSavedSuccess] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin')
    }
  }, [user, loading, router])

  useEffect(() => {
    const saved = searchParams.get('saved')
    
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
  }, [searchParams, router])

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
                      <h3 className="text-lg font-semibold mb-2">Create Your Startup</h3>
                      <p className="text-gray-600 mb-4">Set up your startup profile and share your vision.</p>
                      <Link 
                        href="/create-startup"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-indigo-500"
                      >
                        Get Started
                      </Link>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h3 className="text-lg font-semibold mb-2">Create a Pitch</h3>
                      <p className="text-gray-600 mb-4">Create and save your startup pitch draft.</p>
                      <Link 
                        href="/create-pitch"
                        className="bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600"
                      >
                        Create Pitch
                      </Link>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h3 className="text-lg font-semibold mb-2">Manage & Publish Pitches</h3>
                      <p className="text-gray-600 mb-4">View, edit, and publish your existing pitches.</p>
                      <Link 
                        href="/pitches"
                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                      >
                        Manage Pitches
                      </Link>
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
