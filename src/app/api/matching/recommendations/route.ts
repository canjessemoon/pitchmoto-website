import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { MATCHING_CONFIG } from '@/lib/matching'

function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient<Database>(supabaseUrl, supabaseServiceKey)
}

async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  const supabase = createSupabaseClient()
  
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) {
    return null
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.user_type !== 'investor') {
    return null
  }

  return { user, profile }
}

// GET /api/matching/recommendations - Get personalized recommendations
export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user } = authResult
    const supabase = createSupabaseClient()

    // Get investor's thesis and matches
    const [thesisResult, matchesResult, interactionsResult] = await Promise.all([
      supabase
        .from('investor_theses')
        .select('*')
        .eq('investor_id', user.id)
        .eq('is_active', true)
        .single(),
      
      supabase
        .from('startup_matches')
        .select(`
          *,
          startups (industry, stage, funding_goal, profiles!startups_founder_id_fkey (location))
        `)
        .eq('investor_id', user.id)
        .order('overall_score', { ascending: false })
        .limit(100),
      
      supabase
        .from('match_interactions')
        .select('*')
        .eq('investor_id', user.id)
        .order('created_at', { ascending: false })
        .limit(200)
    ])

    const thesis = thesisResult.data
    const matches = matchesResult.data || []
    const interactions = interactionsResult.data || []

    if (!thesis) {
      return NextResponse.json({
        recommendations: {
          thesis_setup: {
            priority: 'high',
            title: 'Set up your investment thesis',
            description: 'Create your investment preferences to get personalized startup matches.',
            action: 'Create thesis',
            details: [
              'Define your preferred industries and stages',
              'Set funding range preferences',
              'Configure scoring weights for your criteria'
            ]
          }
        }
      })
    }

    // Generate recommendations based on data analysis
    const recommendations = await generateIntelligentRecommendations(
      thesis, 
      matches, 
      interactions, 
      supabase
    )

    return NextResponse.json({ recommendations })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function generateIntelligentRecommendations(
  thesis: any,
  matches: any[],
  interactions: any[],
  supabase: any
) {
  const recommendations: Record<string, any> = {}

  // 1. Thesis optimization recommendations
  if (matches.length > 0) {
    const thesisRecommendations = analyzeThesisEffectiveness(thesis, matches, interactions)
    if (thesisRecommendations.length > 0) {
      recommendations.thesis_optimization = {
        priority: 'medium',
        title: 'Optimize your investment criteria',
        description: 'Based on your match results, consider adjusting your thesis.',
        suggestions: thesisRecommendations
      }
    }
  }

  // 2. High-quality matches you haven't viewed
  const unviewedHighQuality = matches.filter(m => 
    m.status === 'pending' && 
    m.overall_score >= 70 && 
    m.confidence_level === 'high'
  ).slice(0, 5)

  if (unviewedHighQuality.length > 0) {
    recommendations.high_quality_matches = {
      priority: 'high',
      title: `${unviewedHighQuality.length} high-quality matches waiting`,
      description: 'You have excellent matches that haven\'t been reviewed yet.',
      action: 'Review matches',
      matches: unviewedHighQuality.map(m => ({
        startup_id: m.startup_id,
        startup_name: m.startups?.name,
        score: m.overall_score,
        reason: m.match_reason
      }))
    }
  }

  // 3. Industry diversification opportunities
  const industryAnalysis = analyzeIndustryDiversification(matches, thesis)
  if (industryAnalysis.recommendation) {
    recommendations.industry_diversification = {
      priority: 'low',
      title: 'Consider diversifying your portfolio',
      description: industryAnalysis.recommendation,
      suggested_industries: industryAnalysis.suggested_industries
    }
  }

  // 4. Interaction pattern insights
  const interactionInsights = analyzeInteractionPatterns(interactions, matches)
  if (interactionInsights.recommendations.length > 0) {
    recommendations.interaction_patterns = {
      priority: 'medium',
      title: 'Improve your evaluation process',
      description: 'Based on your interaction patterns, here are some suggestions.',
      insights: interactionInsights.recommendations
    }
  }

  // 5. Market opportunity alerts
  const marketOpportunities = await identifyMarketOpportunities(thesis, supabase)
  if (marketOpportunities.length > 0) {
    recommendations.market_opportunities = {
      priority: 'medium',
      title: 'Emerging opportunities in your focus areas',
      description: 'New startups that match your criteria have recently joined.',
      opportunities: marketOpportunities
    }
  }

  // 6. Performance benchmarking
  const benchmarkInsights = await generateBenchmarkInsights(thesis, matches, supabase)
  if (benchmarkInsights) {
    recommendations.performance_benchmark = {
      priority: 'low',
      title: 'Your matching performance',
      description: 'See how your matching criteria compare to similar investors.',
      insights: benchmarkInsights
    }
  }

  return recommendations
}

