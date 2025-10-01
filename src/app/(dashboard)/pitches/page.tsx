'use client'

import { useAuth } from '@/components/providers'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatFundingAmount, getFundingDisplayClass } from '@/lib/funding-display'

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
  video_url?: string | null
  slide_url?: string | null
  is_not_raising_funding?: boolean
  startup: {
    id: string
    name: string
    tagline: string
  }
}

// Helper function to generate fresh signed URL for pitch deck
const getSignedPitchDeckUrl = async (filePath: string): Promise<string | null> => {
  try {
    const response = await fetch(`/api/storage/signed-url?bucket=pitch-decks&path=${encodeURIComponent(filePath)}&expires=3600`)
    if (!response.ok) {
      console.error('Failed to get signed URL:', response.statusText)
      return null
    }
    const data = await response.json()
    return data.signedUrl
  } catch (error) {
    console.error('Error getting signed URL:', error)
    return null
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

          {/* Status Badge */}
          <div className="mb-6">
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
              pitch.status === 'published' 
                ? 'bg-green-100 text-green-700' 
                : pitch.status === 'draft'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {pitch.status}
            </span>
          </div>

          {/* Form Layout - matching edit screen structure */}
          <div className="space-y-6">
            
            {/* Startup Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Startup</h3>
              <p className="text-lg font-semibold text-gray-900">{pitch.startup.name}</p>
              <p className="text-gray-600">{pitch.startup.tagline}</p>
            </div>

            {/* Pitch Title */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Pitch Title</h3>
              <p className="text-lg font-semibold text-gray-900">{pitch.title}</p>
            </div>

            {/* Pitch Content */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Pitch Content <span className="text-gray-500">(Your full pitch story)</span>
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                {typeof pitch.content === 'string' ? (
                  <p className="text-gray-900 whitespace-pre-wrap">{pitch.content}</p>
                ) : (
                  <div className="space-y-4">
                    {pitch.content.description && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                        <p className="text-gray-700 whitespace-pre-wrap">{pitch.content.description}</p>
                      </div>
                    )}
                    {pitch.content.problem && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Problem</h4>
                        <p className="text-gray-700 whitespace-pre-wrap">{pitch.content.problem}</p>
                      </div>
                    )}
                    {pitch.content.solution && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Solution</h4>
                        <p className="text-gray-700 whitespace-pre-wrap">{pitch.content.solution}</p>
                      </div>
                    )}
                    {pitch.content.market_size && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Market Size</h4>
                        <p className="text-gray-700 whitespace-pre-wrap">{pitch.content.market_size}</p>
                      </div>
                    )}
                    {pitch.content.business_model && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Business Model</h4>
                        <p className="text-gray-700 whitespace-pre-wrap">{pitch.content.business_model}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Funding Ask */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Funding Ask <span className="text-gray-500">(USD)</span>
              </h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-blue-700">
                  {formatFundingAmount(pitch.funding_ask || 0, pitch.is_not_raising_funding || false)}
                </p>
              </div>
            </div>

            {/* Video URL */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Video Pitch URL <span className="text-gray-500">(Optional)</span>
              </h3>
              {pitch.video_url ? (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Video URL</p>
                      <a href={pitch.video_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm break-all">
                        {pitch.video_url}
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-500">No video URL provided</p>
                  <p className="text-gray-400 text-sm mt-1">Share a YouTube, Vimeo, or Loom link to your pitch video</p>
                </div>
              )}
            </div>

            {/* Pitch Deck */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Pitch Deck <span className="text-gray-500">(PDF - Optional)</span>
              </h3>
              {pitch.slide_url ? (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Pitch Deck</p>
                      {pitch.slide_url && (
                        <button
                          onClick={async () => {
                            const signedUrl = await getSignedPitchDeckUrl(pitch.slide_url!)
                            if (signedUrl) {
                              window.open(signedUrl, '_blank', 'noopener,noreferrer')
                            } else {
                              alert('Unable to access pitch deck. Please try again.')
                            }
                          }}
                          className="text-orange-600 hover:text-orange-700 underline font-medium cursor-pointer bg-transparent border-none p-0"
                        >
                          📄 View Pitch Deck
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-500">No pitch deck uploaded</p>
                  <p className="text-gray-400 text-sm mt-1">📋 Upload a pitch deck (PDF format, max 50MB)</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-sm text-gray-500">
                <p className="font-medium text-gray-700">Created</p>
                <p>{new Date(pitch.created_at).toLocaleDateString()} at {new Date(pitch.created_at).toLocaleTimeString()}</p>
              </div>
              <div className="text-sm text-gray-500">
                <p className="font-medium text-gray-700">Last Updated</p>
                <p>{new Date(pitch.updated_at).toLocaleDateString()} at {new Date(pitch.updated_at).toLocaleTimeString()}</p>
              </div>
              <div className="text-sm text-gray-500">
                <p className="font-medium text-gray-700">Pitch ID</p>
                <p className="font-mono text-xs">{pitch.id}</p>
              </div>
            </div>
            <div className="flex justify-end">
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
      
      // Build the correct API endpoint based on user type
      let apiUrl = '/api/pitches'
      if (user?.profile?.user_type === 'founder') {
        // Founders should only see their own pitches
        apiUrl = `/api/pitches?user_id=${user.id}`
      }
      // Investors see all published pitches (default behavior)
      
      const response = await fetch(apiUrl, {
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

  // Helper function to check if user can edit a pitch
  const canEditPitch = (pitch: Pitch): boolean => {
    if (!user || user.profile?.user_type !== 'founder') return false
    // For now, we'll use a simple check. In a real app, you'd verify startup ownership via API
    // Since we're now filtering pitches by user_id in fetchPitches, founders only see their own pitches
    return true
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
      // Check if user is available
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      const response = await fetch(`/api/pitches/${pitch.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          user_id: user.id, // Add required user_id for authentication
          status: 'published',
          updated_at: new Date().toISOString() 
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to publish pitch')
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
                          <span className="text-lg font-bold text-green-600">
                            {formatFundingAmount(pitch.funding_ask || 0, pitch.is_not_raising_funding || false)}
                          </span>
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
                      {user.profile?.user_type === 'founder' && canEditPitch(pitch) && (
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
