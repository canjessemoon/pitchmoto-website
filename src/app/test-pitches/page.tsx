// TEST PAGE - TEMPORARY FOR UPVOTE/WATCHLIST TESTING
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Pitch {
  id: string
  title: string
  content: string | {
    description?: string
    problem?: string
    solution?: string
    market_size?: string
    business_model?: string
  }
  pitch_type: string
  funding_ask: number | null
  startup_id: string
  status: string
  created_at: string
  updated_at: string
  upvote_count: number
  startup: {
    id: string
    name: string
    tagline: string
  }
}

interface UserInteractions {
  [pitchId: string]: {
    hasUpvoted: boolean
    isWatchlisted: boolean
  }
}

// Mock user for testing
const mockUser = {
  id: 'test-user-id',
  email: 'jdmoon+richard@gmail.com',
  profile: {
    user_type: 'investor',
    full_name: 'Test Investor'
  }
}

export default function TestPitchesPage() {
  const [pitches, setPitches] = useState<Pitch[]>([])
  const [loadingPitches, setLoadingPitches] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userInteractions, setUserInteractions] = useState<UserInteractions>({})
  const [loadingInteractions, setLoadingInteractions] = useState<{ [key: string]: boolean }>({})
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null)

  useEffect(() => {
    fetchTestPitches()
  }, [])

  const fetchTestPitches = async () => {
    try {
      setLoadingPitches(true)
      
      // Mock pitches for testing
      const mockPitches: Pitch[] = [
        {
          id: 'pitch-1',
          title: 'Revolutionary AI Platform',
          content: {
            description: 'An innovative AI platform that transforms how businesses operate with cutting-edge machine learning algorithms.'
          },
          pitch_type: 'text',
          funding_ask: 500000,
          startup_id: 'startup-1',
          status: 'published',
          created_at: '2025-09-01T00:00:00Z',
          updated_at: '2025-09-01T00:00:00Z',
          upvote_count: 5,
          startup: {
            id: 'startup-1',
            name: 'TechCorp AI',
            tagline: 'The future of business intelligence'
          }
        },
        {
          id: 'pitch-2',
          title: 'Sustainable Energy Solution',
          content: {
            description: 'Clean energy technology that reduces carbon footprint while increasing efficiency for commercial buildings.'
          },
          pitch_type: 'text',
          funding_ask: 1000000,
          startup_id: 'startup-2',
          status: 'published',
          created_at: '2025-09-02T00:00:00Z',
          updated_at: '2025-09-02T00:00:00Z',
          upvote_count: 12,
          startup: {
            id: 'startup-2',
            name: 'GreenTech Solutions',
            tagline: 'Powering a sustainable future'
          }
        }
      ]

      setPitches(mockPitches)
      
      // Initialize mock interactions
      const mockInteractions: UserInteractions = {}
      mockPitches.forEach(pitch => {
        mockInteractions[pitch.id] = {
          hasUpvoted: false,
          isWatchlisted: false
        }
      })
      setUserInteractions(mockInteractions)
      
    } catch (error) {
      console.error('Error fetching test pitches:', error)
      setError('Failed to load test pitches')
    } finally {
      setLoadingPitches(false)
    }
  }

  const handleUpvote = async (pitch: Pitch) => {
    const interactionKey = `upvote-${pitch.id}`
    setLoadingInteractions(prev => ({ ...prev, [interactionKey]: true }))

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const wasUpvoted = userInteractions[pitch.id]?.hasUpvoted
      const newUpvoteState = !wasUpvoted

      // Update local state
      setUserInteractions(prev => ({
        ...prev,
        [pitch.id]: {
          ...prev[pitch.id],
          hasUpvoted: newUpvoteState
        }
      }))

      // Update pitch upvote count locally
      setPitches(prev => prev.map(p => 
        p.id === pitch.id 
          ? { 
              ...p, 
              upvote_count: newUpvoteState 
                ? (p.upvote_count || 0) + 1 
                : Math.max((p.upvote_count || 0) - 1, 0)
            }
          : p
      ))

      // Show success message
      setNotification({ 
        message: newUpvoteState ? 'Upvote added successfully!' : 'Upvote removed successfully!', 
        type: 'success' 
      })
      setTimeout(() => setNotification(null), 3000)

    } catch (error) {
      console.error('Error toggling upvote:', error)
      setNotification({ 
        message: 'Failed to toggle upvote. Please try again.',
        type: 'error'
      })
      setTimeout(() => setNotification(null), 3000)
    } finally {
      setLoadingInteractions(prev => ({ ...prev, [interactionKey]: false }))
    }
  }

  const handleWatchlist = async (pitch: Pitch) => {
    const interactionKey = `watchlist-${pitch.id}`
    setLoadingInteractions(prev => ({ ...prev, [interactionKey]: true }))

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const wasWatchlisted = userInteractions[pitch.id]?.isWatchlisted
      const newWatchlistState = !wasWatchlisted

      // Update local state
      setUserInteractions(prev => ({
        ...prev,
        [pitch.id]: {
          ...prev[pitch.id],
          isWatchlisted: newWatchlistState
        }
      }))

      // Show success message
      setNotification({ 
        message: newWatchlistState ? 'Added to watchlist successfully!' : 'Removed from watchlist successfully!', 
        type: 'success' 
      })
      setTimeout(() => setNotification(null), 3000)

    } catch (error) {
      console.error('Error toggling watchlist:', error)
      setNotification({ 
        message: 'Failed to toggle watchlist. Please try again.',
        type: 'error'
      })
      setTimeout(() => setNotification(null), 3000)
    } finally {
      setLoadingInteractions(prev => ({ ...prev, [interactionKey]: false }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                PitchMoto
              </Link>
              <span className="ml-4 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                TEST MODE
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, {mockUser.profile?.full_name || mockUser.email}
              </span>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {mockUser.profile?.user_type || 'User'}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Browse Startup Pitches (Test Mode)</h1>
            <p className="mt-2 text-gray-600">
              Test the upvote and watchlist functionality
            </p>
          </div>

          {/* Pitches List */}
          {loadingPitches ? (
            <div className="text-center py-8">
              <div className="text-lg">Loading test pitches...</div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600">{error}</div>
            </div>
          ) : (
            <div className="space-y-6">
              {pitches.map((pitch) => (
                <div key={pitch.id} className="bg-white p-6 rounded-lg shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {pitch.title}
                      </h3>
                      <p className="text-gray-600 mb-2">
                        <strong>Startup:</strong> {pitch.startup.name}
                      </p>
                      <p className="text-gray-500 text-sm mb-2">
                        {pitch.startup.tagline}
                      </p>
                      {pitch.funding_ask && (
                        <p className="text-gray-600 mb-2">
                          <strong>Funding Ask:</strong> ${pitch.funding_ask.toLocaleString()}
                        </p>
                      )}
                      {pitch.upvote_count > 0 && (
                        <p className="text-green-600 text-sm font-medium mb-2">
                          {pitch.upvote_count} upvote{pitch.upvote_count !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Published
                      </span>
                      <div className="flex flex-col space-y-1">
                        {userInteractions[pitch.id]?.hasUpvoted && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ▲ Upvoted
                          </span>
                        )}
                        {userInteractions[pitch.id]?.isWatchlisted && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            ★ Watchlisted
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-gray-700 line-clamp-3">
                      {typeof pitch.content === 'string' 
                        ? pitch.content 
                        : pitch.content.description || 'No description available'}
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Created: {new Date(pitch.created_at).toLocaleDateString()}
                    </div>
                    
                    <div className="flex space-x-3">
                      <button className="text-blue-600 hover:text-blue-800 font-medium">
                        View Details
                      </button>
                      
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleUpvote(pitch)}
                          disabled={loadingInteractions[`upvote-${pitch.id}`]}
                          className={`px-3 py-1 rounded-full text-sm font-medium border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                            userInteractions[pitch.id]?.hasUpvoted
                              ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200'
                              : 'bg-white text-green-600 border-green-300 hover:bg-green-50'
                          }`}
                        >
                          {loadingInteractions[`upvote-${pitch.id}`] ? (
                            '⟳ Loading...'
                          ) : (
                            <>
                              ▲ {userInteractions[pitch.id]?.hasUpvoted ? 'Upvoted' : 'Upvote'}
                              {pitch.upvote_count > 0 && (
                                <span className="ml-1">({pitch.upvote_count})</span>
                              )}
                            </>
                          )}
                        </button>
                        <button 
                          onClick={() => handleWatchlist(pitch)}
                          disabled={loadingInteractions[`watchlist-${pitch.id}`]}
                          className={`px-3 py-1 rounded-full text-sm font-medium border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                            userInteractions[pitch.id]?.isWatchlisted
                              ? 'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200'
                              : 'bg-white text-purple-600 border-purple-300 hover:bg-purple-50'
                          }`}
                        >
                          {loadingInteractions[`watchlist-${pitch.id}`] ? (
                            '⟳ Loading...'
                          ) : userInteractions[pitch.id]?.isWatchlisted ? (
                            '★ Watchlisted'
                          ) : (
                            '+ Watchlist'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed bottom-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center">
            <span className="mr-2">
              {notification.type === 'success' ? '✓' : '✗'}
            </span>
            {notification.message}
          </div>
        </div>
      )}
    </div>
  )
}
