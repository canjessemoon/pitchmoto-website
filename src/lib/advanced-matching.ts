import { Database } from '@/types/database'
import { calculateStartupMatchScore, MATCHING_CONFIG } from './matching'

// Enhanced type definitions
export type StartupWithProfile = Database['public']['Tables']['startups']['Row'] & {
  profiles?: Database['public']['Tables']['profiles']['Row']
  pitches?: Database['public']['Tables']['pitches']['Row'][]
}

export type InvestorThesis = Database['public']['Tables']['investor_theses']['Row']

// Advanced scoring configuration
export const ADVANCED_SCORING_CONFIG = {
  ...MATCHING_CONFIG,
  KEYWORD_WEIGHTS: {
    EXACT_MATCH: 1.0,
    PARTIAL_MATCH: 0.6,
    SEMANTIC_MATCH: 0.3
  },
  TRACTION_METRICS: {
    REVENUE_MULTIPLIER: 0.3,
    USER_GROWTH_MULTIPLIER: 0.25,
    FUNDING_PROGRESS_MULTIPLIER: 0.25,
    MARKET_PRESENCE_MULTIPLIER: 0.2
  },
  RECENCY_DECAY: {
    DAYS_FRESH: 30,
    DECAY_RATE: 0.95
  },
  DIVERSITY_BONUS: {
    INDUSTRY_DIVERSITY: 0.05,
    STAGE_DIVERSITY: 0.03,
    LOCATION_DIVERSITY: 0.02
  }
}

// Advanced keyword matching with semantic similarity
export function calculateKeywordScore(
  startupText: string,
  keywords: string[],
  excludeKeywords: string[]
): { score: number; matches: string[]; exclusions: string[] } {
  if (keywords.length === 0 && excludeKeywords.length === 0) {
    return { score: 80, matches: [], exclusions: [] }
  }

  const text = startupText.toLowerCase()
  const matches: string[] = []
  const exclusions: string[] = []
  let totalScore = 0

  // Check for excluded keywords first
  for (const excludeKeyword of excludeKeywords) {
    const keyword = excludeKeyword.toLowerCase()
    if (text.includes(keyword)) {
      exclusions.push(excludeKeyword)
      return { score: 0, matches, exclusions } // Immediate disqualification
    }
  }

  // Calculate positive keyword matches
  for (const keyword of keywords) {
    const keywordLower = keyword.toLowerCase()
    
    if (text.includes(keywordLower)) {
      matches.push(keyword)
      
      // Check for exact word match vs partial match
      const wordBoundaryRegex = new RegExp(`\\b${keywordLower}\\b`, 'gi')
      if (wordBoundaryRegex.test(text)) {
        totalScore += ADVANCED_SCORING_CONFIG.KEYWORD_WEIGHTS.EXACT_MATCH
      } else {
        totalScore += ADVANCED_SCORING_CONFIG.KEYWORD_WEIGHTS.PARTIAL_MATCH
      }
    } else {
      // Check for semantic similarity (simplified)
      const semanticMatches = getSemanticMatches(keywordLower, text)
      if (semanticMatches.length > 0) {
        matches.push(`${keyword} (similar: ${semanticMatches.join(', ')})`)
        totalScore += ADVANCED_SCORING_CONFIG.KEYWORD_WEIGHTS.SEMANTIC_MATCH
      }
    }
  }

  // Normalize score based on number of keywords
  const normalizedScore = keywords.length > 0 
    ? Math.min(100, (totalScore / keywords.length) * 100)
    : 80

  return { score: normalizedScore, matches, exclusions }
}

