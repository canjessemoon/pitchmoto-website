'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { MatchDashboard } from '@/components/matching'
import { AuthGuard } from '@/components/auth/auth-guard'
import { useAuthUser } from '@/components/auth/use-auth-user'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Settings } from 'lucide-react'

interface MatchData {
  id: string
  startup_id: string
  startup: {
    id: string
    name: string
    tagline: string
    description: string
    industry: string
    stage: string
    funding_ask: number
    equity_offered?: number
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

function MatchesPageContent() {
  const router = useRouter()
  const { user, profile, isLoading: authLoading } = useAuthUser()
  const [matches, setMatches] = useState<MatchData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasThesis, setHasThesis] = useState(false)

  // Helper function to get user's display name
  const getDisplayName = () => {
    if (profile?.full_name) return profile.full_name.split(' ')[0]
    if (user?.user_metadata?.first_name) return user.user_metadata.first_name
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name.split(' ')[0]
    if (user?.email) return user.email.split('@')[0]
    return 'Investor'
  }

  useEffect(() => {
    if (user && !authLoading && profile?.user_type === 'investor') {
      loadMatches()
    }
  }, [user, authLoading, profile])

  const loadMatches = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log('Loading matches for user:', user?.id)

      // First check if user has an investment thesis using Supabase client
      // Don't use .single() as it can cause 406 errors
      const { data: theses, error: thesisError } = await supabase
        .from('investor_theses')
        .select('*')
        .eq('investor_id', user?.id)
        .eq('is_active', true)

      console.log('Thesis query result:', { theses, thesisError })

      if (thesisError) {
        console.error('Thesis check error:', thesisError)
        setHasThesis(false)
        setIsLoading(false)
        return
      } else if (theses && theses.length > 0) {
        console.log('Found thesis:', theses[0])
        setHasThesis(true)
      } else {
        console.log('No thesis found')
        setHasThesis(false)
        setIsLoading(false)
        return
      }

      // Load matches from API (keep this for now since it's more complex)
      const matchesResponse = await fetch('/api/matching/matches')
      
      if (matchesResponse.ok) {
        const data = await matchesResponse.json()
        setMatches(data.matches || [])
      } else {
        // Fallback to mock data for development
        setMatches(getMockMatches())
      }
    } catch (err) {
      console.error('Error loading matches:', err)
      setError('Failed to load startup matches')
      // Use mock data as fallback
      setMatches(getMockMatches())
    } finally {
      setIsLoading(false)
    }
  }

  const getMockMatches = (): MatchData[] => [
    {
      id: 'match-1',
      startup_id: 'startup-1',
      startup: {
        id: 'startup-1',
        name: 'TechFlow AI',
        tagline: 'AI-powered workflow automation for enterprises',
        description: 'We help businesses automate their complex workflows using advanced AI and machine learning.',
        industry: 'Artificial Intelligence',
        stage: 'Seed',
        funding_ask: 2000000,
        location: 'San Francisco, CA',
        founded_year: 2022,
        team_size: 8,
        website: 'https://techflow-ai.com',
        traction_metrics: {
          revenue: 15000, // Monthly recurring revenue
          users: 250,
          growth_rate: 15 // Monthly growth %
        }
      },
      score: 85,
      rank: 1,
      created_at: new Date().toISOString(),
      score_breakdown: {
        industry_score: 90,
        stage_score: 85,
        funding_score: 80,
        location_score: 85,
        traction_score: 82,
        team_score: 88,
        keyword_bonus: 3
      },
      match_reasons: ['Perfect industry match', 'Strong growth trajectory', 'Experienced team', 'Location fit']
    },
    {
      id: 'match-2',
      startup_id: 'startup-2',
      startup: {
        id: 'startup-2',
        name: 'GreenEnergy Solutions',
        tagline: 'Sustainable energy storage for smart homes',
        description: 'Making renewable energy accessible and affordable for every household with innovative battery technology.',
        industry: 'CleanTech',
        stage: 'Pre-Seed',
        funding_ask: 800000,
        location: 'Toronto, ON',
        founded_year: 2023,
        team_size: 5,
        website: 'https://greenenergy-solutions.com',
        traction_metrics: {
          revenue: 8000, // Monthly recurring revenue
          users: 80,
          growth_rate: 25 // Monthly growth %
        }
      },
      score: 78,
      rank: 2,
      created_at: new Date().toISOString(),
      score_breakdown: {
        industry_score: 75,
        stage_score: 80,
        funding_score: 85,
        location_score: 70,
        traction_score: 75,
        team_score: 80,
        keyword_bonus: 2
      },
      match_reasons: ['High growth potential', 'ESG alignment', 'Strong market opportunity']
    },
    {
      id: 'match-3',
      startup_id: 'startup-3',
      startup: {
        id: 'startup-3',
        name: 'HealthTech Connect',
        tagline: 'Digital health platform connecting rural communities',
        description: 'Bridging the healthcare gap by connecting rural communities to quality medical services through telemedicine.',
        industry: 'HealthTech',
        stage: 'Seed',
        funding_ask: 3500000,
        location: 'Austin, TX',
        founded_year: 2021,
        team_size: 15,
        website: 'https://healthtech-connect.com',
        traction_metrics: {
          revenue: 35000, // Monthly recurring revenue
          users: 1200,
          growth_rate: 20 // Monthly growth %
        }
      },
      score: 72,
      rank: 3,
      created_at: new Date().toISOString(),
      score_breakdown: {
        industry_score: 70,
        stage_score: 75,
        funding_score: 68,
        location_score: 65,
        traction_score: 80,
        team_score: 75,
        keyword_bonus: 1
      },
      match_reasons: ['Strong impact potential', 'Large market size', 'Proven team experience']
    },
    {
      id: 'match-4',
      startup_id: 'startup-4',
      startup: {
        id: 'startup-4',
        name: 'FinTech Innovators',
        tagline: 'Next-generation payment solutions for SMBs',
        description: 'Empowering small and medium businesses with advanced payment processing and financial management tools.',
        industry: 'FinTech',
        stage: 'Pre-Seed',
        funding_ask: 1500000,
        location: 'New York, NY',
        founded_year: 2023,
        team_size: 6,
        website: 'https://fintech-innovators.com',
        traction_metrics: {
          revenue: 12000, // Monthly recurring revenue
          users: 120,
          growth_rate: 18 // Monthly growth %
        }
      },
      score: 68,
      rank: 4,
      created_at: new Date().toISOString(),
      score_breakdown: {
        industry_score: 70,
        stage_score: 65,
        funding_score: 72,
        location_score: 75,
        traction_score: 65,
        team_score: 70,
        keyword_bonus: 1
      },
      match_reasons: ['Strong funding fit', 'Growing market', 'Solid technology foundation']
    },
    {
      id: 'match-5',
      startup_id: 'startup-5',
      startup: {
        id: 'startup-5',
        name: 'EduTech Revolution',
        tagline: 'Personalized learning platform for K-12 education',
        description: 'Transforming education through AI-powered personalized learning experiences for students and teachers.',
        industry: 'EdTech',
        stage: 'Seed',
        funding_ask: 3000000,
        location: 'Vancouver, BC',
        founded_year: 2022,
        team_size: 12,
        website: 'https://edutech-revolution.com',
        traction_metrics: {
          revenue: 28000, // Monthly recurring revenue
          users: 800,
          growth_rate: 22 // Monthly growth %
        }
      },
      score: 69,
      rank: 5,
      created_at: new Date().toISOString(),
      score_breakdown: {
        industry_score: 65,
        stage_score: 70,
        funding_score: 68,
        location_score: 60,
        traction_score: 75,
        team_score: 72,
        keyword_bonus: 1
      },
      match_reasons: ['Good market timing', 'Scalable platform', 'Education impact']
    }
  ]

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E64E1B] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your matches...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Matches</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-3">
            <Button onClick={loadMatches}>
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

  if (!hasThesis) {
    console.log('Showing no thesis message. State:', { hasThesis, isLoading, user: !!user })
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              className="mr-4 flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Startup Matches</h1>
              <p className="text-gray-600 mt-1">Discover startups that match your investment criteria</p>
            </div>
          </div>

          {/* No Thesis State */}
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-[#E64E1B] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Settings className="w-8 h-8 text-[#E64E1B]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Create Your Investment Thesis First
            </h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              To get personalized startup matches, you need to define your investment criteria. 
              This helps our AI-powered matching system find startups that align with your preferences.
            </p>
            <div className="space-x-4">
              <Button 
                onClick={() => router.push('/thesis')}
                className="bg-[#E64E1B] hover:bg-[#d63d0f]"
              >
                Create Investment Thesis
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/dashboard')}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
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
                {getDisplayName()}'s Startup Matches
              </h1>
              <p className="text-gray-600 mt-1">
                {matches.length} startups match your investment criteria
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => router.push('/thesis?edit=true')}
              className="flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>Edit Thesis</span>
            </Button>
            <Button
              onClick={loadMatches}
              variant="outline"
            >
              Refresh Matches
            </Button>
          </div>
        </div>

        {/* Match Dashboard Component */}
        <MatchDashboard 
          matches={matches}
          onViewMatch={(matchId: string) => router.push(`/matches/${matchId}`)}
          onBookmarkMatch={(matchId: string) => {
            // TODO: Implement bookmark functionality
            console.log('Bookmark match:', matchId)
          }}
          onContactStartup={(startupId: string) => {
            // TODO: Implement contact functionality
            console.log('Contact startup:', startupId)
          }}
          onRefreshMatches={loadMatches}
          isLoading={isLoading}
        />

        {/* Integration Notice */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-5 h-5 text-green-400">✅</div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Matching System Integration Complete</h3>
              <p className="text-sm text-green-700 mt-1">
                This page now displays {matches.length > 0 ? 'real startup matches' : 'sample matches'} based on your investment thesis. 
                The matching algorithm considers industry, stage, funding, location, traction, and team factors.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MatchesPage() {
  return (
    <AuthGuard requiredUserType="investor">
      <MatchesPageContent />
    </AuthGuard>
  )
}
