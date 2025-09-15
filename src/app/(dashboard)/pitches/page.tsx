'use client'

import { useAuth } from '@/components/providers'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
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
  status: 'draft' | 'published' | 'archived'
  created_at: string
  updated_at: string
  startup: {
    id: string
    name: string
    tagline: string
  }
}

interface UserInteractions {
  [pitchId: string]: {
    isWatchlisted: boolean
  }
}

interface PreviewModalProps {
  pitch: Pitch | null
  isOpen: boolean
  onClose: () => void
}

function PreviewModal({ pitch, isOpen, onClose }: PreviewModalProps) {
  if (!isOpen || !pitch) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{pitch.title}</h1>
              <div className="text-gray-600">
                <p className="text-lg font-medium">{pitch.startup.name}</p>
                <p className="text-sm">{pitch.startup.tagline}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Funding Ask */}
          {pitch.funding_ask && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Funding Ask</h3>
              <p className="text-2xl font-bold text-blue-700">${pitch.funding_ask.toLocaleString()}</p>
            </div>
          )}

          {/* Content Sections */}
          <div className="space-y-6">
            {typeof pitch.content === 'string' ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Pitch Description</h3>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{pitch.content}</p>
                </div>
              </div>
            ) : (
              <>
                {pitch.content.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap">{pitch.content.description}</p>
                    </div>
                  </div>
                )}

                {pitch.content.problem && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Problem</h3>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap">{pitch.content.problem}</p>
                    </div>
                  </div>
                )}

                {pitch.content.solution && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Solution</h3>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap">{pitch.content.solution}</p>
                    </div>
                  </div>
                )}

                {pitch.content.market_size && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Market Size</h3>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap">{pitch.content.market_size}</p>
                    </div>
                  </div>
                )}

                {pitch.content.business_model && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Business Model</h3>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap">{pitch.content.business_model}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                <p>Created: {new Date(pitch.created_at).toLocaleDateString()}</p>
                <p>Updated: {new Date(pitch.updated_at).toLocaleDateString()}</p>
              </div>
              <button
                onClick={onClose}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PitchesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [pitches, setPitches] = useState<Pitch[]>([])
  const [loadingPitches, setLoadingPitches] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewPitch, setPreviewPitch] = useState<Pitch | null>(null)
  const [publishingId, setPublishingId] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [userInteractions, setUserInteractions] = useState<UserInteractions>({})
  const [loadingInteractions, setLoadingInteractions] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    if (loading) return
    
    if (!user) {
      router.push('/signin')
      return
    }

    fetchPitches()
  }, [user, loading, router])

  const fetchPitches = async () => {
    try {
      setLoadingPitches(true)
      setError(null)
      
      const response = await fetch('/api/pitches', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch pitches')
      }

      const data = await response.json()
      const pitchesList = data.pitches || []
      setPitches(pitchesList)

      // Load user interactions for investors
      await loadUserInteractions(pitchesList)
    } catch (error) {
      console.error('Error fetching pitches:', error)
      setError('Failed to load pitches. Please try again.')
    } finally {
      setLoadingPitches(false)
    }
  }

  const loadUserInteractions = async (pitchesList: Pitch[]) => {
    if (!user || user.profile?.user_type !== 'investor') return

    try {
      const interactions: UserInteractions = {}

      // Load watchlist status for each startup
      const watchlistPromises = pitchesList.map(async (pitch) => {
        try {
          const response = await fetch(`/api/watchlist?startup_id=${pitch.startup_id}`)
          if (response.ok) {
            const data = await response.json()
            return { pitchId: pitch.id, isWatchlisted: data.isWatchlisted }
          }
        } catch (error) {
          console.error(`Error checking watchlist for startup ${pitch.startup_id}:`, error)
        }
        return { pitchId: pitch.id, isWatchlisted: false }
      })

      const watchlistResults = await Promise.all(watchlistPromises)

      // Combine results
      pitchesList.forEach((pitch) => {
        const watchlistResult = watchlistResults.find(r => r.pitchId === pitch.id)
        
        interactions[pitch.id] = {
          isWatchlisted: watchlistResult?.isWatchlisted || false
        }
      })

      setUserInteractions(interactions)
    } catch (error) {
      console.error('Error loading user interactions:', error)
    }
  }

  const handleSignOut = async () => {
    // Import the useAuth hook's signOut function through the context
    // For now, redirect to main page - proper signOut will be handled by auth provider
    router.push('/')
  }

  const handlePreview = (pitch: Pitch) => {
    setPreviewPitch(pitch)
    setIsPreviewOpen(true)
  }

  const handleEdit = (pitch: Pitch) => {
    // Navigate to edit page with pitch ID
    router.push(`/edit-pitch/${pitch.id}`)
  }

  const handleWatchlist = async (pitch: Pitch) => {
    if (!user || user.profile?.user_type !== 'investor') return

    const interactionKey = `watchlist-${pitch.id}`
    setLoadingInteractions(prev => ({ ...prev, [interactionKey]: true }))

    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ startup_id: pitch.startup_id })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to toggle watchlist')
      }

      // Update local state
      setUserInteractions(prev => ({
        ...prev,
        [pitch.id]: {
          ...prev[pitch.id],
          isWatchlisted: data.isWatchlisted
        }
      }))

      // Show success message
      setNotification({ message: data.message, type: 'success' })
      setTimeout(() => setNotification(null), 3000)

    } catch (error) {
      console.error('Error toggling watchlist:', error)
      setNotification({ 
        message: error instanceof Error ? error.message : 'Failed to toggle watchlist. Please try again.',
        type: 'error'
      })
      setTimeout(() => setNotification(null), 3000)
    } finally {
      setLoadingInteractions(prev => ({ ...prev, [interactionKey]: false }))
    }
  }

  const handlePublish = async (pitch: Pitch) => {
    setPublishingId(pitch.id)

    try {
      const response = await fetch(`/api/pitches/${pitch.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: 'published',
          updated_at: new Date().toISOString() 
        })
      })

      if (!response.ok) {
        throw new Error('Failed to publish pitch')
      }

      // Update local state
      setPitches(prev => prev.map(p => 
        p.id === pitch.id 
          ? { ...p, status: 'published' }
          : p
      ))

      setNotification({ message: 'Pitch published successfully!', type: 'success' })
      setTimeout(() => setNotification(null), 3000)

    } catch (error) {
      console.error('Error publishing pitch:', error)
      setNotification({ 
        message: 'Failed to publish pitch. Please try again.',
        type: 'error'
      })
      setTimeout(() => setNotification(null), 3000)
    } finally {
      setPublishingId(null)
    }
  }

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
              <Link 
                href="/dashboard"
                className="text-gray-500 hover:text-gray-700"
              >
                Dashboard
              </Link>
              <span className="text-gray-700">
                {user.email}
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
        {/* Notification */}
        {notification && (
          <div className={`mb-6 px-4 py-3 rounded-lg ${
            notification.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {notification.message}
          </div>
        )}
        
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {user.profile?.user_type === 'founder' ? 'My Pitches' : 'Browse Pitches'}
            </h1>
            <p className="text-gray-600">
              {user.profile?.user_type === 'founder' 
                ? 'Manage your startup pitches and track their performance'
                : 'Discover innovative startups and explore investment opportunities'
              }
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mb-6">
            {user.profile?.user_type === 'founder' && (
              <Link
                href="/create-pitch"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center"
              >
                Create New Pitch
              </Link>
            )}
            {user.profile?.user_type === 'investor' && (
              <div className="flex space-x-4">
                <Link
                  href="/app/startups"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center"
                >
                  Startup Discovery
                </Link>
                <Link
                  href="/watchlist"
                  className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 inline-flex items-center"
                >
                  My Watchlist
                </Link>
              </div>
            )}
          </div>

          {/* Content */}
          {loadingPitches ? (
            <div className="text-center py-12">
              <div className="text-lg text-gray-600">Loading pitches...</div>
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="text-red-600 mb-4">{error}</div>
              <button
                onClick={fetchPitches}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : pitches.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="text-gray-500 mb-4">
                {user.profile?.user_type === 'founder' 
                  ? "You haven't created any pitches yet."
                  : "No pitches available to browse."
                }
              </div>
              {user.profile?.user_type === 'founder' && (
                <Link
                  href="/create-pitch"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Create Your First Pitch
                </Link>
              )}
            </div>
          ) : (
            <div className="grid gap-6">
              {pitches.map((pitch) => (
                <div key={pitch.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{pitch.title}</h3>
                        <span className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${
                          pitch.status === 'published' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {pitch.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-lg font-medium text-gray-800">{pitch.startup.name}</p>
                        <p className="text-gray-600">{pitch.startup.tagline}</p>
                      </div>

                      {pitch.funding_ask && (
                        <div className="mb-3">
                          <span className="text-gray-600 text-sm">Funding Ask: </span>
                          <span className="text-lg font-bold text-green-600">${pitch.funding_ask.toLocaleString()}</span>
                        </div>
                      )}

                      <div className="text-sm text-gray-500 mb-4">
                        <p>Created: {new Date(pitch.created_at).toLocaleDateString()}</p>
                        <p>Updated: {new Date(pitch.updated_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handlePreview(pitch)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Preview
                    </button>
                    
                    <div className="flex items-center space-x-3">
                      {user.profile?.user_type === 'founder' && (
                        <>
                          <button
                            onClick={() => handleEdit(pitch)}
                            className="text-indigo-600 hover:text-indigo-800 font-medium"
                          >
                            Edit
                          </button>
                          {pitch.status !== 'published' ? (
                            <button 
                              onClick={() => handlePublish(pitch)}
                              disabled={publishingId === pitch.id}
                              className="bg-orange-500 text-white px-3 py-1 rounded border-2 border-orange-600 font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {publishingId === pitch.id ? 'Publishing...' : 'Publish'}
                            </button>
                          ) : (
                            <span className="text-green-600 font-medium">✓ Published</span>
                          )}
                        </>
                      )}
                      
                      {user.profile?.user_type === 'investor' && (
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleWatchlist(pitch)}
                            disabled={loadingInteractions[`watchlist-${pitch.id}`]}
                            className={`px-3 py-1 rounded-full text-sm font-medium border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                              userInteractions[pitch.id]?.isWatchlisted
                                ? 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200'
                                : 'bg-white text-yellow-600 border-yellow-300 hover:bg-yellow-50'
                            }`}
                          >
                            {loadingInteractions[`watchlist-${pitch.id}`] ? (
                              '⟳ Loading...'
                            ) : (
                              <>
                                ★ {userInteractions[pitch.id]?.isWatchlisted ? 'Saved' : 'Save to Watchlist'}
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Preview Modal */}
      <PreviewModal 
        pitch={previewPitch} 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
      />
    </div>
  )
}