// Simplified semantic matching (in production, use proper NLP)
function getSemanticMatches(keyword: string, text: string): string[] {
  const semanticMap: Record<string, string[]> = {
    'ai': ['artificial intelligence', 'machine learning', 'ml', 'neural', 'automation'],
    'saas': ['software as a service', 'cloud software', 'subscription'],
    'fintech': ['financial technology', 'payments', 'banking', 'finance'],
    'healthtech': ['health technology', 'medical', 'healthcare', 'telemedicine'],
    'edtech': ['education technology', 'learning', 'training', 'academic'],
    'ecommerce': ['e-commerce', 'online store', 'marketplace', 'retail'],
    'blockchain': ['crypto', 'cryptocurrency', 'web3', 'defi', 'nft'],
    'iot': ['internet of things', 'connected devices', 'smart devices'],
    'cybersecurity': ['security', 'privacy', 'protection', 'cyber'],
    'analytics': ['data analysis', 'business intelligence', 'insights', 'metrics']
  }

  const synonyms = semanticMap[keyword] || []
  return synonyms.filter(synonym => text.includes(synonym))
}

// Enhanced traction scoring with multiple metrics
export function calculateAdvancedTractionScore(startup: StartupWithProfile): {
  score: number
  metrics: {
    funding_progress: number
    market_presence: number
    team_strength: number
    product_readiness: number
  }
  details: string[]
} {
  const metrics = {
    funding_progress: 0,
    market_presence: 0,
    team_strength: 0,
    product_readiness: 0
  }
  
  const details: string[] = []

  // Funding progress score
  const currentFunding = startup.current_funding || 0
  const fundingGoal = startup.funding_goal || 1
  const fundingRatio = currentFunding / fundingGoal

  if (fundingRatio > 0.8) {
    metrics.funding_progress = 100
    details.push(`Fully funded (${Math.round(fundingRatio * 100)}%)`)
  } else if (fundingRatio > 0.5) {
    metrics.funding_progress = 80 + (fundingRatio - 0.5) * 40
    details.push(`Strong funding progress (${Math.round(fundingRatio * 100)}%)`)
  } else if (fundingRatio > 0.2) {
    metrics.funding_progress = 60 + (fundingRatio - 0.2) * 67
    details.push(`Good funding traction (${Math.round(fundingRatio * 100)}%)`)
  } else if (fundingRatio > 0.05) {
    metrics.funding_progress = 40 + (fundingRatio - 0.05) * 133
    details.push(`Early funding (${Math.round(fundingRatio * 100)}%)`)
  } else if (currentFunding > 0) {
    metrics.funding_progress = 30
    details.push('Initial funding secured')
  } else {
    metrics.funding_progress = 20
  }

  // Market presence score
  let marketScore = 30 // Base score
  
  if (startup.website_url) {
    marketScore += 20
    details.push('Has website')
  }
  
  if (startup.logo_url) {
    marketScore += 10
    details.push('Professional branding')
  }

  // Check for pitch materials
  if (startup.pitch_deck_url) {
    marketScore += 15
    details.push('Pitch deck available')
  }

  // Social media/online presence (simplified check)
  if (startup.profiles?.linkedin_url) {
    marketScore += 10
    details.push('LinkedIn presence')
  }

  metrics.market_presence = Math.min(100, marketScore)

  // Team strength score
  let teamScore = 40 // Base score
  
  if (startup.profiles) {
    const founder = startup.profiles
    
    if (founder.full_name) teamScore += 10
    if (founder.bio && founder.bio.length > 100) {
      teamScore += 20
      details.push('Comprehensive founder bio')
    } else if (founder.bio && founder.bio.length > 50) {
      teamScore += 10
      details.push('Founder bio available')
    }
    
    if (founder.company && founder.company !== startup.name) {
      teamScore += 15
      details.push('Prior company experience')
    }
    
    if (founder.linkedin_url) {
      teamScore += 10
      details.push('Professional network')
    }
    
    if (founder.location) teamScore += 5
  }

  metrics.team_strength = Math.min(100, teamScore)

  // Product readiness score
  let productScore = 30 // Base score

  // Stage-based scoring
  const stageScores: Record<string, number> = {
    'Idea': 20,
    'MVP': 50,
    'Pre-seed': 60,
    'Seed': 70,
    'Series A': 85,
    'Series B': 90,
    'Series C+': 95,
    'Growth': 98,
    'IPO Ready': 100
  }

  productScore = stageScores[startup.stage] || 30

  // Additional product indicators
  if (startup.description && startup.description.length > 200) {
    productScore += 10
    details.push('Detailed product description')
  }

  if (startup.tagline && startup.tagline.length > 10) {
    productScore += 5
  }

  metrics.product_readiness = Math.min(100, productScore)

  // Calculate overall traction score
  const weights = ADVANCED_SCORING_CONFIG.TRACTION_METRICS
  const overallScore = 
    metrics.funding_progress * weights.FUNDING_PROGRESS_MULTIPLIER +
    metrics.market_presence * weights.MARKET_PRESENCE_MULTIPLIER +
    metrics.team_strength * weights.REVENUE_MULTIPLIER + // Using as team weight
    metrics.product_readiness * weights.USER_GROWTH_MULTIPLIER // Using as product weight

  return {
    score: Math.round(overallScore),
    metrics,
    details
  }
}

