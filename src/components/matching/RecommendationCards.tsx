'use client'

import { useState } from 'react'
import { Star, TrendingUp, DollarSign, MapPin, Users, Eye, X, ChevronRight } from 'lucide-react'

interface RecommendationCard {
  id: string
  type: 'new_match' | 'thesis_update' | 'industry_trend' | 'portfolio_insight'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  created_at: string
  metadata?: {
    startup_id?: string
    startup_name?: string
    match_score?: number
    industry?: string
    funding_amount?: number
    trend_data?: any
  }
  action_url?: string
  dismissible: boolean
}

interface RecommendationCardsProps {
  recommendations: RecommendationCard[]
  onDismiss: (recommendationId: string) => void
  onAction: (recommendation: RecommendationCard) => void
  className?: string
}

export default function RecommendationCards({
  recommendations,
  onDismiss,
  onAction,
  className = ''
}: RecommendationCardsProps) {
  const [dismissedCards, setDismissedCards] = useState<Set<string>>(new Set())

  const handleDismiss = (recommendationId: string) => {
    setDismissedCards(prev => new Set([...prev, recommendationId]))
    onDismiss(recommendationId)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_match':
        return Star
      case 'thesis_update':
        return TrendingUp
      case 'industry_trend':
        return Users
      case 'portfolio_insight':
        return Eye
      default:
        return Star
    }
  }

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50'
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50'
      case 'low':
        return 'border-l-blue-500 bg-blue-50'
      default:
        return 'border-l-gray-500 bg-gray-50'
    }
  }

  const getPriorityTextColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-700'
      case 'medium':
        return 'text-yellow-700'
      case 'low':
        return 'text-blue-700'
      default:
        return 'text-gray-700'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'new_match':
        return 'New Match'
      case 'thesis_update':
        return 'Thesis Suggestion'
      case 'industry_trend':
        return 'Industry Trend'
      case 'portfolio_insight':
        return 'Portfolio Insight'
      default:
        return 'Recommendation'
    }
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value.toLocaleString()}`
  }

  const visibleRecommendations = recommendations.filter(rec => !dismissedCards.has(rec.id))

  if (visibleRecommendations.length === 0) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-8 text-center ${className}`}>
        <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
        <p className="text-gray-500">
          No new recommendations at the moment. Check back later for personalized insights.
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Recommendations</h2>
        <span className="text-sm text-gray-500">
          {visibleRecommendations.length} suggestion{visibleRecommendations.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-3">
        {visibleRecommendations.map((recommendation) => {
          const Icon = getIcon(recommendation.type)
          
          return (
            <div
              key={recommendation.id}
              className={`border-l-4 rounded-lg p-4 transition-all duration-200 hover:shadow-md ${getPriorityStyles(recommendation.priority)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={`p-2 rounded-lg ${
                    recommendation.priority === 'high' ? 'bg-red-100' :
                    recommendation.priority === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      recommendation.priority === 'high' ? 'text-red-600' :
                      recommendation.priority === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                    }`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        recommendation.priority === 'high' ? 'bg-red-100 text-red-700' :
                        recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {getTypeLabel(recommendation.type)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(recommendation.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h3 className={`font-semibold mb-2 ${getPriorityTextColor(recommendation.priority)}`}>
                      {recommendation.title}
                    </h3>
                    
                    <p className="text-sm text-gray-700 mb-3">
                      {recommendation.description}
                    </p>

                    {/* Metadata Display */}
                    {recommendation.metadata && (
                      <div className="flex flex-wrap gap-4 text-xs text-gray-600 mb-3">
                        {recommendation.metadata.startup_name && (
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>{recommendation.metadata.startup_name}</span>
                          </div>
                        )}
                        {recommendation.metadata.match_score && (
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3" />
                            <span>{Math.round(recommendation.metadata.match_score * 100)}% match</span>
                          </div>
                        )}
                        {recommendation.metadata.industry && (
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>{recommendation.metadata.industry}</span>
                          </div>
                        )}
                        {recommendation.metadata.funding_amount && (
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-3 h-3" />
                            <span>{formatCurrency(recommendation.metadata.funding_amount)}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      onClick={() => onAction(recommendation)}
                      className="inline-flex items-center space-x-2 text-sm font-medium text-[#E64E1B] hover:text-[#d63d0f] transition-colors"
                    >
                      <span>
                        {recommendation.type === 'new_match' ? 'View Match' :
                         recommendation.type === 'thesis_update' ? 'Update Thesis' :
                         recommendation.type === 'industry_trend' ? 'Learn More' :
                         'View Details'}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Dismiss Button */}
                {recommendation.dismissible && (
                  <button
                    onClick={() => handleDismiss(recommendation.id)}
                    className="ml-4 p-1 text-gray-400 hover:text-gray-600 hover:bg-white rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Show All Button (if there are many recommendations) */}
      {recommendations.length > 5 && visibleRecommendations.length === 5 && (
        <button className="w-full py-3 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          Show {recommendations.length - 5} More Recommendations
        </button>
      )}
    </div>
  )
}

// Example usage component showing different recommendation types
export function RecommendationExamples() {
  const sampleRecommendations: RecommendationCard[] = [
    {
      id: '1',
      type: 'new_match',
      title: 'High-Quality Match Found',
      description: 'TechFlow AI matches 94% of your investment criteria with strong traction metrics and experienced team.',
      priority: 'high',
      created_at: new Date().toISOString(),
      metadata: {
        startup_id: 'startup_123',
        startup_name: 'TechFlow AI',
        match_score: 0.94,
        industry: 'Artificial Intelligence',
        funding_amount: 2500000
      },
      dismissible: true
    },
    {
      id: '2',
      type: 'thesis_update',
      title: 'Consider Adjusting Industry Weights',
      description: 'Your top-performing matches are 60% fintech startups, but your thesis weights healthcare higher.',
      priority: 'medium',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      metadata: {
        industry: 'Fintech'
      },
      dismissible: true
    },
    {
      id: '3',
      type: 'industry_trend',
      title: 'AI Startup Funding Surge',
      description: 'AI startups in your portfolio range saw 40% increase in funding this quarter.',
      priority: 'low',
      created_at: new Date(Date.now() - 172800000).toISOString(),
      metadata: {
        industry: 'Artificial Intelligence',
        trend_data: { growth: 0.4 }
      },
      dismissible: true
    },
    {
      id: '4',
      type: 'portfolio_insight',
      title: 'Engagement Pattern Analysis',
      description: 'You contact 85% of startups with traction scores above 0.8. Consider lowering your threshold.',
      priority: 'medium',
      created_at: new Date(Date.now() - 259200000).toISOString(),
      dismissible: true
    }
  ]

  const handleDismiss = (id: string) => {
    console.log('Dismissed recommendation:', id)
  }

  const handleAction = (recommendation: RecommendationCard) => {
    console.log('Action clicked for:', recommendation)
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <RecommendationCards
        recommendations={sampleRecommendations}
        onDismiss={handleDismiss}
        onAction={handleAction}
      />
    </div>
  )
}
