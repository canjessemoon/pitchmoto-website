'use client'

import { useState, useMemo } from 'react'
import { TrendingUp, TrendingDown, BarChart3, PieChart, Target, Users, DollarSign, Clock } from 'lucide-react'

interface MatchingAnalytics {
  total_matches: number
  avg_match_score: number
  score_distribution: {
    high: number // 80-100%
    medium: number // 60-79%
    low: number // <60%
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

interface AnalyticsVisualizationProps {
  analytics: MatchingAnalytics
  isLoading?: boolean
  onRefresh: () => void
}

export default function AnalyticsVisualization({
  analytics,
  isLoading = false,
  onRefresh
}: AnalyticsVisualizationProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'industry' | 'performance' | 'trends'>('overview')

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'industry', name: 'Industry Analysis', icon: PieChart },
    { id: 'performance', name: 'Performance', icon: Target },
    { id: 'trends', name: 'Trends', icon: TrendingUp }
  ]

  // Calculate trend direction for key metrics
  const getScoreTrend = () => {
    if (analytics.monthly_trends.length < 2) return null
    const recent = analytics.monthly_trends[analytics.monthly_trends.length - 1]
    const previous = analytics.monthly_trends[analytics.monthly_trends.length - 2]
    return recent.avg_score > previous.avg_score ? 'up' : 'down'
  }

  const getMatchesTrend = () => {
    if (analytics.monthly_trends.length < 2) return null
    const recent = analytics.monthly_trends[analytics.monthly_trends.length - 1]
    const previous = analytics.monthly_trends[analytics.monthly_trends.length - 2]
    return recent.matches > previous.matches ? 'up' : 'down'
  }

  // Format percentage
  const formatPercentage = (value: number) => `${Math.round(value * 100)}%`