// Recency factor for matches (newer startups get slight boost)
export function calculateRecencyFactor(createdAt: string): number {
  const now = new Date()
  const created = new Date(createdAt)
  const daysSinceCreated = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
  
  if (daysSinceCreated <= ADVANCED_SCORING_CONFIG.RECENCY_DECAY.DAYS_FRESH) {
    return 1.0 // Full score for fresh startups
  }
  
  // Gradual decay after 30 days
  const decayFactor = Math.pow(
    ADVANCED_SCORING_CONFIG.RECENCY_DECAY.DECAY_RATE,
    daysSinceCreated - ADVANCED_SCORING_CONFIG.RECENCY_DECAY.DAYS_FRESH
  )
  
  return Math.max(0.8, decayFactor) // Minimum 80% score
}

// Portfolio diversity bonus calculation
export function calculateDiversityBonus(
  existingMatches: any[],
  newStartup: StartupWithProfile
): number {
  if (existingMatches.length === 0) return 0

  const existingIndustries = existingMatches.map(m => m.startups?.industry).filter(Boolean)
  const existingStages = existingMatches.map(m => m.startups?.stage).filter(Boolean)
  const existingLocations = existingMatches.map(m => m.startups?.profiles?.location).filter(Boolean)

  let diversityBonus = 0

  // Industry diversity bonus
  if (!existingIndustries.includes(newStartup.industry)) {
    diversityBonus += ADVANCED_SCORING_CONFIG.DIVERSITY_BONUS.INDUSTRY_DIVERSITY
  }

  // Stage diversity bonus
  if (!existingStages.includes(newStartup.stage)) {
    diversityBonus += ADVANCED_SCORING_CONFIG.DIVERSITY_BONUS.STAGE_DIVERSITY
  }

  // Location diversity bonus
  const newLocation = newStartup.profiles?.location
  if (newLocation && !existingLocations.includes(newLocation)) {
    diversityBonus += ADVANCED_SCORING_CONFIG.DIVERSITY_BONUS.LOCATION_DIVERSITY
  }

  return diversityBonus * 100 // Convert to percentage points
}

