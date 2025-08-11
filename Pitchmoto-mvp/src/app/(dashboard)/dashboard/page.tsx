'use client'

import { useAuth } from '@/components/providers'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

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

  // At this point TypeScript knows user is not null
  const userType = user.profile?.user_type || 'user'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to Your Dashboard
              </h1>
              <p className="text-gray-600 mb-8">
                Your {userType === 'founder' ? 'startup' : 'investment'} journey starts here.
              </p>
              
              {userType === 'founder' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h3 className="text-lg font-semibold mb-2">Create Your Startup</h3>
                      <p className="text-gray-600 mb-4">Set up your startup profile and share your vision.</p>
                      <Link 
                        href="/startup/create"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Get Started
                      </Link>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h3 className="text-lg font-semibold mb-2">Post a Pitch</h3>
                      <p className="text-gray-600 mb-4">Share your startup story with potential investors.</p>
                      <Link 
                        href="/pitch/create"
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                      >
                        Create Pitch
                      </Link>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h3 className="text-lg font-semibold mb-2">Manage Pitches</h3>
                      <p className="text-gray-600 mb-4">View and edit your existing pitches.</p>
                      <Link 
                        href="/pitches"
                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                      >
                        View Pitches
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h3 className="text-lg font-semibold mb-2">Browse Pitches</h3>
                      <p className="text-gray-600 mb-4">Discover innovative startups and their pitches.</p>
                      <Link 
                        href="/browse"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Start Browsing
                      </Link>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h3 className="text-lg font-semibold mb-2">My Watchlist</h3>
                      <p className="text-gray-600 mb-4">Keep track of startups you're interested in.</p>
                      <Link 
                        href="/watchlist"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        View Watchlist
                      </Link>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h3 className="text-lg font-semibold mb-2">Messages</h3>
                      <p className="text-gray-600 mb-4">Connect with founders and discuss opportunities.</p>
                      <Link 
                        href="/messages"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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