  // Get color for score
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Get background color for score
  const getScoreBgColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-100'
    if (score >= 0.6) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-[#405B53] text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Matching Analytics</h2>
            <p className="text-[#8C948B] mt-1">
              Insights into your startup matching performance
            </p>
          </div>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="px-4 py-2 bg-[#E64E1B] text-white rounded-md hover:bg-[#d63d0f] disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#E64E1B] text-[#E64E1B]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </nav>
      </div>

      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Total Matches</p>
                    <p className="text-2xl font-bold text-blue-900">{analytics.total_matches}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                {getMatchesTrend() && (
                  <div className={`flex items-center mt-2 text-sm ${
                    getMatchesTrend() === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {getMatchesTrend() === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                    <span>vs last month</span>
                  </div>
                )}
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Avg Match Score</p>
                    <p className="text-2xl font-bold text-green-900">
                      {formatPercentage(analytics.avg_match_score)}
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-green-600" />
                </div>
                {getScoreTrend() && (
                  <div className={`flex items-center mt-2 text-sm ${
                    getScoreTrend() === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {getScoreTrend() === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                    <span>vs last month</span>
                  </div>
                )}
              </div>

              <div className="bg-yellow-50 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-600 text-sm font-medium">Contact Rate</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {formatPercentage(analytics.interaction_stats.conversion_rates.view_to_contact)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-yellow-600" />
                </div>
                <div className="text-sm text-yellow-700 mt-2">
                  {analytics.interaction_stats.total_contacts} contacts made
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">Thesis Effectiveness</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {formatPercentage(analytics.recommendation_performance.thesis_effectiveness)}
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-sm text-purple-700 mt-2">
                  Recommendation accuracy
                </div>
              </div>
            </div>

            {/* Score Distribution */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Match Score Distribution</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">High Quality (80-100%)</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-40 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(analytics.score_distribution.high / analytics.total_matches) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12">{analytics.score_distribution.high}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Medium Quality (60-79%)</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-40 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full" 
                        style={{ width: `${(analytics.score_distribution.medium / analytics.total_matches) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12">{analytics.score_distribution.medium}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Low Quality (&lt;60%)</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-40 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${(analytics.score_distribution.low / analytics.total_matches) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12">{analytics.score_distribution.low}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interaction Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-blue-900 mb-2">Views</h4>
                <p className="text-3xl font-bold text-blue-600">{analytics.interaction_stats.total_views}</p>
                <p className="text-sm text-blue-700 mt-2">Total profile views</p>
              </div>
              <div className="bg-green-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-green-900 mb-2">Bookmarks</h4>
                <p className="text-3xl font-bold text-green-600">{analytics.interaction_stats.total_bookmarks}</p>
                <p className="text-sm text-green-700 mt-2">
                  {formatPercentage(analytics.interaction_stats.conversion_rates.view_to_bookmark)} conversion rate
                </p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-yellow-900 mb-2">Contacts</h4>
                <p className="text-3xl font-bold text-yellow-600">{analytics.interaction_stats.total_contacts}</p>
                <p className="text-sm text-yellow-700 mt-2">
                  {formatPercentage(analytics.interaction_stats.conversion_rates.bookmark_to_contact)} from bookmarks
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Industry Analysis Tab */}
        {activeTab === 'industry' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Industry Breakdown</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Industry Distribution */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Match Count by Industry</h4>
                <div className="space-y-3">
                  {Object.entries(analytics.industry_breakdown)
                    .sort(([,a], [,b]) => b.count - a.count)
                    .map(([industry, data]) => (
                      <div key={industry} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{industry}</span>
                        <div className="flex items-center space-x-3">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-[#405B53] h-2 rounded-full" 
                              style={{ 
                                width: `${(data.count / Math.max(...Object.values(analytics.industry_breakdown).map(d => d.count))) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-8">{data.count}</span>
                        </div>
                      </div>
                  ))}
                </div>
              </div>

              {/* Average Scores by Industry */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Average Match Score by Industry</h4>
                <div className="space-y-3">
                  {Object.entries(analytics.industry_breakdown)
                    .sort(([,a], [,b]) => b.avg_score - a.avg_score)
                    .map(([industry, data]) => (
                      <div key={industry} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{industry}</span>
                        <div className="flex items-center space-x-3">
                          <div className={`px-2 py-1 rounded text-xs font-medium ${getScoreBgColor(data.avg_score)} ${getScoreColor(data.avg_score)}`}>
                            {formatPercentage(data.avg_score)}
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stage Analysis */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">Stage Distribution</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(analytics.stage_breakdown).map(([stage, data]) => (
                  <div key={stage} className="text-center">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-2xl font-bold text-[#405B53]">{data.count}</p>
                      <p className="text-sm text-gray-600 mt-1">{stage}</p>
                      <p className={`text-xs mt-2 ${getScoreColor(data.avg_score)}`}>
                        {formatPercentage(data.avg_score)} avg
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Recommendation Performance</h3>

            {/* Top Performance Factors */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">Top Matching Factors</h4>
              <div className="space-y-4">
                {analytics.recommendation_performance.top_factors.map((factor, index) => (
                  <div key={factor.factor} className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-[#E64E1B] rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-medium text-gray-900">{factor.factor}</h5>
                        <span className="text-sm font-medium text-[#405B53]">
                          {formatPercentage(factor.impact)} impact
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{factor.description}</p>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-[#E64E1B] h-2 rounded-full" 
                          style={{ width: `${factor.impact * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Funding Distribution */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">Funding Range Distribution</h4>
              <div className="space-y-3">
                {analytics.funding_distribution.map((range) => (
                  <div key={range.range} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{range.range}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-[#405B53] h-2 rounded-full" 
                          style={{ width: `${range.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-12">{range.count}</span>
                      <span className="text-xs text-gray-500 w-12">{range.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Trends</h3>

            {/* Monthly Performance Chart */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">Match Volume & Quality Over Time</h4>
              <div className="space-y-4">
                {analytics.monthly_trends.map((trend, index) => (
                  <div key={trend.month} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 text-sm text-gray-600">{trend.month}</div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium">{trend.matches} matches</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className={`text-sm font-medium ${getScoreColor(trend.avg_score)}`}>
                          {formatPercentage(trend.avg_score)}
                        </div>
                        <div className="text-xs text-gray-500">avg score</div>
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-[#E64E1B] h-2 rounded-full" 
                          style={{ 
                            width: `${(trend.matches / Math.max(...analytics.monthly_trends.map(t => t.matches))) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Insights */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-medium text-blue-900 mb-2">📊 Insights & Recommendations</h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Your thesis effectiveness is {formatPercentage(analytics.recommendation_performance.thesis_effectiveness)} - consider refining weights for better matches</li>
                <li>• {formatPercentage(analytics.interaction_stats.conversion_rates.view_to_contact)} of viewed startups receive contact - focus on higher quality matches</li>
                <li>• Top performing industry: {Object.entries(analytics.industry_breakdown).sort(([,a], [,b]) => b.avg_score - a.avg_score)[0][0]}</li>
                {analytics.monthly_trends.length >= 2 && (
                  <li>• {getMatchesTrend() === 'up' ? 'Increasing' : 'Decreasing'} match volume trend - adjust your criteria to maintain quality</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
