'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers'
import Link from 'next/link'
import { Search, Filter, Grid, List, Clock, MapPin, Users } from 'lucide-react'

interface Startup {
  id: string
  name: string
  tagline: string
  description: string
  industry: string
  stage: string
  funding_goal: number
  country: string | null
  website_url: string | null
  logo_url: string | null
  created_at: string
}

interface Pitch {
  id: string
  title: string
  content: string
  funding_ask: number | null
  created_at: string
  startup: Startup
}

export default function StartupsPage() {
  const { user, loading } = useAuth()
  const [pitches, setPitches] = useState<Pitch[]>([])
  const [loadingPitches, setLoadingPitches] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState('')
  const [selectedStage, setSelectedStage] = useState('')
  const [sortBy, setSortBy] = useState('newest') // newest, funding
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Industry options
  const INDUSTRIES = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce', 
    'SaaS', 'Mobile Apps', 'AI/ML', 'Blockchain', 'IoT', 
    'Gaming', 'Media', 'Real Estate', 'Transportation', 'Food & Beverage',
    'Fashion', 'Travel', 'Sports', 'Energy', 'Other'
  ]

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
    fetchPublishedPitches()
  }, [])

  const fetchPublishedPitches = async () => {
    try {
      setLoadingPitches(true)
      // For now, we'll fetch all pitches since we don't have published status yet
      // TODO: Update this to only fetch published pitches when we add that field
      const response = await fetch('/api/public/pitches', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch startups')
      }

      const data = await response.json()
      setPitches(data.pitches || [])
    } catch (error) {
      console.error('Error fetching startups:', error)
      setError('Failed to load startups')
    } finally {
      setLoadingPitches(false)
    }
  }

  // Filter and sort pitches
  const filteredAndSortedPitches = React.useMemo(() => {
    let filtered = pitches.filter(pitch => {
      const matchesSearch = !searchTerm || 
        pitch.startup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pitch.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pitch.startup.tagline.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesIndustry = !selectedIndustry || pitch.startup.industry === selectedIndustry
      const matchesStage = !selectedStage || pitch.startup.stage === selectedStage
      
      return matchesSearch && matchesIndustry && matchesStage
    })

    // Sort pitches
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'funding':
          return (b.funding_ask || 0) - (a.funding_ask || 0)
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

    return filtered
  }, [pitches, searchTerm, selectedIndustry, selectedStage, sortBy])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold">
                <span className="text-[#405B53]">Pitch</span>
                <span className="text-[#E64E1B]">Moto</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-gray-700">
                    Welcome, {user.profile?.full_name || user.email}
                  </span>
                  <Link 
                    href="/dashboard"
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    href="/signin"
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/signup"
                    className="bg-[#E64E1B] text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                  >
                    Join PitchMoto
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Investor Dashboard
            </h1>
            <p className="text-gray-600">
              Browse innovative startups looking for investment and support
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search startups..."
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

            {/* Sort and View Options */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#405B53]"
                >
                  <option value="newest">Newest</option>
                  <option value="funding">Funding Amount</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-[#405B53] text-white' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-[#405B53] text-white' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          {loadingPitches ? (
            <div className="text-center py-12">
              <div className="text-lg text-gray-600">Loading startups...</div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">{error}</div>
              <button
                onClick={fetchPublishedPitches}
                className="bg-[#405B53] text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Try Again
              </button>
            </div>
          ) : filteredAndSortedPitches.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="text-gray-500 mb-4">
                <Search className="mx-auto h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No startups found</h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedIndustry('')
                  setSelectedStage('')
                }}
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
                  Found {filteredAndSortedPitches.length} startup{filteredAndSortedPitches.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Startup Grid/List */}
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "space-y-4"
              }>
                {filteredAndSortedPitches.map((pitch) => (
                  <StartupCard 
                    key={pitch.id} 
                    pitch={pitch} 
                    viewMode={viewMode}
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

// Startup Card Component
interface StartupCardProps {
  pitch: Pitch
  viewMode: 'grid' | 'list'
}

function StartupCard({ pitch, viewMode }: StartupCardProps) {
  const { startup } = pitch

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <h3 className="text-xl font-semibold text-gray-900 mr-3">
                {startup.name}
              </h3>
            </div>
            
            <p className="text-gray-600 mb-2">{startup.tagline}</p>
            
            <div className="flex items-center text-sm text-gray-500 space-x-4 mb-2">
              <span className="inline-flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {startup.industry}
              </span>
              <span className="inline-flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {startup.stage}
              </span>
              {startup.country && (
                <span className="inline-flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {startup.country}
                </span>
              )}
            </div>

            {pitch.funding_ask && (
              <p className="text-sm text-gray-600 mb-2">
                <strong>Seeking:</strong> ${pitch.funding_ask.toLocaleString()}
              </p>
            )}
          </div>

          <div className="ml-4">
            <Link
              href={`/app/startup/${startup.id}`}
              className="bg-[#405B53] text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              View Pitch
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-semibold text-gray-900">{startup.name}</h3>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2">{startup.tagline}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <Users className="h-4 w-4 mr-2" />
            <span>{startup.industry} • {startup.stage}</span>
          </div>
          
          {startup.country && (
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{startup.country}</span>
            </div>
          )}
          
          {pitch.funding_ask && (
            <div className="flex items-center text-sm text-gray-600">
              <span className="font-medium">Seeking: ${pitch.funding_ask.toLocaleString()}</span>
            </div>
          )}
        </div>

        <Link
          href={`/app/startup/${startup.id}`}
          className="block w-full text-center bg-[#405B53] text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          View Pitch
        </Link>
      </div>
    </div>
  )
}
