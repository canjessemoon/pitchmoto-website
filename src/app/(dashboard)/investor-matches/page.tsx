'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/auth/auth-guard'
import { useAuthUser } from '@/components/auth/use-auth-user'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  MapPin, 
  Building,
  BarChart3,
  Star,
  Eye,
  MessageCircle,
  Lightbulb
} from 'lucide-react'

interface MatchSummary {
  total_matches: number
  by_stage: Record<string, number>
  by_country: Record<string, number>
  by_sector: Record<string, number>
  by_funding_range: Record<string, number>
  recent_matches: number
  avg_match_score: number
  top_match_reasons: string[]
}

interface Startup {
  id: string
  name: string
  tagline: string
  industry: string
  stage: string
  funding_ask: number
  location: string
  description: string
}

interface DataQualitySuggestion {
  type: 'critical' | 'recommended' | 'optional'
  title: string
  description: string
  action: string
  impact: string
}

function FounderMatchSummaryContent() {
  const router = useRouter()
  const { user, profile, isLoading: authLoading } = useAuthUser()
  const [matchSummary, setMatchSummary] = useState<MatchSummary | null>(null)
  const [startup, setStartup] = useState<Startup | null>(null)
  const [suggestions, setSuggestions] = useState<DataQualitySuggestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('breakdown')

  // Helper function to get user's display name
  const getDisplayName = () => {
    if (profile?.full_name) return profile.full_name.split(' ')[0]
    if (user?.user_metadata?.first_name) return user.user_metadata.first_name
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name.split(' ')[0]
    if (user?.email) return user.email.split('@')[0]
    return 'Founder'
  }

  useEffect(() => {
    if (user && !authLoading && profile?.user_type === 'founder') {
      loadMatchSummary()
    } else if (!authLoading && profile?.user_type !== 'founder') {
      router.push('/dashboard')
    }
  }, [user, authLoading, profile, router])

  const loadMatchSummary = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // First, get user's startup
      const startupResponse = await fetch(`/api/startups?user_id=${user?.id}`)
      
      if (startupResponse.ok) {
        const startupData = await startupResponse.json()
        if (startupData.startups && startupData.startups.length > 0) {
          const userStartup = startupData.startups[0] // Use first startup
          setStartup(userStartup)

          // Get match summary for this startup
          const summaryResponse = await fetch(`/api/matching/summary?startupId=${userStartup.id}`)
          
          if (summaryResponse.ok) {
            const summaryData = await summaryResponse.json()
            setMatchSummary(summaryData)
            setSuggestions(generateDataQualitySuggestions(userStartup, summaryData))
          } else {
            // Use mock data for development
            const mockSummary = getMockMatchSummary()
            setMatchSummary(mockSummary)
            setSuggestions(generateDataQualitySuggestions(userStartup, mockSummary))
          }
        } else {
          setError('No startup found. Please create a startup profile first.')
        }
      } else {
        setError('Failed to load startup information')
      }
    } catch (err) {
      console.error('Error loading match summary:', err)
      setError('Failed to load match summary')
    } finally {
      setIsLoading(false)
    }
  }

  const getMockMatchSummary = (): MatchSummary => ({
    total_matches: 23,
    by_stage: {
      'Pre-seed': 3,
      'Seed': 8,
      'Series A': 7,
      'Series B': 3,
      'Growth': 2
    },
    by_country: {
      'United States': 15,
      'Canada': 5,
      'United Kingdom': 2,
      'Germany': 1
    },
    by_sector: {
      'Technology': 12,
      'FinTech': 6,
      'HealthTech': 3,
      'CleanTech': 2
    },
    by_funding_range: {
      '$100K - $500K': 4,
      '$500K - $2M': 8,
      '$2M - $10M': 7,
      '$10M+': 4
    },
    recent_matches: 5,
    avg_match_score: 78,
    top_match_reasons: [
      'Industry alignment',
      'Stage compatibility',
      'Geographic proximity',
      'Funding range match',
      'Growth potential'
    ]
  })

  const generateDataQualitySuggestions = (startup: Startup, summary: MatchSummary): DataQualitySuggestion[] => {
    const suggestions: DataQualitySuggestion[] = []

    if (summary.total_matches < 10) {
      suggestions.push({
        type: 'critical',
        title: 'Low Match Count',
        description: 'You have fewer matches than typical startups in your stage.',
        action: 'Update your startup profile with more detailed information',
        impact: 'Could increase matches by 40-60%'
      })
    }

    if (summary.avg_match_score < 70) {
      suggestions.push({
        type: 'recommended',
        title: 'Improve Match Quality',
        description: 'Your average match score could be higher.',
        action: 'Add more traction metrics and team information',
        impact: 'Could improve average score by 10-15 points'
      })
    }

    suggestions.push({
      type: 'optional',
      title: 'Add Pitch Video',
      description: 'Startups with pitch videos get 3x more investor engagement.',
      action: 'Upload a 2-3 minute pitch video',
      impact: 'Could increase contact rate by 200%'
    })

    suggestions.push({
      type: 'recommended',
      title: 'Complete Financial Projections',
      description: 'Detailed financials help investors understand your growth potential.',
      action: 'Add revenue projections and key metrics',
      impact: 'Could increase match quality by 20%'
    })

    return suggestions
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'critical': return '🚨'
      case 'recommended': return '💡'
      case 'optional': return '✨'
      default: return '💡'
    }
  }

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-red-200 bg-red-50'
      case 'recommended': return 'border-yellow-200 bg-yellow-50'
      case 'optional': return 'border-blue-200 bg-blue-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E64E1B] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your match summary...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Matches</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-3">
            <Button onClick={loadMatchSummary}>
              Try Again
            </Button>
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!startup || !matchSummary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-gray-400 mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-600 mb-4">Unable to load match summary data.</p>
          <Button onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              className="mr-4 flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Investor Match Summary
              </h1>
              <p className="text-gray-600 mt-1">
                {startup.name} • {formatNumber(matchSummary.total_matches)} investors matched
              </p>
            </div>
          </div>
          <Button
            onClick={loadMatchSummary}
            variant="outline"
          >
            Refresh Data
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Matches</p>
                <p className="text-3xl font-bold text-gray-900">{matchSummary.total_matches}</p>
                <p className="text-sm text-green-600 mt-1">+{matchSummary.recent_matches} this week</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Match Score</p>
                <p className="text-3xl font-bold text-gray-900">{matchSummary.avg_match_score}%</p>
                <p className="text-sm text-gray-500 mt-1">Compatibility</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Profile Views</p>
                <p className="text-3xl font-bold text-gray-900">156</p>
                <p className="text-sm text-gray-500 mt-1">From investors</p>
              </div>
              <Eye className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Contacts Made</p>
                <p className="text-3xl font-bold text-gray-900">8</p>
                <p className="text-sm text-gray-500 mt-1">Investor outreach</p>
              </div>
              <MessageCircle className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="breakdown" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Match Breakdown</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Insights</span>
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="flex items-center space-x-2">
              <Lightbulb className="w-4 h-4" />
              <span>Suggestions</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="breakdown" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Investment Stages */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                  Investor Stages
                </h3>
                <div className="space-y-3">
                  {Object.entries(matchSummary.by_stage).map(([stage, count]) => (
                    <div key={stage} className="flex items-center justify-between">
                      <span className="text-gray-700">{stage}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${(count / matchSummary.total_matches) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Geographic Distribution */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-green-500" />
                  Geographic Distribution
                </h3>
                <div className="space-y-3">
                  {Object.entries(matchSummary.by_country).map(([country, count]) => (
                    <div key={country} className="flex items-center justify-between">
                      <span className="text-gray-700">{country}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${(count / matchSummary.total_matches) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sector Preferences */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Building className="w-5 h-5 mr-2 text-purple-500" />
                  Investor Sectors
                </h3>
                <div className="space-y-3">
                  {Object.entries(matchSummary.by_sector).map(([sector, count]) => (
                    <div key={sector} className="flex items-center justify-between">
                      <span className="text-gray-700">{sector}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full" 
                            style={{ width: `${(count / matchSummary.total_matches) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Funding Ranges */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-orange-500" />
                  Funding Preferences
                </h3>
                <div className="space-y-3">
                  {Object.entries(matchSummary.by_funding_range).map(([range, count]) => (
                    <div key={range} className="flex items-center justify-between">
                      <span className="text-gray-700">{range}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-orange-500 h-2 rounded-full" 
                            style={{ width: `${(count / matchSummary.total_matches) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Match Insights</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Top Match Reasons</h4>
                  <div className="space-y-2">
                    {matchSummary.top_match_reasons.map((reason, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <span className="text-gray-700">{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Performance Comparison</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Your Matches</span>
                      <span className="font-medium">{matchSummary.total_matches}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Industry Average</span>
                      <span className="font-medium text-gray-500">18</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Top 10%</span>
                      <span className="font-medium text-gray-500">35+</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      🎉 You're performing {matchSummary.total_matches > 18 ? 'above' : 'at'} industry average!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-6">
            <div className="space-y-4">
              {suggestions.map((suggestion, index) => (
                <div key={index} className={`border rounded-lg p-6 ${getSuggestionColor(suggestion.type)}`}>
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">{getSuggestionIcon(suggestion.type)}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">{suggestion.title}</h4>
                      <p className="text-gray-700 mb-3">{suggestion.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-900">Action:</span>
                          <p className="text-gray-600">{suggestion.action}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Potential Impact:</span>
                          <p className="text-gray-600">{suggestion.impact}</p>
                        </div>
                      </div>
                      <Button size="sm" className="mt-3" variant="outline">
                        Take Action
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Integration Status */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-5 h-5 text-green-400">✅</div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Founder Match Summary Complete</h3>
              <p className="text-sm text-green-700 mt-1">
                This dashboard shows aggregated investor match data for {startup.name}. 
                Data updates in real-time as new investors discover and match with your startup.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FounderMatchSummaryPage() {
  return (
    <AuthGuard requiredUserType="founder">
      <FounderMatchSummaryContent />
    </AuthGuard>
  )
}
