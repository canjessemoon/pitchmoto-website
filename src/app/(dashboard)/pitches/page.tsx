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
  status: string
  created_at: string
  updated_at: string
  startup: {
    id: string
    name: string
    tagline: string
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
                <p>Pitch Type: <span className="capitalize">{pitch.pitch_type}</span></p>
                <p>Created: {new Date(pitch.created_at).toLocaleDateString()}</p>
                {pitch.updated_at !== pitch.created_at && (
                  <p>Updated: {new Date(pitch.updated_at).toLocaleDateString()}</p>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Edit Pitch
                </button>
              </div>
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
  const [previewPitch, setPreviewPitch] = useState<Pitch | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [publishingId, setPublishingId] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      if (user.profile?.user_type === 'founder') {
        fetchPitches() // Fetch user's own pitches
      } else if (user.profile?.user_type === 'investor') {
        fetchAllPitches() // Fetch all published pitches for browsing
      }
    }
  }, [user])

  const fetchPitches = async () => {
    try {
      setLoadingPitches(true)
      const response = await fetch(`/api/pitches?user_id=${user?.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch pitches')
      }

      const data = await response.json()
      setPitches(data.pitches || [])
    } catch (error) {
      console.error('Error fetching pitches:', error)
      setError('Failed to load pitches')
    } finally {
      setLoadingPitches(false)
    }
  }

  const fetchAllPitches = async () => {
    try {
      setLoadingPitches(true)
      // Fetch all published pitches for investors to browse
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
      setPitches(data.pitches || [])
    } catch (error) {
      console.error('Error fetching pitches:', error)
      setError('Failed to load pitches')
    } finally {
      setLoadingPitches(false)
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

  const handlePublish = async (pitch: Pitch) => {
    try {
      setPublishingId(pitch.id)
      
      const response = await fetch(`/api/pitches/${pitch.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'published'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to publish pitch')
      }

      // Refresh the pitches list to show updated status
      await fetchPitches()
      
      alert('Pitch published successfully! It is now visible to investors.')
      
    } catch (error) {
      console.error('Error publishing pitch:', error)
      alert(error instanceof Error ? error.message : 'Failed to publish pitch. Please try again.')
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

  if (user.profile?.user_type !== 'founder' && user.profile?.user_type !== 'investor') {
    return (
      <div className="min-h-screen bg-gray-50">
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
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h1>
              <p className="text-gray-600">This page is only available to founders and investors.</p>
            </div>
          </div>
        </main>
      </div>
    )
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
              <Link 
                href="/dashboard"
                className="text-gray-500 hover:text-gray-700"
              >
                Dashboard
              </Link>
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
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            {user.profile?.user_type === 'founder' ? (
              <>
                <h1 className="text-3xl font-bold text-gray-900">Manage & Publish Pitches</h1>
                <p className="mt-2 text-gray-600">
                  View, edit, and publish your startup pitches
                </p>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-gray-900">Browse Startup Pitches</h1>
                <p className="mt-2 text-gray-600">
                  Discover innovative startups and their pitches
                </p>
              </>
            )}
          </div>

          {/* Action Buttons */}
          {user.profile?.user_type === 'founder' && (
            <div className="mb-6 flex space-x-4">
              <Link
                href="/create-pitch"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500 transition-colors"
              >
                Create New Pitch
              </Link>
            </div>
          )}

          {/* Pitches List */}
          {loadingPitches ? (
            <div className="text-center py-8">
              <div className="text-lg">Loading your pitches...</div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600">{error}</div>
              <button
                onClick={fetchPitches}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-indigo-500"
              >
                Try Again
              </button>
            </div>
          ) : pitches.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="text-gray-500 mb-4">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m6 0h6m-6 6v6m0 0v6m0-6h6m-6 0H9" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pitches yet</h3>
              <p className="text-gray-500 mb-6">
                Create your first pitch to start sharing your startup story with investors.
              </p>
              <Link
                href="/create-pitch"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-500 transition-colors"
              >
                Create Your First Pitch
              </Link>
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
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        pitch.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {pitch.status === 'published' ? 'Published' : 'Draft'}
                      </span>
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
                      {pitch.updated_at !== pitch.created_at && (
                        <span className="ml-2">
                          • Updated: {new Date(pitch.updated_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => handlePreview(pitch)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {user.profile?.user_type === 'investor' ? 'View Details' : 'Preview'}
                      </button>
                      
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
                        <>
                          <button 
                            className="text-green-600 hover:text-green-800 font-medium"
                          >
                            ▲ Upvote
                          </button>
                          <button 
                            className="text-purple-600 hover:text-purple-800 font-medium"
                          >
                            + Watchlist
                          </button>
                        </>
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
