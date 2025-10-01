'use client'

import { useAuth } from '@/components/providers'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { Search, Filter, Heart, ExternalLink, MapPin, Users, Calendar, Trash2, AlertCircle } from 'lucide-react'
import { INDUSTRIES, STARTUP_STAGES } from '@/lib/utils'
import { formatFundingAmount } from '@/lib/funding-display'

interface Startup {
  id: string
  name: string
  tagline: string
  description: string
  industry: string
  stage: string
  funding_goal: number
  current_funding?: number
  country: string | null
  logo_url: string | null
  website_url: string | null
  tags?: string[]
  created_at: string
  is_not_raising_funding?: boolean
}

interface WatchlistItem {
  id: string
  created_at: string
  startup: Startup
}

export default function WatchlistPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [filteredWatchlist, setFilteredWatchlist] = useState<WatchlistItem[]>([])
  const [loadingWatchlist, setLoadingWatchlist] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState('')
  const [selectedStage, setSelectedStage] = useState('')
  const [sortBy, setSortBy] = useState('newest') // newest, oldest, name
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set())

  // Stage options
  const STAGES = [
    'Idea/Concept',
    'MVP/Prototype', 
    'Early Revenue',
    'Growth Stage',
    'Scaling',
    'Pre-IPO'
  ]

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin')
    } else if (user && user.profile?.user_type !== 'investor') {
      router.push('/dashboard')
    } else if (user && user.profile?.user_type === 'investor') {
      fetchWatchlist()
    }
  }, [user, loading, router])

  const fetchWatchlist = async () => {
    try {
      setLoadingWatchlist(true)
      setError(null)
      
      const response = await fetch('/api/watchlist', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch watchlist')
      }

      const data = await response.json()
      setWatchlist(data.watchlist || [])
      setFilteredWatchlist(data.watchlist || [])
    } catch (error) {
      console.error('Error fetching watchlist:', error)
      setError('Failed to load your watchlist. Please try again.')
    } finally {
      setLoadingWatchlist(false)
    }
  }

  // Filter and sort watchlist
  useEffect(() => {
    let filtered = watchlist.filter(item => {
      const startup = item.startup
      const matchesSearch = !searchTerm || 
        startup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        startup.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
        startup.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesIndustry = !selectedIndustry || startup.industry === selectedIndustry
      const matchesStage = !selectedStage || startup.stage === selectedStage
      
      return matchesSearch && matchesIndustry && matchesStage
    })

    // Sort filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'name':
          return a.startup.name.localeCompare(b.startup.name)
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

    setFilteredWatchlist(filtered)
  }, [watchlist, searchTerm, selectedIndustry, selectedStage, sortBy])

  const removeFromWatchlist = async (startupId: string) => {
    if (removingItems.has(startupId)) return

    setRemovingItems(prev => new Set(prev).add(startupId))

    try {
      const response = await fetch(`/api/watchlist?startup_id=${startupId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setWatchlist(prev => prev.filter(item => item.startup.id !== startupId))
        setFilteredWatchlist(prev => prev.filter(item => item.startup.id !== startupId))
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to remove from watchlist')
      }
    } catch (error) {
      console.error('Error removing from watchlist:', error)
      alert('Failed to remove from watchlist. Please try again.')
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(startupId)
        return newSet
      })
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedIndustry('')
    setSelectedStage('')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user || user.profile?.user_type !== 'investor') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-bold">
                <span className="text-[#405B53]">Pitch</span>
                <span className="text-[#E64E1B]">Moto</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/app/startups"
                className="text-gray-500 hover:text-gray-700"
              >
                Browse Startups
              </Link>
              <Link 
                href="/dashboard"
                className="text-gray-500 hover:text-gray-700"
              >
                Dashboard
              </Link>
              <span className="text-gray-700">
                {user.profile?.full_name || user.email}
              </span>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                Investor
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <Heart className="h-8 w-8 mr-3 text-[#E64E1B]" />
              My Watchlist
            </h1>
            <p className="text-gray-600">
              Keep track of startups you're interested in investing in
            </p>
          </div>

          {/* Search and Filters */}
          {watchlist.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search your watchlist..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#405B53] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Industry Filter */}
                <div>
                  <select
                    value={selectedIndustry}
                    onChange={(e) => setSelectedIndustry(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#405B53] focus:border-transparent"
                  >
                    <option value="">All Industries</option>
                    {INDUSTRIES.map((industry) => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>

                {/* Stage Filter */}
                <div>
                  <select
                    value={selectedStage}
                    onChange={(e) => setSelectedStage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#405B53] focus:border-transparent"
                  >
                    <option value="">All Stages</option>
                    {STAGES.map((stage) => (
                      <option key={stage} value={stage}>{stage}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sort Options and Actions */}
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#405B53]"
                  >
                    <option value="newest">Recently Added</option>
                    <option value="oldest">First Added</option>
                    <option value="name">Company Name</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  {(searchTerm || selectedIndustry || selectedStage) && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
                    >
                      <Filter className="h-4 w-4 mr-1" />
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {loadingWatchlist ? (
            <div className="text-center py-12">
              <div className="text-lg text-gray-600">Loading your watchlist...</div>
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Watchlist</h3>
              <p className="text-gray-500 mb-6">{error}</p>
              <button
                onClick={fetchWatchlist}
                className="bg-[#405B53] text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Try Again
              </button>
            </div>
          ) : watchlist.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your watchlist is empty</h3>
              <p className="text-gray-500 mb-6">
                Start building your watchlist by browsing startups and clicking "Save to Watchlist"
              </p>
              <Link
                href="/app/startups"
                className="bg-[#405B53] text-white px-6 py-3 rounded-lg hover:bg-green-700 inline-flex items-center"
              >
                <Search className="h-5 w-5 mr-2" />
                Browse Startups
              </Link>
            </div>
          ) : filteredWatchlist.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No startups match your filters</h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={clearFilters}
                className="bg-[#405B53] text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              {/* Results Count */}
              <div className="mb-4">
                <p className="text-gray-600">
                  {filteredWatchlist.length} of {watchlist.length} startup{watchlist.length !== 1 ? 's' : ''} in your watchlist
                </p>
              </div>

              {/* Watchlist Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredWatchlist.map((item) => (
                  <WatchlistCard 
                    key={item.id} 
                    item={item}
                    onRemove={() => removeFromWatchlist(item.startup.id)}
                    isRemoving={removingItems.has(item.startup.id)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

// Watchlist Card Component
interface WatchlistCardProps {
  item: WatchlistItem
  onRemove: () => void
  isRemoving: boolean
}

function WatchlistCard({ item, onRemove, isRemoving }: WatchlistCardProps) {
  const { startup } = item

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold text-gray-900 pr-2">{startup.name}</h3>
          <button
            onClick={onRemove}
            disabled={isRemoving}
            className={`flex-shrink-0 p-1 rounded hover:bg-red-50 ${
              isRemoving ? 'opacity-50 cursor-not-allowed' : 'text-red-500 hover:text-red-700'
            }`}
            title="Remove from watchlist"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2">{startup.tagline}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center flex-wrap gap-2 text-sm">
            <div className="flex items-center text-gray-500">
              <Users className="h-4 w-4 mr-1" />
              <span className="font-medium text-gray-700">{startup.industry}</span>
            </div>
            
            {/* Cross-Industry Tags */}
            {startup.tags && startup.tags.length > 0 && startup.tags.slice(0, 2).map(tag => (
              <span 
                key={tag}
                className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium"
              >
                {tag}
              </span>
            ))}
            
            {startup.tags && startup.tags.length > 2 && (
              <span className="text-gray-400 text-xs">
                +{startup.tags.length - 2} more
              </span>
            )}
            
            <span className="text-gray-300">•</span>
            <span className="text-gray-500">{startup.stage}</span>
          </div>
          
          {startup.country && (
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{startup.country}</span>
            </div>
          )}
          
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Added {formatDate(item.created_at)}</span>
          </div>
          
          {startup.funding_goal && (
            <div className="flex items-center text-sm text-gray-600">
              <span className="font-medium">
                Goal: {formatFundingAmount(startup.funding_goal || 0, startup.is_not_raising_funding || false)}
              </span>
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          <Link
            href={`/app/startup/${startup.id}`}
            className="flex-1 text-center bg-[#405B53] text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            View Details
          </Link>
          {startup.website_url && (
            <a
              href={startup.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Visit website"
            >
              <ExternalLink className="h-4 w-4 text-gray-600" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
