'use client'

import { useState, useEffect, useMemo } from 'react'
import { ChevronDown, Filter, Star, Eye, MessageCircle, Heart } from 'lucide-react'

interface Startup {
  id: string
  name: string
  tagline: string
  description: string
  industry: string
  stage: string
  funding_ask: number
  equity_offered: number
  location: string
  founded_year: number
  team_size: number
  website?: string
  logo_url?: string
  traction_metrics?: {
    revenue?: number
    users?: number
    growth_rate?: number
  }
}

interface Match {
  id: string
  startup_id: string
  startup: Startup
  score: number
  rank: number
  created_at: string
  viewed_at?: string
  bookmarked_at?: string
  contacted_at?: string
  score_breakdown: {
    industry_score: number
    stage_score: number
    funding_score: number
    location_score: number
    traction_score: number
    team_score: number
    keyword_bonus: number
  }
  match_reasons: string[]
}

interface MatchDashboardProps {
  matches: Match[]
  onViewMatch: (matchId: string) => void
  onBookmarkMatch: (matchId: string) => void
  onContactStartup: (startupId: string) => void
  onRefreshMatches: () => void
  isLoading?: boolean
}

type SortOption = 'score' | 'created_at' | 'funding_ask' | 'name'
type FilterOption = 'all' | 'unviewed' | 'bookmarked' | 'contacted'

