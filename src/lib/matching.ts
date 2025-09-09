import { Database } from '@/types/database'

// Type definitions for better type safety
export type InvestorThesis = Database['public']['Tables']['investor_theses']['Row']
export type StartupMatch = Database['public']['Tables']['startup_matches']['Row']
export type MatchInteraction = Database['public']['Tables']['match_interactions']['Row']
export type Startup = Database['public']['Tables']['startups']['Row']

// Matching configuration constants
export const MATCHING_CONFIG = {
  MIN_SCORE_THRESHOLD: 10,
  DEFAULT_WEIGHTS: {
    industry: 0.25,
    stage: 0.20,
    funding: 0.15,
    location: 0.10,
    traction: 0.20,
    team: 0.10
  },
  CONFIDENCE_THRESHOLDS: {
    HIGH: 80,
    MEDIUM: 50,
    LOW: 0
  },
  INDUSTRIES: [
    'Technology',
    'Healthcare',
    'Finance',
    'E-commerce',
    'Education',
    'Real Estate',
    'Food & Beverage',
    'Transportation',
    'Energy',
    'Entertainment',
    'Agriculture',
    'Manufacturing',
    'Other'
  ],
  STAGES: [
    'Idea',
    'MVP',
    'Pre-seed',
    'Seed',
    'Series A',
    'Series B',
    'Series C+',
    'Growth',
    'IPO Ready'
  ],
  INTERACTION_TYPES: [
    'view',
    'like', 
    'pass',
    'save',
    'contact',
    'note'
  ] as const,
  MATCH_STATUSES: [
    'pending',
    'viewed',
    'interested',
    'not_interested',
    'contacted'
  ] as const
}

// Enhanced scoring algorithm with better logic
export function calculateStartupMatchScore(
  startup: any,
  thesis: InvestorThesis
): {
  overall_score: number
  industry_score: number
  stage_score: number
  funding_score: number
  location_score: number
  traction_score: number
  team_score: number
  match_reason: string
  confidence_level: 'low' | 'medium' | 'high'
} {
  const scores = {
    industry_score: 0,
    stage_score: 0,
    funding_score: 0,
    location_score: 0,
    traction_score: 0,
    team_score: 0
  }

  const reasons: string[] = []

  // Industry scoring - exact match or no preference
  if (thesis.preferred_industries.length === 0) {
    scores.industry_score = 80 // Neutral score for no preference
  } else if (thesis.preferred_industries.includes(startup.industry)) {
    scores.industry_score = 100
    reasons.push(`Perfect industry match: ${startup.industry}`)
  } else {
    scores.industry_score = 0
    reasons.push(`Industry mismatch`)
  }

  // Stage scoring - exact match or no preference
  if (thesis.preferred_stages.length === 0) {
    scores.stage_score = 80 // Neutral score for no preference
  } else if (thesis.preferred_stages.includes(startup.stage)) {
    scores.stage_score = 100
    reasons.push(`Perfect stage match: ${startup.stage}`)
  } else {
    // Partial scoring for adjacent stages
    const stageIndex = MATCHING_CONFIG.STAGES.indexOf(startup.stage)
    const preferredIndices = thesis.preferred_stages.map(stage => 
      MATCHING_CONFIG.STAGES.indexOf(stage)
    )
    
    const minDistance = Math.min(...preferredIndices.map(idx => 
      Math.abs(idx - stageIndex)
    ))
    
    if (minDistance === 1) {
      scores.stage_score = 60 // Adjacent stage
      reasons.push(`Close stage match`)
    } else if (minDistance === 2) {
      scores.stage_score = 30 // Two stages away
    } else {
      scores.stage_score = 0
    }
  }

  // Funding scoring - range-based with partial credit
  const startupFunding = startup.funding_goal || 0
  const minAsk = thesis.min_funding_ask || 0
  const maxAsk = thesis.max_funding_ask || 10000000

  if (startupFunding >= minAsk && startupFunding <= maxAsk) {
    scores.funding_score = 100
    reasons.push(`Funding in target range: $${(startupFunding / 1000000).toFixed(1)}M`)
  } else if (startupFunding < minAsk) {
    // Below minimum - scale based on how close
    const ratio = startupFunding / minAsk
    scores.funding_score = Math.max(0, ratio * 60)
    if (ratio > 0.5) reasons.push(`Funding slightly below target`)
  } else {
    // Above maximum - scale based on how much over
    const ratio = maxAsk / startupFunding
    scores.funding_score = Math.max(0, ratio * 60)
    if (ratio > 0.5) reasons.push(`Funding slightly above target`)
  }

  // Location scoring - simplified string matching
  if (thesis.preferred_locations.length === 0) {
    scores.location_score = 90 // Neutral score for no preference
  } else {
    const startupLocation = startup.location || 
      startup.profiles?.location || 
      ''
    
    const locationMatch = thesis.preferred_locations.some((loc: string) => 
      startupLocation.toLowerCase().includes(loc.toLowerCase()) ||
      loc.toLowerCase().includes(startupLocation.toLowerCase())
    )
    
    if (locationMatch) {
      scores.location_score = 100
      reasons.push(`Location match`)
    } else {
      scores.location_score = 40 // Partial score for location flexibility
    }
  }

  // Traction scoring - based on funding progress and metrics
  const currentFunding = startup.current_funding || 0
  const fundingGoal = startup.funding_goal || 1
  const tractionRatio = currentFunding / fundingGoal

  let tractionScore = 40 // Base score
  
  if (tractionRatio > 0.5) {
    tractionScore = 100
    reasons.push(`Strong traction: ${Math.round(tractionRatio * 100)}% funded`)
  } else if (tractionRatio > 0.2) {
    tractionScore = 80
    reasons.push(`Good traction`)
  } else if (tractionRatio > 0.05) {
    tractionScore = 60
    reasons.push(`Early traction`)
  } else if (currentFunding > 0) {
    tractionScore = 50
  }

  // Additional traction indicators
  if (startup.website_url) tractionScore += 10
  if (startup.pitch_deck_url) tractionScore += 10
  
  scores.traction_score = Math.min(100, tractionScore)

  // Team scoring - based on profile completeness and background
  let teamScore = 50 // Base score

  if (startup.profiles) {
    const founder = startup.profiles
    if (founder.full_name) teamScore += 10
    if (founder.bio && founder.bio.length > 50) teamScore += 15
    if (founder.company) teamScore += 10
    if (founder.linkedin_url) teamScore += 10
    if (founder.location) teamScore += 5
  }

  scores.team_score = Math.min(100, teamScore)

  // Calculate weighted overall score
  const weights = {
    industry_weight: thesis.industry_weight,
    stage_weight: thesis.stage_weight,
    funding_weight: thesis.funding_weight,
    location_weight: thesis.location_weight,
    traction_weight: thesis.traction_weight,
    team_weight: thesis.team_weight
  }

  const overall_score = 
    scores.industry_score * weights.industry_weight +
    scores.stage_score * weights.stage_weight +
    scores.funding_score * weights.funding_weight +
    scores.location_score * weights.location_weight +
    scores.traction_score * weights.traction_weight +
    scores.team_score * weights.team_weight

  // Determine confidence level
  let confidence_level: 'low' | 'medium' | 'high' = 'medium'
  if (overall_score >= MATCHING_CONFIG.CONFIDENCE_THRESHOLDS.HIGH) {
    confidence_level = 'high'
  } else if (overall_score < MATCHING_CONFIG.CONFIDENCE_THRESHOLDS.MEDIUM) {
    confidence_level = 'low'
  }

  // Generate match reason
  const match_reason = reasons.length > 0 
    ? reasons.slice(0, 3).join(', ') // Limit to top 3 reasons
    : 'General compatibility based on investment criteria'

  return {
    overall_score: Math.round(overall_score),
    industry_score: Math.round(scores.industry_score),
    stage_score: Math.round(scores.stage_score),
    funding_score: Math.round(scores.funding_score),
    location_score: Math.round(scores.location_score),
    traction_score: Math.round(scores.traction_score),
    team_score: Math.round(scores.team_score),
    match_reason,
    confidence_level
  }
}