function analyzeThesisEffectiveness(thesis: any, matches: any[], interactions: any[]) {
  const recommendations: string[] = []
  
  // Analyze score distribution
  const avgScore = matches.reduce((sum, m) => sum + m.overall_score, 0) / matches.length
  const highScoreMatches = matches.filter(m => m.overall_score >= 80).length
  const highScoreRate = highScoreMatches / matches.length

  if (avgScore < 60) {
    recommendations.push('Your criteria might be too restrictive. Consider broadening your preferences.')
  }

  if (highScoreRate < 0.15) {
    recommendations.push('Very few high-quality matches. Try adjusting your scoring weights.')
  }

  // Analyze interaction rates
  const viewedMatches = interactions.filter(i => i.interaction_type === 'view').length
  const interestedMatches = interactions.filter(i => i.interaction_type === 'like').length
  const interestRate = viewedMatches > 0 ? interestedMatches / viewedMatches : 0

  if (interestRate < 0.1 && viewedMatches > 10) {
    recommendations.push('Low interest rate in viewed matches. Your criteria might need refinement.')
  }

  // Analyze criteria performance
  const criteriaScores = {
    industry: matches.reduce((sum, m) => sum + m.industry_score, 0) / matches.length,
    stage: matches.reduce((sum, m) => sum + m.stage_score, 0) / matches.length,
    funding: matches.reduce((sum, m) => sum + m.funding_score, 0) / matches.length,
    location: matches.reduce((sum, m) => sum + m.location_score, 0) / matches.length,
    traction: matches.reduce((sum, m) => sum + m.traction_score, 0) / matches.length,
    team: matches.reduce((sum, m) => sum + m.team_score, 0) / matches.length
  }

  const lowPerformingCriteria = Object.entries(criteriaScores)
    .filter(([, score]) => score < 50)
    .map(([criteria]) => criteria)

  if (lowPerformingCriteria.length > 0) {
    recommendations.push(
      `Consider adjusting these criteria: ${lowPerformingCriteria.join(', ')} (currently underperforming)`
    )
  }

  return recommendations
}

function analyzeIndustryDiversification(matches: any[], thesis: any) {
  const industries = matches.map(m => m.startups?.industry).filter(Boolean)
  const industryCount: Record<string, number> = {}
  
  industries.forEach(industry => {
    industryCount[industry] = (industryCount[industry] || 0) + 1
  })

  const dominantIndustry = Object.entries(industryCount)
    .sort(([,a], [,b]) => b - a)[0]

  if (dominantIndustry && dominantIndustry[1] / matches.length > 0.6) {
    const otherIndustries = MATCHING_CONFIG.INDUSTRIES.filter(
      ind => ind !== dominantIndustry[0] && 
      (thesis.preferred_industries.length === 0 || thesis.preferred_industries.includes(ind))
    ).slice(0, 3)

    return {
      recommendation: `${Math.round(dominantIndustry[1] / matches.length * 100)}% of your matches are in ${dominantIndustry[0]}. Consider exploring other industries for better diversification.`,
      suggested_industries: otherIndustries
    }
  }

  return { recommendation: null, suggested_industries: [] }
}

