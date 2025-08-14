'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Briefcase, MapPin, Building, TrendingUp, Calendar, Heart } from 'lucide-react'
import { UpvoteButton } from '@/components/ui/upvote-button'
import Link from 'next/link'
import Image from 'next/image'

interface Startup {
  id: string
  name: string
  logo_url?: string
  country?: string
}

interface Pitch {
  id: string
  title: string
  tagline: string
  sector: string
  location: string
  stage: string
  funding_ask?: number
  upvote_count: number
  created_at: string
  updated_at: string
  startups: Startup
}

interface FilterState {
  search: string
  sector: string
  location: string
  stage: string
  country: string
  sort: 'trending' | 'newest'
}

const SECTORS = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce', 
  'Food & Beverage', 'Transportation', 'Real Estate', 'Energy', 'Entertainment'
]

const STAGES = [
  'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C+', 'Growth', 'IPO Ready'
]

export default function DiscoveryPage() {
  const [pitches, setPitches] = useState<Pitch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    sector: '',
    location: '',
    stage: '',
    country: '',
    sort: 'trending'
  })
  const [showFilters, setShowFilters] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  // Fetch pitches based on filters
  useEffect(() => {
    async function fetchPitches() {
      setIsLoading(true)
      
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
      params.append('page', pagination.page.toString())
      params.append('limit', pagination.limit.toString())

      try {
        const response = await fetch(`/api/discovery?${params}`)
        const data = await response.json()
        
        if (response.ok) {
          setPitches(data.pitches || [])
          setPagination(prev => ({ ...prev, ...data.pagination }))
        } else {
          console.error('Failed to fetch pitches:', data.error)
        }
      } catch (error) {
        console.error('Error fetching pitches:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPitches()
  }, [filters, pagination.page])

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      sector: '',
      location: '',
      stage: '',
      country: '',
      sort: 'trending'
    })
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
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`
    return `${Math.ceil(diffDays / 365)} years ago`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Discover Startups</h1>
              <p className="mt-2 text-gray-600">
                Explore innovative startups seeking investment opportunities
              </p>
            </div>
            
            {/* Sort Options */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#405B53] focus:border-transparent"
              >
                <option value="trending">🔥 Trending</option>
                <option value="newest">📅 Newest</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </h3>
                {Object.values(filters).some(v => v && v !== 'trending') && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-[#405B53] hover:text-[#334A42] transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      placeholder="Search startups..."
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#405B53] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Sector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sector
                  </label>
                  <select
                    value={filters.sector}
                    onChange={(e) => handleFilterChange('sector', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#405B53] focus:border-transparent"
                  >
                    <option value="">All Sectors</option>
                    {SECTORS.map(sector => (
                      <option key={sector} value={sector}>{sector}</option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    placeholder="e.g. San Francisco, London"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#405B53] focus:border-transparent"
                  />
                </div>

                {/* Stage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Funding Stage
                  </label>
                  <select
                    value={filters.stage}
                    onChange={(e) => handleFilterChange('stage', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#405B53] focus:border-transparent"
                  >
                    <option value="">All Stages</option>
                    {STAGES.map(stage => (
                      <option key={stage} value={stage}>{stage}</option>
                    ))}
                  </select>
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={filters.country}
                    onChange={(e) => handleFilterChange('country', e.target.value)}
                    placeholder="e.g. United States, UK"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#405B53] focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-gray-600">
                {pagination.total > 0 && (
                  <>Showing {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} startups</>
                )}
              </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-white rounded-lg p-6 shadow-sm animate-pulse">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : pitches.length === 0 ? (
              /* No Results */
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No startups found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or search terms to find more startups.
                </p>
                <button
                  onClick={clearFilters}
                  className="text-[#405B53] hover:text-[#334A42] transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              /* Pitch Cards */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pitches.map((pitch) => (
                  <div key={pitch.id} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4 mb-4">
                      {/* Logo */}
                      <div className="w-16 h-16 bg-[#405B53] rounded-lg flex items-center justify-center overflow-hidden">
                        {pitch.startups.logo_url ? (
                          <Image
                            src={pitch.startups.logo_url}
                            alt={`${pitch.startups.name} logo`}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-xl font-bold">
                            {pitch.startups.name.charAt(0)}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/pitch/${pitch.id}`}
                          className="block group"
                        >
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#405B53] transition-colors mb-1">
                            {pitch.startups.name}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                            {pitch.tagline}
                          </p>
                        </Link>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Briefcase className="h-3 w-3 mr-1" />
                            {pitch.sector}
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {pitch.stage}
                          </span>
                          {pitch.location && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              <MapPin className="h-3 w-3 mr-1" />
                              {pitch.location}
                            </span>
                          )}
                        </div>

                        {/* Funding Ask */}
                        {pitch.funding_ask && (
                          <div className="text-sm text-gray-600 mb-3">
                            <span className="font-medium">Seeking:</span> {formatFunding(pitch.funding_ask)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(pitch.created_at)}
                        </span>
                        {pitch.upvote_count > 10 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            🔥 Trending
                          </span>
                        )}
                      </div>

                      <UpvoteButton
                        pitchId={pitch.id}
                        initialUpvoteCount={pitch.upvote_count}
                        size="sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!isLoading && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <span className="px-3 py-2 text-sm text-gray-700">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