// Utility function to validate thesis weights
export function validateThesisWeights(weights: {
  industry_weight: number
  stage_weight: number
  funding_weight: number
  location_weight: number
  traction_weight: number
  team_weight: number
}): { valid: boolean; error?: string } {
  const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0)
  
  if (Math.abs(total - 1.0) > 0.01) {
    return {
      valid: false,
      error: `Weights must sum to 1.0, currently sum to ${total.toFixed(2)}`
    }
  }

  for (const [key, weight] of Object.entries(weights)) {
    if (weight < 0 || weight > 1) {
      return {
        valid: false,
        error: `${key} must be between 0 and 1, got ${weight}`
      }
    }
  }

  return { valid: true }
}

// Utility function to format funding amounts
export function formatFunding(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`
  } else {
    return `$${amount.toLocaleString()}`
  }
}

// Utility function to get match status color/badge
export function getMatchStatusInfo(status: string): {
  color: string
  label: string
  description: string
} {
  switch (status) {
    case 'pending':
      return {
        color: 'gray',
        label: 'New',
        description: 'New match, not yet viewed'
      }
    case 'viewed':
      return {
        color: 'blue',
        label: 'Viewed',
        description: 'Match has been viewed'
      }
    case 'interested':
      return {
        color: 'green',
        label: 'Interested',
        description: 'Marked as interested'
      }
    case 'not_interested':
      return {
        color: 'red',
        label: 'Passed',
        description: 'Not interested in this match'
      }
    case 'contacted':
      return {
        color: 'purple',
        label: 'Contacted',
        description: 'Founder has been contacted'
      }
    default:
      return {
        color: 'gray',
        label: 'Unknown',
        description: 'Unknown status'
      }
  }
}

// Utility function to get confidence level color
export function getConfidenceColor(level: string): string {
  switch (level) {
    case 'high':
      return 'green'
    case 'medium':
      return 'yellow'
    case 'low':
      return 'red'
    default:
      return 'gray'
  }
}
