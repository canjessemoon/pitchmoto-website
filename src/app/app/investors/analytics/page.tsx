'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { AnalyticsVisualization } from '@/components/matching'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, Share, RefreshCw } from 'lucide-react'

interface Analytics {
  total_matches: number
  avg_match_score: number
  score_distribution: {
    high: number
    medium: number
    low: number
  }
  industry_breakdown: {
    [industry: string]: {
      count: number
      avg_score: number
    }
  }
  stage_breakdown: {
    [stage: string]: {
      count: number
      avg_score: number
    }
  }
  monthly_trends: {
    month: string
    matches: number
    avg_score: number
  }[]
  interaction_stats: {
    total_views: number
    total_bookmarks: number
    total_contacts: number
    conversion_rates: {
      view_to_bookmark: number
      bookmark_to_contact: number
      view_to_contact: number
    }
  }
  funding_distribution: {
    range: string
    count: number
    percentage: number
  }[]
  recommendation_performance: {
    top_factors: {
      factor: string
      impact: number
      description: string
    }[]
    thesis_effectiveness: number
  }
}

export default function InvestorAnalyticsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  const checkAuthAndLoadData = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        router.push('/auth/signin')
        return
      }

      setUser(user)

      // Check user type
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('user_type')
        .eq('user_id', user.id)
        .single()

      if (profileError || !profile || profile.user_type !== 'investor') {
        router.push('/app')
        return
      }

      await loadAnalytics()
    } catch (err) {
      console.error('Auth check error:', err)
      setError('Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/matching/analytics')
      const data = await response.json()
      
      if (response.ok) {
        setAnalytics(data.analytics)
        setError(null)
      } else if (response.status === 404) {
        // No analytics data yet
        setAnalytics(null)
        setError(null)
      } else {
        setError(data.error || 'Failed to load analytics')
      }
    } catch (err) {
      console.error('Analytics loading error:', err)
      setError('Failed to load analytics data')
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadAnalytics()
    setIsRefreshing(false)
  }

  const handleExport = async () => {
    if (!analytics) return

    try {
      // Create a downloadable analytics report
      const reportData = {
        generated_at: new Date().toISOString(),
        user_id: user?.id,
        analytics: analytics
      }

      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: 'application/json'
      })

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pitchmoto-analytics-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export error:', err)
    }
  }

  const handleShare = async () => {
    if (!analytics) return

    try {
      const shareData = {
        title: 'PitchMoto Investment Analytics',
        text: `I've analyzed ${analytics.total_matches} startup matches with an average score of ${Math.round(analytics.avg_match_score * 100)}% on PitchMoto`,
        url: window.location.href
      }

      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`)
        alert('Analytics summary copied to clipboard!')
      }
    } catch (err) {
      console.error('Share error:', err)
    }
  }

  const handleBackToDashboard = () => {
    router.push('/app/investors/dashboard')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E64E1B] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-3">
            <Button onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" onClick={handleBackToDashboard}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              onClick={handleBackToDashboard}
              className="mr-4 flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600 mt-1">Investment performance insights</p>
            </div>
          </div>

          {/* No Data State */}
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-gray-400 mb-6">
              📊
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">No Analytics Data Yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start interacting with startup matches to see detailed analytics about your investment patterns and performance.
            </p>
            <div className="space-x-3">
              <Button onClick={handleBackToDashboard}>
                View Matches
              </Button>
              <Button variant="outline" onClick={() => router.push('/app/investors/thesis')}>
                Update Thesis
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
              onClick={handleBackToDashboard}
              className="mr-4 flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600 mt-1">
                Investment performance insights and trends
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={handleShare}
              className="flex items-center space-x-2"
            >
              <Share className="w-4 h-4" />
              <span>Share</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleExport}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </Button>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </Button>
          </div>
        </div>

        {/* Analytics Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Matches</div>
            <div className="text-2xl font-bold text-gray-900">{analytics.total_matches}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Avg Match Score</div>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(analytics.avg_match_score * 100)}%
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Contacts Made</div>
            <div className="text-2xl font-bold text-blue-600">
              {analytics.interaction_stats.total_contacts}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Contact Rate</div>
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(analytics.interaction_stats.conversion_rates.view_to_contact * 100)}%
            </div>
          </div>
        </div>

        {/* Main Analytics Component */}
        <AnalyticsVisualization
          analytics={analytics}
          onRefresh={handleRefresh}
          isLoading={isRefreshing}
        />

        {/* Performance Tips */}
        <div className="mt-8">
          <div className="bg-gradient-to-r from-[#405B53] to-[#8C948B] text-white rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">🚀 Performance Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Thesis Effectiveness</h4>
                <p className="opacity-90">
                  Your thesis is {Math.round(analytics.recommendation_performance.thesis_effectiveness * 100)}% effective.
                  {analytics.recommendation_performance.thesis_effectiveness < 0.7 && 
                    " Consider refining your criteria for better matches."
                  }
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Top Performing Factor</h4>
                <p className="opacity-90">
                  {analytics.recommendation_performance.top_factors[0]?.factor || 'Industry match'} is your strongest 
                  matching factor with {Math.round((analytics.recommendation_performance.top_factors[0]?.impact || 0) * 100)}% impact.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Engagement Rate</h4>
                <p className="opacity-90">
                  You contact {Math.round(analytics.interaction_stats.conversion_rates.view_to_contact * 100)}% of viewed startups.
                  {analytics.interaction_stats.conversion_rates.view_to_contact < 0.1 && 
                    " Consider adjusting your match score threshold."
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