function analyzeInteractionPatterns(interactions: any[], matches: any[]) {
  const recommendations: string[] = []
  
  const interactionTypes = interactions.reduce((acc: Record<string, number>, int) => {
    acc[int.interaction_type] = (acc[int.interaction_type] || 0) + 1
    return acc
  }, {})

  const totalInteractions = interactions.length
  const views = interactionTypes.view || 0
  const likes = interactionTypes.like || 0
  const passes = interactionTypes.pass || 0
  const contacts = interactionTypes.contact || 0

  // Analysis patterns
  if (views > 0 && likes / views < 0.05) {
    recommendations.push('You view many matches but rarely express interest. Consider being more selective in viewing or more open to opportunities.')
  }

  if (likes > 0 && contacts / likes < 0.1) {
    recommendations.push('You like matches but rarely contact founders. Consider reaching out to startups you\'re interested in.')
  }

  if (passes / (views || 1) > 0.8) {
    recommendations.push('You pass on most matches. Your criteria might be too restrictive.')
  }

  const pendingMatches = matches.filter(m => m.status === 'pending').length
  if (pendingMatches > 20) {
    recommendations.push(`You have ${pendingMatches} unreviewed matches. Regular review helps identify opportunities quickly.`)
  }

  return { recommendations }
}

async function identifyMarketOpportunities(thesis: any, supabase: any) {
  // Get recently created startups that match thesis criteria
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  
  let query = supabase
    .from('startups')
    .select('id, name, industry, stage, funding_goal, tagline, created_at')
    .gte('created_at', oneWeekAgo)
    .order('created_at', { ascending: false })
    .limit(10)

  // Apply thesis filters
  if (thesis.preferred_industries.length > 0) {
    query = query.in('industry', thesis.preferred_industries)
  }
  
  if (thesis.preferred_stages.length > 0) {
    query = query.in('stage', thesis.preferred_stages)
  }

  const { data: newStartups } = await query

  return (newStartups || []).map((startup: any) => ({
    startup_id: startup.id,
    name: startup.name,
    industry: startup.industry,
    stage: startup.stage,
    funding_goal: startup.funding_goal,
    tagline: startup.tagline,
    days_since_created: Math.floor(
      (Date.now() - new Date(startup.created_at).getTime()) / (1000 * 60 * 60 * 24)
    )
  }))
}

async function generateBenchmarkInsights(thesis: any, matches: any[], supabase: any) {
  // Get aggregated data from other investors with similar preferences
  const { data: similarTheses } = await supabase
    .from('investor_theses')
    .select('investor_id')
    .overlaps('preferred_industries', thesis.preferred_industries)
    .neq('investor_id', thesis.investor_id)
    .limit(50)

  if (!similarTheses || similarTheses.length < 5) {
    return null // Not enough data for meaningful comparison
  }

  const similarInvestorIds = similarTheses.map((t: any) => t.investor_id)
  
  const { data: benchmarkMatches } = await supabase
    .from('startup_matches')
    .select('overall_score, confidence_level')
    .in('investor_id', similarInvestorIds)

  if (!benchmarkMatches || benchmarkMatches.length === 0) {
    return null
  }

  const benchmarkAvgScore = benchmarkMatches.reduce((sum: number, m: any) => sum + m.overall_score, 0) / benchmarkMatches.length
  const benchmarkHighConfidence = benchmarkMatches.filter((m: any) => m.confidence_level === 'high').length / benchmarkMatches.length

  const yourAvgScore = matches.reduce((sum, m) => sum + m.overall_score, 0) / matches.length
  const yourHighConfidence = matches.filter(m => m.confidence_level === 'high').length / matches.length

  return {
    your_avg_score: Math.round(yourAvgScore),
    benchmark_avg_score: Math.round(benchmarkAvgScore),
    score_percentile: yourAvgScore > benchmarkAvgScore ? 'above_average' : 'below_average',
    your_high_confidence_rate: Math.round(yourHighConfidence * 100),
    benchmark_high_confidence_rate: Math.round(benchmarkHighConfidence * 100),
    sample_size: benchmarkMatches.length
  }
}