export default function MatchDashboard({
  matches,
  onViewMatch,
  onBookmarkMatch,
  onContactStartup,
  onRefreshMatches,
  isLoading = false
}: MatchDashboardProps) {
  const [sortBy, setSortBy] = useState<SortOption>('score')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])
  const [selectedStages, setSelectedStages] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Get unique industries and stages from matches
  const availableIndustries = useMemo(() => {
    const industries = new Set(matches.map(match => match.startup.industry))
    return Array.from(industries).sort()
  }, [matches])

  const availableStages = useMemo(() => {
    const stages = new Set(matches.map(match => match.startup.stage))
    return Array.from(stages).sort()
  }, [matches])

  // Filter and sort matches
  const filteredMatches = useMemo(() => {
    let filtered = matches

    // Apply status filter
    if (filterBy === 'unviewed') {
      filtered = filtered.filter(match => !match.viewed_at)
    } else if (filterBy === 'bookmarked') {
      filtered = filtered.filter(match => match.bookmarked_at)
    } else if (filterBy === 'contacted') {
      filtered = filtered.filter(match => match.contacted_at)
    }

    // Apply industry filter
    if (selectedIndustries.length > 0) {
      filtered = filtered.filter(match => 
        selectedIndustries.includes(match.startup.industry)
      )
    }

    // Apply stage filter
    if (selectedStages.length > 0) {
      filtered = filtered.filter(match => 
        selectedStages.includes(match.startup.stage)
      )
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(match => 
        match.startup.name.toLowerCase().includes(query) ||
        match.startup.tagline.toLowerCase().includes(query) ||
        match.startup.description.toLowerCase().includes(query) ||
        match.startup.industry.toLowerCase().includes(query)
      )
    }

    // Sort matches
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.score - a.score
        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'funding_ask':
          return b.startup.funding_ask - a.startup.funding_ask
        case 'name':
          return a.startup.name.localeCompare(b.startup.name)
        default:
          return 0
      }
    })

    return filtered
  }, [matches, filterBy, selectedIndustries, selectedStages, searchQuery, sortBy])

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value.toLocaleString()}`
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100'
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const handleViewMatch = (match: Match) => {
    onViewMatch(match.id)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-[#405B53] text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Startup Matches</h2>
            <p className="text-[#8C948B] mt-1">
              {filteredMatches.length} of {matches.length} matches
            </p>
          </div>
          <button
            onClick={onRefreshMatches}
            disabled={isLoading}
            className="px-4 py-2 bg-[#E64E1B] text-white rounded-md hover:bg-[#d63d0f] disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Refreshing...' : 'Refresh Matches'}
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="p-6 border-b border-gray-200">
        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search startups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#E64E1B] focus:border-[#E64E1B]"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as FilterOption)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-[#E64E1B] focus:border-[#E64E1B]"
            >
              <option value="all">All Matches</option>
              <option value="unviewed">Unviewed</option>
              <option value="bookmarked">Bookmarked</option>
              <option value="contacted">Contacted</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-[#E64E1B] focus:border-[#E64E1B]"
            >
              <option value="score">Match Score</option>
              <option value="created_at">Latest</option>
              <option value="funding_ask">Funding Amount</option>
              <option value="name">Company Name</option>
            </select>
          </div>

          {/* Toggle Advanced Filters */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Industry Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Industries</label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {availableIndustries.map(industry => (
                    <label key={industry} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedIndustries.includes(industry)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIndustries([...selectedIndustries, industry])
                          } else {
                            setSelectedIndustries(selectedIndustries.filter(i => i !== industry))
                          }
                        }}
                        className="rounded border-gray-300 text-[#E64E1B] focus:ring-[#E64E1B]"
                      />
                      <span className="text-sm">{industry}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Stage Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stages</label>
                <div className="space-y-1">
                  {availableStages.map(stage => (
                    <label key={stage} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedStages.includes(stage)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStages([...selectedStages, stage])
                          } else {
                            setSelectedStages(selectedStages.filter(s => s !== stage))
                          }
                        }}
                        className="rounded border-gray-300 text-[#E64E1B] focus:ring-[#E64E1B]"
                      />
                      <span className="text-sm">{stage}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setSelectedIndustries([])
                  setSelectedStages([])
                  setSearchQuery('')
                  setFilterBy('all')
                }}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Match Results */}
      <div className="divide-y divide-gray-200">
        {filteredMatches.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Star className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
            <p className="text-gray-500">
              {matches.length === 0 
                ? "You don't have any startup matches yet. Update your investment thesis to get personalized recommendations."
                : "Try adjusting your filters or search terms to find matches."
              }
            </p>
          </div>
        ) : (
          filteredMatches.map((match) => (
            <div key={match.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {match.startup.logo_url ? (
                        <img
                          src={match.startup.logo_url}
                          alt={`${match.startup.name} logo`}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-[#405B53] rounded-lg flex items-center justify-center text-white font-bold text-lg">
                          {match.startup.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-[#405B53] cursor-pointer">
                          {match.startup.name}
                        </h3>
                        <p className="text-sm text-gray-600">{match.startup.tagline}</p>
                      </div>
                    </div>
                    
                    {/* Match Score */}
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(match.score)}`}>
                      {Math.round(match.score * 100)}% match
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                    <div>
                      <span className="text-gray-500">Industry:</span>
                      <span className="ml-2 font-medium">{match.startup.industry}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Stage:</span>
                      <span className="ml-2 font-medium">{match.startup.stage}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Funding:</span>
                      <span className="ml-2 font-medium">{formatCurrency(match.startup.funding_ask)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Equity:</span>
                      <span className="ml-2 font-medium">{match.startup.equity_offered}%</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 mb-3 line-clamp-2">{match.startup.description}</p>

                  {/* Match Reasons */}
                  {match.match_reasons.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">Why this is a good match:</p>
                      <div className="flex flex-wrap gap-1">
                        {match.match_reasons.slice(0, 3).map((reason, index) => (
                          <span
                            key={index}
                            className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                          >
                            {reason}
                          </span>
                        ))}
                        {match.match_reasons.length > 3 && (
                          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{match.match_reasons.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Traction Metrics */}
                  {match.startup.traction_metrics && (
                    <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                      {match.startup.traction_metrics.revenue && (
                        <div>
                          <span className="text-gray-500">Revenue:</span>
                          <span className="ml-2 font-medium">
                            {formatCurrency(match.startup.traction_metrics.revenue)}
                          </span>
                        </div>
                      )}
                      {match.startup.traction_metrics.users && (
                        <div>
                          <span className="text-gray-500">Users:</span>
                          <span className="ml-2 font-medium">
                            {match.startup.traction_metrics.users.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {match.startup.traction_metrics.growth_rate && (
                        <div>
                          <span className="text-gray-500">Growth:</span>
                          <span className="ml-2 font-medium">
                            {match.startup.traction_metrics.growth_rate}%
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Rank #{match.rank}</span>
                  <span>•</span>
                  <span>{new Date(match.created_at).toLocaleDateString()}</span>
                  {match.viewed_at && (
                    <>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>Viewed</span>
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => onBookmarkMatch(match.id)}
                    className={`p-2 rounded-md transition-colors ${
                      match.bookmarked_at 
                        ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                        : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${match.bookmarked_at ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    onClick={() => onContactStartup(match.startup.id)}
                    disabled={!!match.contacted_at}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors ${
                      match.contacted_at
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'bg-[#E64E1B] text-white hover:bg-[#d63d0f]'
                    }`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{match.contacted_at ? 'Contacted' : 'Contact'}</span>
                  </button>

                  <button
                    onClick={() => handleViewMatch(match)}
                    className="px-4 py-2 border border-[#405B53] text-[#405B53] rounded-md hover:bg-[#405B53] hover:text-white transition-colors text-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
