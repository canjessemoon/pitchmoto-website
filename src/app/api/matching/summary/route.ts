import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startupId = searchParams.get('startupId')

    console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing')
    console.log('SUPABASE_PUBLISHABLE_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing')

    if (!startupId) {
      return NextResponse.json({ error: 'Startup ID is required' }, { status: 400 })
    }

    const supabase = createServerClient()
    
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection unavailable' }, { status: 500 })
    }

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // First, get the startup details to ensure it belongs to the user
    const { data: startup, error: startupError } = await supabase
      .from('startups')
      .select('*')
      .eq('id', startupId)
      .eq('founder_id', user.id) // Updated to use founder_id column
      .single()

    if (startupError || !startup) {
      return NextResponse.json({ error: 'Startup not found or access denied' }, { status: 404 })
    }

    // Get all active investor theses to calculate matches
    const { data: investorTheses, error: thesesError } = await supabase
      .from('investor_theses')
      .select(`
        *,
        user_profiles!inner(
          full_name,
          user_type,
          location
        )
      `)
      .eq('is_active', true)
      .eq('user_profiles.user_type', 'investor')

    if (thesesError) {
      console.error('Error fetching investor theses:', thesesError)
      return NextResponse.json({ error: 'Failed to fetch investor data' }, { status: 500 })
    }

    if (!investorTheses || investorTheses.length === 0) {
      // No investors in the system yet
      return NextResponse.json({
        total_matches: 0,
        by_stage: {},
        by_country: {},
        by_sector: {},
        by_funding_range: {},
        recent_matches: 0,
        avg_match_score: 0,
        top_match_reasons: [],
        metadata: {
          startup_id: startupId,
          startup_name: startup.name,
          last_updated: new Date().toISOString(),
          calculation_method: 'real-time',
          total_investors: 0
        }
      })
    }

    // Calculate matches using the matching algorithm
    const matches = calculateMatches(startup, investorTheses)

    // Aggregate the results
    const summary = aggregateMatchResults(matches, startup)

    return NextResponse.json(summary)

  } catch (error) {
    console.error('Error in matching summary API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Real matching algorithm implementation
function calculateMatches(startup: any, investorTheses: any[]) {
  const matches = []
  
  for (const thesis of investorTheses) {
    const matchScore = calculateMatchScore(startup, thesis)
    
    if (matchScore.total > 0.3) { // Minimum threshold for a "match"
      matches.push({
        investor_id: thesis.investor_id,
        investor_name: thesis.user_profiles?.full_name || 'Anonymous Investor',
        investor_location: thesis.user_profiles?.location || 'Unknown',
        thesis,
        match_score: matchScore.total,
        match_reasons: matchScore.reasons,
        breakdown: matchScore.breakdown
      })
    }
  }
  
  return matches.sort((a, b) => b.match_score - a.match_score)
}

// Detailed scoring algorithm
function calculateMatchScore(startup: any, thesis: any) {
  const breakdown: Record<string, number> = {
    industry: 0,
    stage: 0,
    funding: 0,
    location: 0,
    traction: 0.5, // Will be calculated based on available metrics
    team: 0.5      // Will be calculated based on available data
  }
  
  const reasons: string[] = []
  
  // Industry matching
  if (thesis.preferred_industries && thesis.preferred_industries.length > 0) {
    if (thesis.preferred_industries.includes(startup.industry)) {
      breakdown.industry = 1.0
      reasons.push('Industry alignment')
    } else {
      breakdown.industry = 0.0
    }
  } else {
    breakdown.industry = 0.5 // Neutral if no industry preference
  }
  
  // Stage matching
  if (thesis.preferred_stages && thesis.preferred_stages.length > 0) {
    if (thesis.preferred_stages.includes(startup.stage)) {
      breakdown.stage = 1.0
      reasons.push('Stage compatibility')
    } else {
      breakdown.stage = 0.0
    }
  } else {
    breakdown.stage = 0.5 // Neutral if no stage preference
  }
  
  // Funding range matching
  const fundingAsk = startup.funding_ask || startup.funding_goal || 0
  if (fundingAsk >= thesis.min_funding_ask && fundingAsk <= thesis.max_funding_ask) {
    breakdown.funding = 1.0
    reasons.push('Funding range match')
  } else if (fundingAsk > 0) {
    // Partial score based on proximity to range
    const rangeMidpoint = (thesis.min_funding_ask + thesis.max_funding_ask) / 2
    const distance = Math.abs(fundingAsk - rangeMidpoint) / rangeMidpoint
    breakdown.funding = Math.max(0, 1 - distance) // Closer = higher score
  }
  
  // Location matching
  if (thesis.no_location_pref || thesis.remote_ok) {
    breakdown.location = 1.0
    if (thesis.remote_ok) reasons.push('Remote-friendly investor')
  } else if (thesis.countries && thesis.countries.length > 0) {
    if (thesis.countries.includes(startup.country)) {
      breakdown.location = 1.0
      reasons.push('Geographic proximity')
    } else {
      breakdown.location = 0.1 // Small penalty for location mismatch
    }
  }
  
  // Traction Assessment (Enhanced Implementation)
  breakdown.traction = calculateTractionScore(startup, thesis)
  if (breakdown.traction > 0.7) {
    reasons.push('Strong traction metrics')
  } else if (breakdown.traction > 0.5) {
    reasons.push('Moderate traction')
  }
  
  // Team Evaluation (Enhanced Implementation)
  breakdown.team = calculateTeamScore(startup, thesis)
  if (breakdown.team > 0.7) {
    reasons.push('Strong team profile')
  } else if (breakdown.team > 0.5) {
    reasons.push('Good team fit')
  }
  
  // Keywords matching (bonus points)
  if (thesis.keywords && thesis.keywords.length > 0) {
    const startupText = `${startup.name} ${startup.tagline} ${startup.description}`.toLowerCase()
    const keywordMatches = thesis.keywords.filter((keyword: string) => 
      startupText.includes(keyword.toLowerCase())
    )
    if (keywordMatches.length > 0) {
      reasons.push('Keyword alignment')
      // Boost scores slightly for keyword matches
      Object.keys(breakdown).forEach(key => {
        breakdown[key] = Math.min(1.0, breakdown[key] + 0.1)
      })
    }
  }
  
  // Calculate weighted total score
  const weights: Record<string, number> = {
    industry: thesis.industry_weight || 0.25,
    stage: thesis.stage_weight || 0.20,
    funding: thesis.funding_weight || 0.15,
    location: thesis.location_weight || 0.10,
    traction: thesis.traction_weight || 0.20,
    team: thesis.team_weight || 0.10
  }
  
  const total = Object.keys(breakdown).reduce((sum, key) => {
    return sum + (breakdown[key] * weights[key])
  }, 0)
  
  return {
    total: Math.round(total * 100) / 100, // Round to 2 decimal places
    breakdown,
    reasons: reasons.slice(0, 3), // Top 3 reasons
    weights
  }
}

// Traction Assessment Implementation
function calculateTractionScore(startup: any, thesis: any): number {
  let score = 0.5 // Default neutral score
  let metrics = 0 // Count of available metrics
  
  // Revenue/Financial Metrics (if available)
  if (startup.monthly_revenue || startup.annual_revenue) {
    const revenue = startup.monthly_revenue ? startup.monthly_revenue * 12 : startup.annual_revenue
    if (revenue > 0) {
      // Scale: $0-10K = 0.3, $10K-100K = 0.5, $100K-1M = 0.7, $1M+ = 1.0
      if (revenue >= 1000000) score += 1.0
      else if (revenue >= 100000) score += 0.7
      else if (revenue >= 10000) score += 0.5
      else score += 0.3
      metrics++
    }
  }
  
  // Customer/User Metrics (if available)
  if (startup.customer_count || startup.user_count) {
    const users = startup.customer_count || startup.user_count
    if (users > 0) {
      // Scale: 0-100 = 0.3, 100-1K = 0.5, 1K-10K = 0.7, 10K+ = 1.0
      if (users >= 10000) score += 1.0
      else if (users >= 1000) score += 0.7
      else if (users >= 100) score += 0.5
      else score += 0.3
      metrics++
    }
  }
  
  // Growth Metrics (if available)
  if (startup.monthly_growth_rate) {
    const growth = startup.monthly_growth_rate
    if (growth > 0) {
      // Scale: 0-5% = 0.4, 5-15% = 0.6, 15-30% = 0.8, 30%+ = 1.0
      if (growth >= 0.30) score += 1.0
      else if (growth >= 0.15) score += 0.8
      else if (growth >= 0.05) score += 0.6
      else score += 0.4
      metrics++
    }
  }
  
  // Product Development Stage
  if (startup.stage) {
    switch (startup.stage.toLowerCase()) {
      case 'idea':
        score += 0.2
        break
      case 'prototype':
      case 'mvp':
        score += 0.4
        break
      case 'beta':
        score += 0.6
        break
      case 'launched':
      case 'growth':
        score += 0.8
        break
      case 'scale':
        score += 1.0
        break
      default:
        score += 0.5
    }
    metrics++
  }
  
  // Partnerships/Social Proof (if available)
  if (startup.partnership_count || startup.press_mentions) {
    const social_proof = (startup.partnership_count || 0) + (startup.press_mentions || 0)
    if (social_proof > 10) score += 1.0
    else if (social_proof > 5) score += 0.7
    else if (social_proof > 0) score += 0.5
    metrics++
  }
  
  // Average the scores if we have metrics, otherwise return neutral
  return metrics > 0 ? Math.min(1.0, score / metrics) : 0.5
}

// Team Evaluation Implementation
function calculateTeamScore(startup: any, thesis: any): number {
  let score = 0.5 // Default neutral score
  let factors = 0 // Count of evaluated factors
  
  // Team Size Assessment
  if (startup.team_size || startup.founder_count) {
    const teamSize = startup.team_size || startup.founder_count || 1
    // Optimal team size varies by stage
    let optimalScore = 0.5
    
    switch (startup.stage?.toLowerCase()) {
      case 'idea':
      case 'prototype':
        // 1-3 people ideal for early stage
        optimalScore = teamSize >= 1 && teamSize <= 3 ? 1.0 : 0.6
        break
      case 'mvp':
      case 'beta':
        // 2-5 people ideal for MVP stage
        optimalScore = teamSize >= 2 && teamSize <= 5 ? 1.0 : 0.7
        break
      case 'launched':
      case 'growth':
        // 3-15 people ideal for growth stage
        optimalScore = teamSize >= 3 && teamSize <= 15 ? 1.0 : 0.8
        break
      default:
        optimalScore = teamSize > 0 ? 0.7 : 0.3
    }
    
    score += optimalScore
    factors++
  }
  
  // Founder Experience (if available)
  if (startup.founder_experience_years || startup.previous_startups) {
    const experience = startup.founder_experience_years || 0
    const previousStartups = startup.previous_startups || 0
    
    let experienceScore = 0.5
    
    // Years of relevant experience
    if (experience >= 10) experienceScore += 0.5
    else if (experience >= 5) experienceScore += 0.3
    else if (experience >= 2) experienceScore += 0.2
    
    // Previous startup experience
    if (previousStartups >= 2) experienceScore += 0.3
    else if (previousStartups >= 1) experienceScore += 0.2
    
    score += Math.min(1.0, experienceScore)
    factors++
  }
  
  // Educational Background (if available)
  if (startup.team_education_score || startup.founder_education) {
    const educationScore = startup.team_education_score || 0.5
    
    // Scale based on education quality/relevance
    // This could be enhanced with specific university rankings, degree relevance, etc.
    if (typeof educationScore === 'number') {
      score += educationScore
    } else {
      // Simple string-based assessment
      const education = startup.founder_education?.toLowerCase() || ''
      if (education.includes('phd') || education.includes('mba')) score += 0.9
      else if (education.includes('master') || education.includes('ms')) score += 0.7
      else if (education.includes('bachelor') || education.includes('bs')) score += 0.6
      else score += 0.5
    }
    factors++
  }
  
  // Technical Expertise (if available)
  if (startup.technical_team_ratio || startup.has_cto) {
    let techScore = 0.5
    
    if (startup.technical_team_ratio) {
      const techRatio = startup.technical_team_ratio
      // Higher technical ratio generally better for tech startups
      if (techRatio >= 0.6) techScore = 1.0
      else if (techRatio >= 0.4) techScore = 0.8
      else if (techRatio >= 0.2) techScore = 0.6
      else techScore = 0.4
    } else if (startup.has_cto) {
      techScore = 0.8
    }
    
    score += techScore
    factors++
  }
  
  // Industry Expertise (if available)
  if (startup.team_industry_experience || startup.founder_industry_years) {
    const industryExp = startup.founder_industry_years || 0
    
    let industryScore = 0.5
    if (industryExp >= 8) industryScore = 1.0
    else if (industryExp >= 5) industryScore = 0.8
    else if (industryExp >= 2) industryScore = 0.6
    else industryScore = 0.4
    
    score += industryScore
    factors++
  }
  
  // Network/Advisory Board (if available)
  if (startup.advisor_count || startup.board_quality_score) {
    const advisors = startup.advisor_count || 0
    const boardQuality = startup.board_quality_score || 0.5
    
    let networkScore = 0.5
    if (advisors >= 5) networkScore += 0.3
    else if (advisors >= 3) networkScore += 0.2
    else if (advisors >= 1) networkScore += 0.1
    
    if (typeof boardQuality === 'number') {
      networkScore += boardQuality * 0.5
    }
    
    score += Math.min(1.0, networkScore)
    factors++
  }
  
  // Default factors if no data available
  if (factors === 0) {
    // Use basic available data
    if (startup.founder_id) {
      score = 0.6 // Slight positive for having a founder
      factors = 1
    }
  }
  
  // Average the scores if we have factors, otherwise return neutral
  return factors > 0 ? Math.min(1.0, score / factors) : 0.5
}

// Aggregate match results into summary format
function aggregateMatchResults(matches: any[], startup: any) {
  const totalMatches = matches.length
  
  if (totalMatches === 0) {
    return {
      total_matches: 0,
      by_stage: {},
      by_country: {},
      by_sector: {},
      by_funding_range: {},
      recent_matches: 0,
      avg_match_score: 0,
      top_match_reasons: [],
      metadata: {
        startup_id: startup.id,
        startup_name: startup.name,
        last_updated: new Date().toISOString(),
        calculation_method: 'real-time',
        total_investors: 0
      }
    }
  }
  
  // Group by stage (from investor preferences)
  const byStage: Record<string, number> = {}
  const byCountry: Record<string, number> = {}
  const bySector: Record<string, number> = {}
  const byFundingRange: Record<string, number> = {}
  
  // Collect all reasons and count frequency
  const reasonCounts: Record<string, number> = {}
  
  matches.forEach(match => {
    // Count by investor's preferred stages
    if (match.thesis.preferred_stages) {
      match.thesis.preferred_stages.forEach((stage: string) => {
        byStage[stage] = (byStage[stage] || 0) + 1
      })
    }
    
    // Count by investor's countries
    if (match.thesis.countries) {
      match.thesis.countries.forEach((country: string) => {
        byCountry[country] = (byCountry[country] || 0) + 1
      })
    }
    
    // Count by investor's preferred industries
    if (match.thesis.preferred_industries) {
      match.thesis.preferred_industries.forEach((industry: string) => {
        bySector[industry] = (bySector[industry] || 0) + 1
      })
    }
    
    // Count by funding ranges
    const fundingRange = getFundingRangeLabel(match.thesis.min_funding_ask, match.thesis.max_funding_ask)
    byFundingRange[fundingRange] = (byFundingRange[fundingRange] || 0) + 1
    
    // Count match reasons
    match.match_reasons.forEach((reason: string) => {
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1
    })
  })
  
  // Get top match reasons
  const topMatchReasons = Object.entries(reasonCounts)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([reason]) => reason)
  
  // Calculate average match score
  const avgMatchScore = Math.round(
    (matches.reduce((sum, match) => sum + match.match_score, 0) / totalMatches) * 100
  )
  
  return {
    total_matches: totalMatches,
    by_stage: byStage,
    by_country: byCountry,
    by_sector: bySector,
    by_funding_range: byFundingRange,
    recent_matches: Math.min(totalMatches, 5), // Assume recent matches for now
    avg_match_score: avgMatchScore,
    top_match_reasons: topMatchReasons,
    metadata: {
      startup_id: startup.id,
      startup_name: startup.name,
      last_updated: new Date().toISOString(),
      calculation_method: 'real-time',
      total_investors: matches.length
    }
  }
}

// Helper function to get funding range label
function getFundingRangeLabel(min: number, max: number): string {
  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `$${amount / 1000000}M`
    } else if (amount >= 1000) {
      return `$${amount / 1000}K`
    } else {
      return `$${amount}`
    }
  }
  
  return `${formatAmount(min)} - ${formatAmount(max)}`
}
