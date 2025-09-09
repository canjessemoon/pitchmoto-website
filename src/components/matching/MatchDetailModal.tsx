'use client'

import { useState } from 'react'
import { X, ExternalLink, Heart, MessageCircle, TrendingUp, Users, DollarSign, MapPin, Calendar, Award } from 'lucide-react'

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
  pitch_deck_url?: string
  video_url?: string
  traction_metrics?: {
    revenue?: number
    users?: number
    growth_rate?: number
    partnerships?: number
  }
  team_info?: {
    founders: {
      name: string
      role: string
      background: string
    }[]
  }
  funding_history?: {
    round: string
    amount: number
    date: string
    investors: string[]
  }[]
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
  detailed_analysis?: string
}

interface MatchDetailModalProps {
  match: Match
  isOpen: boolean
  onClose: () => void
  onBookmark: (matchId: string) => void
  onContact: (startupId: string) => void
  onViewPitchDeck?: (url: string) => void
  onViewVideo?: (url: string) => void
}

export default function MatchDetailModal({
  match,
  isOpen,
  onClose,
  onBookmark,
  onContact,
  onViewPitchDeck,
  onViewVideo
}: MatchDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'traction' | 'scoring'>('overview')

  if (!isOpen) return null

  const { startup } = match

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value.toLocaleString()}`
  }

  const formatNumber = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
    return value.toLocaleString()
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100'
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const scoreFactors = [
    { key: 'industry_score', label: 'Industry Match', icon: Award },
    { key: 'stage_score', label: 'Stage Alignment', icon: TrendingUp },
    { key: 'funding_score', label: 'Funding Range', icon: DollarSign },
    { key: 'location_score', label: 'Location', icon: MapPin },
    { key: 'traction_score', label: 'Traction', icon: TrendingUp },
    { key: 'team_score', label: 'Team Quality', icon: Users }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-[#405B53] text-white p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              {startup.logo_url ? (
                <img
                  src={startup.logo_url}
                  alt={`${startup.name} logo`}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-[#8C948B] rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  {startup.name.charAt(0)}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold">{startup.name}</h2>
                <p className="text-[#8C948B] mt-1">{startup.tagline}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm">
                  <span className="flex items-center space-x-1">
                    <Award className="w-4 h-4" />
                    <span>{startup.industry}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>{startup.stage}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{startup.location}</span>
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`px-3 py-1 rounded-full text-lg font-bold ${getScoreColor(match.score)}`}>
                {Math.round(match.score * 100)}% match
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[#8C948B] rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'team', name: 'Team' },
              { id: 'traction', name: 'Traction' },
              { id: 'scoring', name: 'Match Scoring' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#E64E1B] text-[#E64E1B]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Funding Ask</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(startup.funding_ask)}</p>
                  <p className="text-sm text-blue-700">for {startup.equity_offered}% equity</p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-900">Team Size</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{startup.team_size}</p>
                  <p className="text-sm text-green-700">employees</p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-purple-900">Founded</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">{startup.founded_year}</p>
                  <p className="text-sm text-purple-700">{new Date().getFullYear() - startup.founded_year} years ago</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                <p className="text-gray-700 leading-relaxed">{startup.description}</p>
              </div>

              {/* Match Reasons */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Why This Is a Good Match</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {match.match_reasons.map((reason, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <span className="text-green-800 text-sm">{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Links and Actions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Resources</h3>
                <div className="flex flex-wrap gap-3">
                  {startup.website && (
                    <a
                      href={startup.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Website</span>
                    </a>
                  )}
                  {startup.pitch_deck_url && onViewPitchDeck && (
                    <button
                      onClick={() => onViewPitchDeck(startup.pitch_deck_url!)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <span>📄</span>
                      <span>Pitch Deck</span>
                    </button>
                  )}
                  {startup.video_url && onViewVideo && (
                    <button
                      onClick={() => onViewVideo(startup.video_url!)}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      <span>🎥</span>
                      <span>Pitch Video</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Team Tab */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Founding Team</h3>
              {startup.team_info?.founders ? (
                <div className="space-y-4">
                  {startup.team_info.founders.map((founder, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-[#405B53] rounded-full flex items-center justify-center text-white font-bold">
                          {founder.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{founder.name}</h4>
                          <p className="text-[#E64E1B] text-sm font-medium">{founder.role}</p>
                          <p className="text-gray-600 text-sm mt-2">{founder.background}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Team information not available</p>
                </div>
              )}
            </div>
          )}

          {/* Traction Tab */}
          {activeTab === 'traction' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Traction & Metrics</h3>
              
              {startup.traction_metrics ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {startup.traction_metrics.revenue && (
                    <div className="bg-green-50 rounded-lg p-6">
                      <div className="flex items-center space-x-2 mb-2">
                        <DollarSign className="w-6 h-6 text-green-600" />
                        <span className="font-medium text-green-900">Revenue</span>
                      </div>
                      <p className="text-3xl font-bold text-green-600">
                        {formatCurrency(startup.traction_metrics.revenue)}
                      </p>
                    </div>
                  )}

                  {startup.traction_metrics.users && (
                    <div className="bg-blue-50 rounded-lg p-6">
                      <div className="flex items-center space-x-2 mb-2">
                        <Users className="w-6 h-6 text-blue-600" />
                        <span className="font-medium text-blue-900">Users</span>
                      </div>
                      <p className="text-3xl font-bold text-blue-600">
                        {formatNumber(startup.traction_metrics.users)}
                      </p>
                    </div>
                  )}

                  {startup.traction_metrics.growth_rate && (
                    <div className="bg-yellow-50 rounded-lg p-6">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="w-6 h-6 text-yellow-600" />
                        <span className="font-medium text-yellow-900">Growth Rate</span>
                      </div>
                      <p className="text-3xl font-bold text-yellow-600">
                        {startup.traction_metrics.growth_rate}%
                      </p>
                    </div>
                  )}

                  {startup.traction_metrics.partnerships && (
                    <div className="bg-purple-50 rounded-lg p-6">
                      <div className="flex items-center space-x-2 mb-2">
                        <Award className="w-6 h-6 text-purple-600" />
                        <span className="font-medium text-purple-900">Partnerships</span>
                      </div>
                      <p className="text-3xl font-bold text-purple-600">
                        {startup.traction_metrics.partnerships}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Traction metrics not available</p>
                </div>
              )}

              {/* Funding History */}
              {startup.funding_history && startup.funding_history.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Funding History</h4>
                  <div className="space-y-3">
                    {startup.funding_history.map((round, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{round.round}</span>
                          <span className="font-bold text-[#405B53]">{formatCurrency(round.amount)}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>{round.date}</p>
                          {round.investors.length > 0 && (
                            <p className="mt-1">Investors: {round.investors.join(', ')}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Scoring Tab */}
          {activeTab === 'scoring' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Match Score Breakdown</h3>
                <div className={`px-4 py-2 rounded-lg text-xl font-bold ${getScoreColor(match.score)}`}>
                  {Math.round(match.score * 100)}% Overall Match
                </div>
              </div>

              <div className="space-y-4">
                {scoreFactors.map((factor) => {
                  const Icon = factor.icon
                  const score = match.score_breakdown[factor.key as keyof typeof match.score_breakdown]
                  return (
                    <div key={factor.key} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Icon className="w-5 h-5 text-gray-600" />
                          <span className="font-medium text-gray-900">{factor.label}</span>
                        </div>
                        <span className={`px-2 py-1 rounded text-sm font-medium ${getScoreColor(score)}`}>
                          {Math.round(score * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-[#E64E1B] h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${score * 100}%` }}
                        />
                      </div>
                    </div>
                  )
                })}

                {match.score_breakdown.keyword_bonus > 0 && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Award className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-900">Keyword Bonus</span>
                      </div>
                      <span className="px-2 py-1 rounded text-sm font-medium bg-green-100 text-green-600">
                        +{Math.round(match.score_breakdown.keyword_bonus * 100)}%
                      </span>
                    </div>
                    <p className="text-sm text-green-700">
                      This startup mentions keywords from your investment thesis
                    </p>
                  </div>
                )}
              </div>

              {match.detailed_analysis && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Detailed Analysis</h4>
                  <p className="text-blue-800 text-sm">{match.detailed_analysis}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Rank #{match.rank} • Matched {new Date(match.created_at).toLocaleDateString()}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onBookmark(match.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                match.bookmarked_at 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Heart className={`w-4 h-4 ${match.bookmarked_at ? 'fill-current' : ''}`} />
              <span>{match.bookmarked_at ? 'Bookmarked' : 'Bookmark'}</span>
            </button>

            <button
              onClick={() => onContact(startup.id)}
              disabled={!!match.contacted_at}
              className={`flex items-center space-x-2 px-6 py-2 rounded-md transition-colors ${
                match.contacted_at
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'bg-[#E64E1B] text-white hover:bg-[#d63d0f]'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>{match.contacted_at ? 'Contacted' : 'Contact Startup'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
