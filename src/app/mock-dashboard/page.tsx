'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MockAuthGuard } from '@/components/auth/mock-auth-guard'
import { useMockAuthUser } from '@/components/auth/use-mock-auth-user'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  Users, 
  BarChart3, 
  Settings, 
  Plus,
  Star,
  Building,
  DollarSign,
  MapPin
} from 'lucide-react'

function MockInvestorDashboardContent() {
  const router = useRouter()
  const { user, profile, isLoading: authLoading } = useMockAuthUser()
  const [activeTab, setActiveTab] = useState('matches')

  // Mock data for demonstration
  const mockMatches = [
    {
      id: '1',
      startup: {
        name: 'TechFlow AI',
        tagline: 'AI-powered workflow automation',
        industry: 'Artificial Intelligence',
        stage: 'Series A',
        location: 'San Francisco, CA',
        funding_ask: 5000000,
        logo_url: null
      },
      score: 92,
      match_reasons: ['Industry match', 'Stage preference', 'Location fit']
    },
    {
      id: '2',
      startup: {
        name: 'GreenEnergy Solutions',
        tagline: 'Sustainable energy for smart homes',
        industry: 'CleanTech',
        stage: 'Seed',
        location: 'Austin, TX',
        funding_ask: 2000000,
        logo_url: null
      },
      score: 87,
      match_reasons: ['High growth potential', 'ESG alignment', 'Market opportunity']
    },
    {
      id: '3',
      startup: {
        name: 'HealthTech Connect',
        tagline: 'Digital health platform for rural areas',
        industry: 'HealthTech',
        stage: 'Series A',
        location: 'Denver, CO',
        funding_ask: 8000000,
        logo_url: null
      },
      score: 84,
      match_reasons: ['Impact potential', 'Market size', 'Team experience']
    }
  ]

  const mockAnalytics = {
    total_matches: 23,
    total_views: 45,
    total_contacts: 8,
    avg_match_score: 78
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E64E1B] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {profile?.first_name || 'Investor'}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  localStorage.removeItem('mock_auth')
                  router.push('/test-auth')
                }}
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
              Investment Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {profile?.first_name || 'Investor'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => alert('Investment thesis feature coming soon!')}
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
                <p className="text-2xl font-bold text-gray-900">{mockAnalytics.total_matches}</p>
              </div>
              <Star className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Profile Views</p>
                <p className="text-2xl font-bold text-gray-900">{mockAnalytics.total_views}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Contacts Made</p>
                <p className="text-2xl font-bold text-gray-900">{mockAnalytics.total_contacts}</p>
              </div>
              <Building className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Match Score</p>
                <p className="text-2xl font-bold text-gray-900">{mockAnalytics.avg_match_score}%</p>
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
              <span>Matches ({mockMatches.length})</span>
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
                {mockMatches.map((match) => (
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
                            <span>{match.startup.location}</span>
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
                          onClick={() => alert('View details feature coming soon!')}
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
                  This is a mock dashboard showing the investor interface design.
                </p>
                <p className="text-sm text-blue-600">
                  In the full version, this would show detailed analytics, charts, and insights.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Demo Notice */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-5 h-5 text-blue-400">ℹ️</div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Demo Mode</h3>
              <p className="text-sm text-blue-700 mt-1">
                This is a mock dashboard with sample data to demonstrate the investor interface. 
                In production, this would connect to real startup data and matching algorithms.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MockInvestorDashboardPage() {
  return (
    <MockAuthGuard requiredUserType="investor">
      <MockInvestorDashboardContent />
    </MockAuthGuard>
  )
}