// Enhanced matching algorithm that combines all factors
export function calculateEnhancedMatchScore(
  startup: StartupWithProfile,
  thesis: InvestorThesis,
  existingMatches: any[] = []
): {
  overall_score: number
  industry_score: number
  stage_score: number
  funding_score: number
  location_score: number
  traction_score: number
  team_score: number
  keyword_score: number
  recency_factor: number
  diversity_bonus: number
  match_reason: string
  confidence_level: 'low' | 'medium' | 'high'
  detailed_breakdown: {
    base_scores: any
    traction_details: any
    keyword_details: any
    adjustments: any
  }
} {
  // Get base scores using original algorithm
  const baseMatch = calculateStartupMatchScore(startup, thesis)
  
  // Get enhanced traction scoring
  const tractionAnalysis = calculateAdvancedTractionScore(startup)
  
  // Calculate keyword scoring
  const startupText = `${startup.name} ${startup.tagline} ${startup.description}`.toLowerCase()
  const keywordAnalysis = calculateKeywordScore(
    startupText,
    thesis.keywords || [],
    thesis.exclude_keywords || []
  )
  
  // Calculate recency factor
  const recencyFactor = calculateRecencyFactor(startup.created_at)
  
  // Calculate diversity bonus
  const diversityBonus = calculateDiversityBonus(existingMatches, startup)
  
  // Enhanced scores
  const enhancedScores = {
    industry_score: baseMatch.industry_score,
    stage_score: baseMatch.stage_score,
    funding_score: baseMatch.funding_score,
    location_score: baseMatch.location_score,
    traction_score: tractionAnalysis.score, // Use enhanced traction score
    team_score: baseMatch.team_score,
    keyword_score: keywordAnalysis.score
  }
  
  // Apply keyword disqualification
  if (keywordAnalysis.exclusions.length > 0) {
    return {
      overall_score: 0,
      ...enhancedScores,
      keyword_score: 0,
      recency_factor: recencyFactor,
      diversity_bonus: 0,
      match_reason: `Excluded due to: ${keywordAnalysis.exclusions.join(', ')}`,
      confidence_level: 'low' as const,
      detailed_breakdown: {
        base_scores: baseMatch,
        traction_details: tractionAnalysis,
        keyword_details: keywordAnalysis,
        adjustments: { recency_factor: recencyFactor, diversity_bonus: diversityBonus }
      }
    }
  }
  
  // Calculate weighted base score
  const weightedScore = 
    enhancedScores.industry_score * thesis.industry_weight +
    enhancedScores.stage_score * thesis.stage_weight +
    enhancedScores.funding_score * thesis.funding_weight +
    enhancedScores.location_score * thesis.location_weight +
    enhancedScores.traction_score * thesis.traction_weight +
    enhancedScores.team_score * thesis.team_weight
  
  // Apply keyword bonus/penalty (10% weight for keywords if specified)
  const keywordWeight = thesis.keywords.length > 0 ? 0.1 : 0
  const adjustedScore = keywordWeight > 0 
    ? weightedScore * (1 - keywordWeight) + enhancedScores.keyword_score * keywordWeight
    : weightedScore
  
  // Apply recency factor (small impact)
  const recencyAdjustedScore = adjustedScore * (0.95 + 0.05 * recencyFactor)
  
  // Apply diversity bonus
  const finalScore = Math.min(100, recencyAdjustedScore + diversityBonus)
  
  // Enhanced confidence calculation
  let confidence_level: 'low' | 'medium' | 'high' = 'medium'
  const highQualityFactors = [
    enhancedScores.industry_score >= 90,
    enhancedScores.stage_score >= 90,
    enhancedScores.traction_score >= 70,
    keywordAnalysis.matches.length >= 2,
    recencyFactor > 0.95
  ].filter(Boolean).length
  
  if (finalScore >= 85 && highQualityFactors >= 3) {
    confidence_level = 'high'
  } else if (finalScore < 45 || keywordAnalysis.matches.length === 0) {
    confidence_level = 'low'
  }
  
  // Enhanced match reason
  const reasons: string[] = []
  if (enhancedScores.industry_score >= 90) reasons.push(`Perfect industry match: ${startup.industry}`)
  if (enhancedScores.stage_score >= 90) reasons.push(`Stage alignment: ${startup.stage}`)
  if (enhancedScores.funding_score >= 80) reasons.push(`Funding fit`)
  if (keywordAnalysis.matches.length > 0) reasons.push(`Keyword matches: ${keywordAnalysis.matches.slice(0, 2).join(', ')}`)
  if (tractionAnalysis.details.length > 0) reasons.push(tractionAnalysis.details.slice(0, 2).join(', '))
  if (diversityBonus > 0) reasons.push('Portfolio diversity benefit')
  
  const match_reason = reasons.length > 0 
    ? reasons.slice(0, 3).join(' • ')
    : 'General compatibility based on investment criteria'
  
  return {
    overall_score: Math.round(finalScore),
    industry_score: Math.round(enhancedScores.industry_score),
    stage_score: Math.round(enhancedScores.stage_score),
    funding_score: Math.round(enhancedScores.funding_score),
    location_score: Math.round(enhancedScores.location_score),
    traction_score: Math.round(enhancedScores.traction_score),
    team_score: Math.round(enhancedScores.team_score),
    keyword_score: Math.round(enhancedScores.keyword_score),
    recency_factor: Math.round(recencyFactor * 100) / 100,
    diversity_bonus: Math.round(diversityBonus),
    match_reason,
    confidence_level,
    detailed_breakdown: {
      base_scores: baseMatch,
      traction_details: tractionAnalysis,
      keyword_details: keywordAnalysis,
      adjustments: { recency_factor: recencyFactor, diversity_bonus: diversityBonus }
    }
  }
}

