'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  ExternalLink, 
  Download, 
  MapPin, 
  Calendar,
  Briefcase,
  Users,
  DollarSign,
  Star,
  MessageSquare,
  Bookmark,
  Send
} from 'lucide-react'
import { UpvoteButton } from '@/components/ui/upvote-button'
import { CommentSection } from '@/components/ui/comment-section'
import { auth } from '@/lib/auth'
import Link from 'next/link'
import Image from 'next/image'

interface Startup {
  id: string
  name: string
  logo_url?: string
  website_url?: string
  country?: string
  founded_year?: number
  team_size?: number
  description?: string
}

interface Pitch {
  id: string
  title: string
  tagline: string
  content: string
  sector: string
  location: string
  stage: string
  funding_ask?: number
  upvote_count: number
  created_at: string
  updated_at: string
  video_url?: string
  deck_url?: string
  one_pager_url?: string
  startups: Startup
}

export default function PitchDetailPage() {
  const params = useParams()
  const pitchId = params.id as string
  
  const [pitch, setPitch] = useState<Pitch | null>(null)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isWatchlisted, setIsWatchlisted] = useState(false)
  const [isAddingToWatchlist, setIsAddingToWatchlist] = useState(false)

  // Get current user
  useEffect(() => {
    async function getCurrentUser() {
      const currentUser = await auth.getCurrentUser()
      setUser(currentUser)
    }
    getCurrentUser()
  }, [])

  // Fetch pitch details
  useEffect(() => {
    async function fetchPitch() {
      try {
        const response = await fetch(`/api/pitches/${pitchId}`)
        const data = await response.json()
        
        if (response.ok) {
          setPitch(data.pitch)
        } else {
          console.error('Failed to fetch pitch:', data.error)
        }
      } catch (error) {
        console.error('Error fetching pitch:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (pitchId) {
      fetchPitch()
    }
  }, [pitchId])

  // Check watchlist status
  useEffect(() => {
    async function checkWatchlistStatus() {
      if (!user || !pitch || user.profile?.role !== 'investor') return

      try {
        const response = await fetch(`/api/watchlist?pitch_id=${pitch.id}`)
        const data = await response.json()
        
        if (response.ok) {
          setIsWatchlisted(data.isWatchlisted)
        }
      } catch (error) {
        console.error('Error checking watchlist status:', error)
      }
    }

    checkWatchlistStatus()
  }, [user, pitch])

  const handleWatchlistToggle = async () => {
    if (!user) {
      alert('Please log in to save pitches to your watchlist')
      return
    }

    if (user.profile?.role !== 'investor') {
      alert('Only investors can save pitches to watchlist')
      return
    }

    if (!pitch) return

    setIsAddingToWatchlist(true)

    try {
      const method = isWatchlisted ? 'DELETE' : 'POST'
      const url = isWatchlisted 
        ? `/api/watchlist?pitch_id=${pitch.id}`
        : '/api/watchlist'

      const response = await fetch(url, {
        method,
        headers: method === 'POST' ? { 'Content-Type': 'application/json' } : {},
        body: method === 'POST' ? JSON.stringify({ pitch_id: pitch.id }) : undefined,
      })

      if (response.ok) {
        setIsWatchlisted(!isWatchlisted)
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to update watchlist')
      }
    } catch (error) {
      console.error('Error updating watchlist:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setIsAddingToWatchlist(false)
    }
  }

  const formatFunding = (amount?: number) => {
    if (!amount) return 'Undisclosed'
    
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`
    }
    return `$${amount.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-8 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/5"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!pitch) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pitch not found</h1>
          <p className="text-gray-600 mb-4">The pitch you're looking for doesn't exist or has been removed.</p>
          <Link
            href="/discovery"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#405B53] text-white rounded-lg hover:bg-[#334A42] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Discovery
          </Link>
        </div>
      </div>
    )
  }

  const canMessage = user && user.profile?.role === 'investor' && user.profile?.subscription_tier === 'paid'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/discovery"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Discovery
            </Link>
          </div>

          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Logo & Basic Info */}
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-[#405B53] rounded-lg flex items-center justify-center overflow-hidden">
                {pitch.startups.logo_url ? (
                  <Image
                    src={pitch.startups.logo_url}
                    alt={`${pitch.startups.name} logo`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-2xl font-bold">
                    {pitch.startups.name.charAt(0)}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {pitch.startups.name}
                </h1>
                <p className="text-xl text-gray-600 mb-4">
                  {pitch.tagline}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    <Briefcase className="h-4 w-4 mr-1" />
                    {pitch.sector}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {pitch.stage}
                  </span>
                  {pitch.location && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                      <MapPin className="h-4 w-4 mr-1" />
                      {pitch.location}
                    </span>
                  )}
                  {pitch.upvote_count > 10 && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                      🔥 Trending
                    </span>
                  )}
                </div>

                {/* Key Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  {pitch.funding_ask && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span>Seeking {formatFunding(pitch.funding_ask)}</span>
                    </div>
                  )}
                  {pitch.startups.founded_year && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Founded {pitch.startups.founded_year}</span>
                    </div>
                  )}
                  {pitch.startups.team_size && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{pitch.startups.team_size} employees</span>
                    </div>
                  )}
                  {pitch.startups.country && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{pitch.startups.country}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 md:min-w-[200px]">
              <UpvoteButton
                pitchId={pitch.id}
                initialUpvoteCount={pitch.upvote_count}
                size="lg"
                className="w-full justify-center"
              />
              
              <button
                onClick={handleWatchlistToggle}
                disabled={isAddingToWatchlist}
                className={`
                  inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all duration-200 text-sm font-medium
                  ${isWatchlisted 
                    ? 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }
                  ${isAddingToWatchlist ? 'opacity-75 cursor-wait' : 'cursor-pointer'}
                `}
              >
                <Bookmark className={`h-4 w-4 ${isWatchlisted ? 'fill-yellow-600' : ''}`} />
                {isWatchlisted ? 'Saved' : 'Save to Watchlist'}
              </button>

              {canMessage ? (
                <button className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#E64E1B] text-white rounded-lg hover:bg-[#D44516] transition-colors text-sm font-medium">
                  <Send className="h-4 w-4" />
                  Message Founder
                </button>
              ) : user && user.profile?.role === 'investor' ? (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Upgrade to message founders</p>
                  <button className="text-sm text-[#405B53] hover:text-[#334A42] transition-colors">
                    Upgrade Plan
                  </button>
                </div>
              ) : (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Log in as an investor to message founders
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Video */}
        {pitch.video_url && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Pitch Video</h2>
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ExternalLink className="h-8 w-8 text-gray-500" />
                </div>
                <p className="text-gray-600 mb-4">Video content would be embedded here</p>
                <a
                  href={pitch.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#405B53] text-white rounded-lg hover:bg-[#334A42] transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Watch Video
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Funding Ask Highlight */}
        {pitch.funding_ask && (
          <div className="bg-gradient-to-r from-[#405B53] to-[#8C948B] rounded-lg p-6 text-white">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Funding Ask</h2>
              <div className="text-4xl font-bold mb-2">
                {formatFunding(pitch.funding_ask)}
              </div>
              <p className="text-lg opacity-90">
                {pitch.stage} Round
              </p>
            </div>
          </div>
        )}

        {/* Pitch Content */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">About {pitch.startups.name}</h2>
          <div className="prose prose-gray max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {pitch.content}
            </div>
          </div>
        </div>

        {/* Documents */}
        {(pitch.deck_url || pitch.one_pager_url) && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Documents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pitch.deck_url && (
                <a
                  href={pitch.deck_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download className="h-6 w-6 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">Pitch Deck</div>
                    <div className="text-sm text-gray-600">Download PDF</div>
                  </div>
                </a>
              )}
              {pitch.one_pager_url && (
                <a
                  href={pitch.one_pager_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download className="h-6 w-6 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">One Pager</div>
                    <div className="text-sm text-gray-600">Download PDF</div>
                  </div>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Additional Info */}
        {pitch.startups.description && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Details</h2>
            <p className="text-gray-700 leading-relaxed">
              {pitch.startups.description}
            </p>
            
            {pitch.startups.website_url && (
              <div className="mt-4">
                <a
                  href={pitch.startups.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#405B53] hover:text-[#334A42] transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Visit Website
                </a>
              </div>
            )}
          </div>
        )}

        {/* Comments Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <CommentSection pitchId={pitch.id} />
        </div>

        {/* Meta Info */}
        <div className="text-center text-sm text-gray-500">
          <p>
            Published on {formatDate(pitch.created_at)}
            {pitch.created_at !== pitch.updated_at && ` • Updated ${formatDate(pitch.updated_at)}`}
          </p>
        </div>
      </div>
    </div>
  )
}
