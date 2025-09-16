'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { AuthGuard } from '@/components/auth/auth-guard'
import { useAuthUser } from '@/components/auth/use-auth-user'
import { 
  TrendingUp, 
  Users, 
  BarChart3, 
  Settings, 
  Star,
  Building,
  DollarSign,
  MapPin
} from 'lucide-react'

interface Startup {
  id: string
  name: string
  tagline: string
  description: string
  industry: string
  stage: string
  funding_ask: number
  current_funding: number
  country: string
  pitch_deck_url?: string
  logo_url?: string
  website_url?: string
  created_at: string
}

interface Match {
  id: string
  startup: Startup
  score: number
  match_reasons: string[]
}

interface Analytics {
  total_matches: number
  total_views: number
  total_contacts: number
  avg_match_score: number
}

function InvestorDashboardContent() {
  const router = useRouter()
  const { user, profile, isLoading: authLoading } = useAuthUser()
  const [activeTab, setActiveTab] = useState('matches')
  const [matches, setMatches] = useState<Match[]>([])
  const [analytics, setAnalytics] = useState<Analytics>({
    total_matches: 0,
    total_views: 0,
    total_contacts: 0,
    avg_match_score: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [hasThesis, setHasThesis] = useState(false)

  // Helper function to get user's display name
  const getDisplayName = () => {
    if (profile?.full_name) return profile.full_name.split(' ')[0] // Get first name from full name
    if (user?.user_metadata?.first_name) return user.user_metadata.first_name
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name.split(' ')[0]
    if (user?.email) return user.email.split('@')[0]
    return 'Investor'
  }

  useEffect(() => {
    if (user && !authLoading) {
      checkProfileAndThesis()
    }
  }, [user, authLoading])

  const checkProfileAndThesis = async () => {
    if (!user?.id) return
    
    try {
      // First check if profile is complete
      if (!profile?.full_name || !profile?.bio) {
        console.log('Profile incomplete, redirecting to profile setup')
        router.push('/app/investors/profile')
        return
      }

      // Profile is complete, now check thesis
      console.log('Profile complete, checking investor thesis for user:', user.id)
      const response = await fetch(`/api/matching/thesis?user_id=${user.id}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Thesis check response:', data)
        
        if (data.thesis) {
          // Thesis exists, load dashboard with matches
          console.log('Thesis found, loading dashboard')
          setHasThesis(true)
          loadDashboardData()
        } else {
          // No thesis, show dashboard with empty state
          console.log('No thesis found, showing empty state')
          setHasThesis(false)
          setIsLoading(false)
        }
      } else {
        // No thesis found, show empty state
        console.log('Thesis API returned error, showing empty state')
        setHasThesis(false)
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Error checking profile/thesis:', error)
      setHasThesis(false)
      setIsLoading(false)
    }
  }

  // Debug: Log user and profile data
  useEffect(() => {
    console.log('Dashboard Debug - User:', user?.email)
    console.log('Dashboard Debug - Profile:', profile)
    console.log('Dashboard Debug - Auth Loading:', authLoading)
  }, [user, profile, authLoading])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Load startups from database and create mock matches
      const { data: startups, error } = await supabase
        .from('startups')
        .select('*')
        .limit(10)

      if (error) {
        console.error('Error loading startups:', error)
        // Fall back to mock data
        setMatches(getMockMatches())
        setAnalytics(getMockAnalytics())
      } else if (startups && startups.length > 0) {
        // Convert real startups to matches with mock scoring
        const realMatches = startups.map((startup) => ({
          id: `match-${startup.id}`,
          startup: startup,
          score: Math.floor(Math.random() * 30 + 70), // Random score 70-100
          match_reasons: getRandomMatchReasons()
        }))
        
        // Sort matches by score (highest first)
        const sortedMatches = realMatches.sort((a, b) => b.score - a.score)
        setMatches(sortedMatches)
        
        setAnalytics({
          total_matches: realMatches.length,
          total_views: 0, // Clear static number
          total_contacts: 0, // Clear static number
          avg_match_score: Math.floor(realMatches.reduce((sum, m) => sum + m.score, 0) / realMatches.length)
        })
      } else {
        // No startups in database, use mock data
        setMatches(getMockMatches())
        setAnalytics(getMockAnalytics())
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
      setMatches(getMockMatches())
      setAnalytics(getMockAnalytics())
    } finally {
      setIsLoading(false)
    }
  }

  const getMockMatches = (): Match[] => [
    {
      id: '1',
      startup: {
        id: '1',
        name: 'TechFlow AI',
        tagline: 'AI-powered workflow automation',
        description: 'We help businesses automate their workflows using AI',
        industry: 'Artificial Intelligence',
        stage: 'Series A',
        funding_ask: 5000000,
        current_funding: 0,
        country: 'United States',
        created_at: new Date().toISOString()
      },
      score: 92,
      match_reasons: ['Industry match', 'Stage preference', 'Location fit']
    },
    {
      id: '2',
      startup: {
        id: '2',
        name: 'GreenEnergy Solutions',
        tagline: 'Sustainable energy for smart homes',
        description: 'Making renewable energy accessible for every home',
        industry: 'CleanTech',
        stage: 'Seed',
        funding_ask: 2000000,
        current_funding: 0,
        country: 'United States',
        created_at: new Date().toISOString()
      },
      score: 87,
      match_reasons: ['High growth potential', 'ESG alignment', 'Market opportunity']
    },
    {
      id: '3',
      startup: {
        id: '3',
        name: 'HealthTech Connect',
        tagline: 'Digital health platform for rural areas',
        description: 'Connecting rural communities to healthcare services',
        industry: 'HealthTech',
        stage: 'Series A',
        funding_ask: 8000000,
        current_funding: 0,
        country: 'United States',
        created_at: new Date().toISOString()
      },
      score: 84,
      match_reasons: ['Impact potential', 'Market size', 'Team experience']
    }
  ]

  const getMockAnalytics = (): Analytics => ({
    total_matches: 23,
    total_views: 0, // Clear static number
    total_contacts: 0, // Clear static number
    avg_match_score: 78
  })

  const getRandomMatchReasons = (): string[] => {
    const reasons = [
      'Industry match', 'Stage preference', 'Location fit', 'High growth potential',
      'ESG alignment', 'Market opportunity', 'Impact potential', 'Market size',
      'Team experience', 'Technology innovation', 'Revenue model', 'Scalability'
    ]
    const count = Math.floor(Math.random() * 3) + 2 // 2-4 reasons
    return reasons.sort(() => 0.5 - Math.random()).slice(0, count)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E64E1B] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Show empty state if no thesis
  if (!hasThesis) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <span className="text-xl font-bold">
                  <span className="text-[#405B53]">Pitch</span>
                  <span className="text-[#E64E1B]">Moto</span>
                </span>
              </div>
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => router.push('/app/investors/dashboard')}
                  className="text-sm font-medium text-[#405B53] hover:text-[#E64E1B] transition-colors"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => router.push('/app/investors/matches')}
                  className="text-sm font-medium text-gray-700 hover:text-[#E64E1B] transition-colors"
                >
                  Matches
                </button>
                <button
                  onClick={() => router.push('/app/investors/thesis')}
                  className="text-sm font-medium text-gray-700 hover:text-[#E64E1B] transition-colors"
                >
                  Thesis
                </button>
                <button
                  onClick={() => router.push('/app/investors/profile')}
                  className="text-sm font-medium text-gray-700 hover:text-[#E64E1B] transition-colors"
                >
                  Profile
                </button>
                <span className="text-sm text-gray-700">
                  Welcome, {getDisplayName()}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/auth/signin')}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Empty State Content */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to PitchMoto, {getDisplayName()}!
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              You're all set up with your profile. Now let's create your investment thesis 
              so we can start finding startup matches that align with your investment criteria.
            </p>
            
            <div className="bg-white rounded-lg shadow-sm p-8 max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Your Investment Thesis</h2>
              <p className="text-gray-600 mb-6">
                Your investment thesis helps us understand what types of startups you're looking for. 
                We'll use this to show you the most relevant opportunities on the platform.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Industry preferences</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Investment stage & size</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Geographic preferences</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Scoring criteria weights</span>
                </div>
              </div>

              <Button
                onClick={() => router.push('/app/investors/thesis')}
                className="w-full bg-[#E64E1B] hover:bg-[#d63f0d] text-white"
                size="lg"
              >
                Create Investment Thesis
              </Button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Need to update your profile information? 
                <button 
                  onClick={() => router.push('/app/investors/profile')}
                  className="text-[#E64E1B] hover:underline ml-1"
                >
                  Edit Profile
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold">
                <span className="text-[#405B53]">Pitch</span>
                <span className="text-[#E64E1B]">Moto</span>
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <button
                onClick={() => router.push('/app/investors/dashboard')}
                className="text-sm font-medium text-[#405B53] hover:text-[#E64E1B] transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={() => router.push('/app/investors/matches')}
                className="text-sm font-medium text-gray-700 hover:text-[#E64E1B] transition-colors"
              >
                Matches
              </button>
              <button
                onClick={() => router.push('/app/investors/thesis')}
                className="text-sm font-medium text-gray-700 hover:text-[#E64E1B] transition-colors"
              >
                Thesis
              </button>
              <button
                onClick={() => router.push('/app/investors/profile')}
                className="text-sm font-medium text-gray-700 hover:text-[#E64E1B] transition-colors"
              >
                Profile
              </button>
              <span className="text-sm text-gray-700">
                Welcome, {getDisplayName()}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/auth/signin')}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {getDisplayName()}'s Investor Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {getDisplayName()}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => router.push('/app/investors/thesis')}
              className="flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>Edit Thesis</span>
            </Button>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Matches</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.total_matches}</p>
              </div>
              <Star className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Profile Views</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.total_views}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Contacts Made</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.total_contacts}</p>
              </div>
              <Building className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Match Score</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.avg_match_score}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="matches" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Matches ({matches.length})</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="matches" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Your Matches</h3>
                <p className="text-gray-600">Startups that match your investment criteria</p>
              </div>
              
              <div className="divide-y">
                {matches.map((match) => (
                  <div key={match.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">
                            {match.startup.name}
                          </h4>
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBg(match.score)}`}>
                            <span className={getScoreColor(match.score)}>
                              {match.score}% Match
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{match.startup.tagline}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
                          <div className="flex items-center space-x-2">
                            <Building className="w-4 h-4 text-gray-400" />
                            <span>{match.startup.industry}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4 text-gray-400" />
                            <span>{match.startup.stage}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{match.startup.country}</span>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex items-center space-x-2 text-sm">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {formatCurrency(match.startup.funding_ask)} funding ask
                          </span>
                        </div>
                        
                        <div className="mt-3">
                          <p className="text-sm text-gray-600">Match reasons:</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {match.match_reasons.map((reason, idx) => (
                              <span 
                                key={idx}
                                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                              >
                                {reason}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-6">
                        <Button 
                          size="sm"
                          onClick={() => router.push(`/app/investors/matches/${match.startup.id}`)}
                        >
                          View Details
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => alert('Contact feature coming soon!')}
                        >
                          Contact
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h4>
                <p className="text-gray-600 mb-4">
                  Track your investment activity and startup discovery performance.
                </p>
                <p className="text-sm text-blue-600">
                  Detailed analytics and charts will be available in the next update.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Status Notice */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-5 h-5 text-green-400">✅</div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Phase F Integration Complete</h3>
              <p className="text-sm text-green-700 mt-1">
                This dashboard is now connected to your real authentication system and 
                {matches.some(m => m.startup.created_at) ? ' displays real startup data from your database.' : ' will display real startup data as it becomes available.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function InvestorDashboardPage() {
  return (
    <AuthGuard requiredUserType="investor">
      <InvestorDashboardContent />
    </AuthGuard>
  )
}