// Match analytics and insights
export function generateMatchAnalytics(matches: any[]): {
  summary: {
    total_matches: number
    average_score: number
    high_confidence_count: number
    industry_distribution: Record<string, number>
    stage_distribution: Record<string, number>
    score_distribution: Record<string, number>
  }
  insights: string[]
  recommendations: string[]
} {
  if (matches.length === 0) {
    return {
      summary: {
        total_matches: 0,
        average_score: 0,
        high_confidence_count: 0,
        industry_distribution: {},
        stage_distribution: {},
        score_distribution: {}
      },
      insights: ['No matches found. Consider broadening your investment criteria.'],
      recommendations: [
        'Review your industry preferences',
        'Adjust funding range',
        'Consider earlier stage startups'
      ]
    }
  }

  const summary = {
    total_matches: matches.length,
    average_score: matches.reduce((sum, m) => sum + m.overall_score, 0) / matches.length,
    high_confidence_count: matches.filter(m => m.confidence_level === 'high').length,
    industry_distribution: {} as Record<string, number>,
    stage_distribution: {} as Record<string, number>,
    score_distribution: {
      'Excellent (80+)': 0,
      'Good (60-79)': 0,
      'Fair (40-59)': 0,
      'Poor (<40)': 0
    }
  }

  // Calculate distributions
  matches.forEach(match => {
    // Industry distribution
    const industry = match.startups?.industry || 'Unknown'
    summary.industry_distribution[industry] = (summary.industry_distribution[industry] || 0) + 1

    // Stage distribution
    const stage = match.startups?.stage || 'Unknown'
    summary.stage_distribution[stage] = (summary.stage_distribution[stage] || 0) + 1

    // Score distribution
    if (match.overall_score >= 80) summary.score_distribution['Excellent (80+)']++
    else if (match.overall_score >= 60) summary.score_distribution['Good (60-79)']++
    else if (match.overall_score >= 40) summary.score_distribution['Fair (40-59)']++
    else summary.score_distribution['Poor (<40)']++
  })

  // Generate insights
  const insights: string[] = []
  const recommendations: string[] = []

  const topIndustries = Object.entries(summary.industry_distribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([industry]) => industry)

  insights.push(`Found ${summary.total_matches} matches with average score of ${summary.average_score.toFixed(1)}`)
  insights.push(`${summary.high_confidence_count} high-confidence matches (${Math.round(summary.high_confidence_count / summary.total_matches * 100)}%)`)
  
  if (topIndustries.length > 0) {
    insights.push(`Top matching industries: ${topIndustries.join(', ')}`)
  }

  // Generate recommendations
  if (summary.average_score < 50) {
    recommendations.push('Consider adjusting your investment criteria for better matches')
  }

  if (summary.high_confidence_count < summary.total_matches * 0.2) {
    recommendations.push('Refine your thesis weights to improve match quality')
  }

  const excellentMatches = summary.score_distribution['Excellent (80+)']
  if (excellentMatches < 5 && summary.total_matches > 20) {
    recommendations.push('Focus on the top 10-20% of matches for best ROI')
  }

  return { summary, insights, recommendations }
}
