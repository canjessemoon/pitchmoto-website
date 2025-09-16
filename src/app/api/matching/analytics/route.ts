import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { generateMatchAnalytics } from '@/lib/advanced-matching'

function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY!
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

  if (!profile) {
    return null
  }

  return { user, profile }
}

// GET /api/matching/analytics - Get match analytics and insights
export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user, profile } = authResult
    const { searchParams } = new URL(request.url)
    
    const timeRange = searchParams.get('time_range') || '30d' // 7d, 30d, 90d, all
    const includeDetails = searchParams.get('include_details') === 'true'
    
    const supabase = createSupabaseClient()

    // Calculate date filter based on time range
    let dateFilter = ''
    const now = new Date()
    switch (timeRange) {
      case '7d':
        const week = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        dateFilter = week.toISOString()
        break
      case '30d':
        const month = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        dateFilter = month.toISOString()
        break
      case '90d':
        const quarter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        dateFilter = quarter.toISOString()
        break
      default:
        dateFilter = ''
    }

    let matchQuery = supabase
      .from('startup_matches')
      .select(`
        *,
        startups (
          id,
          name,
          industry,
          stage,
          funding_goal,
          current_funding,
          created_at,
          profiles!startups_founder_id_fkey (location)
        )
      `)

    // Filter by user type and date range
    if (profile.user_type === 'investor') {
      matchQuery = matchQuery.eq('investor_id', user.id)
    } else if (profile.user_type === 'founder') {
      // Founders can see analytics for their startups
      const { data: startups } = await supabase
        .from('startups')
        .select('id')
        .eq('founder_id', user.id)
      
      const startupIds = startups?.map(s => s.id) || []
      if (startupIds.length === 0) {
        return NextResponse.json({
          analytics: generateMatchAnalytics([]),
          metadata: { time_range: timeRange, user_type: profile.user_type }
        })
      }
      matchQuery = matchQuery.in('startup_id', startupIds)
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (dateFilter) {
      matchQuery = matchQuery.gte('created_at', dateFilter)
    }

    const { data: matches, error } = await matchQuery

    if (error) {
      console.error('Error fetching matches for analytics:', error)
      return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 })
    }

    // Generate analytics
    const analytics = generateMatchAnalytics(matches || [])

    // Add additional metrics for investors
    if (profile.user_type === 'investor') {
      // Get interaction statistics
      const { data: interactions } = await supabase
        .from('match_interactions')
        .select('interaction_type, created_at')
        .eq('investor_id', user.id)
        .gte('created_at', dateFilter || '1900-01-01')

      const interactionStats = {
        total_interactions: interactions?.length || 0,
        views: interactions?.filter(i => i.interaction_type === 'view').length || 0,
        likes: interactions?.filter(i => i.interaction_type === 'like').length || 0,
        passes: interactions?.filter(i => i.interaction_type === 'pass').length || 0,
        saves: interactions?.filter(i => i.interaction_type === 'save').length || 0,
        contacts: interactions?.filter(i => i.interaction_type === 'contact').length || 0,
        conversion_rate: matches?.length ? 
          (interactions?.filter(i => i.interaction_type === 'contact').length || 0) / matches.length * 100 : 0
      }

      // Get thesis effectiveness
      const { data: thesis } = await supabase
        .from('investor_theses')
        .select('*')
        .eq('investor_id', user.id)
        .eq('is_active', true)
        .single()

      const thesisEffectiveness = thesis ? {
        total_matches: matches?.length || 0,
        avg_score: analytics.summary.average_score,
        high_confidence_rate: analytics.summary.high_confidence_count / (matches?.length || 1) * 100,
        top_performing_criteria: getTopPerformingCriteria(matches || [], thesis)
      } : null

      return NextResponse.json({
        analytics,
        interaction_stats: interactionStats,
        thesis_effectiveness: thesisEffectiveness,
        metadata: {
          time_range: timeRange,
          user_type: profile.user_type,
          include_details: includeDetails
        }
      })
    }

    // For founders, add startup-specific metrics
    if (profile.user_type === 'founder') {
      const startupAnalytics = await generateFounderAnalytics(user.id, matches || [], supabase, dateFilter)
      
      return NextResponse.json({
        analytics,
        startup_analytics: startupAnalytics,
        metadata: {
          time_range: timeRange,
          user_type: profile.user_type,
          include_details: includeDetails
        }
      })
    }

    return NextResponse.json({
      analytics,
      metadata: {
        time_range: timeRange,
        user_type: profile.user_type
      }
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to analyze top performing criteria
function getTopPerformingCriteria(matches: any[], thesis: any): {
  criterion: string
  avg_score: number
  weight: number
  impact: number
}[] {
  if (matches.length === 0) return []

  const criteria = [
    { name: 'industry', weight: thesis.industry_weight },
    { name: 'stage', weight: thesis.stage_weight },
    { name: 'funding', weight: thesis.funding_weight },
    { name: 'location', weight: thesis.location_weight },
    { name: 'traction', weight: thesis.traction_weight },
    { name: 'team', weight: thesis.team_weight }
  ]

  return criteria
    .map(criterion => {
      const scoreField = `${criterion.name}_score`
      const avgScore = matches.reduce((sum, match) => 
        sum + (match[scoreField] || 0), 0) / matches.length
      
      return {
        criterion: criterion.name,
        avg_score: Math.round(avgScore),
        weight: criterion.weight,
        impact: Math.round(avgScore * criterion.weight)
      }
    })
    .sort((a, b) => b.impact - a.impact)
}

// Helper function for founder-specific analytics
async function generateFounderAnalytics(
  founderId: string, 
  matches: any[], 
  supabase: any,
  dateFilter: string
) {
  // Get all startups for this founder
  const { data: startups } = await supabase
    .from('startups')
    .select('id, name, industry, stage, created_at')
    .eq('founder_id', founderId)

  if (!startups) return null

  // Calculate per-startup metrics
  const startupMetrics = startups.map((startup: any) => {
    const startupMatches = matches.filter(m => m.startup_id === startup.id)
    
    return {
      startup_id: startup.id,
      startup_name: startup.name,
      industry: startup.industry,
      stage: startup.stage,
      total_matches: startupMatches.length,
      avg_score: startupMatches.length > 0 
        ? startupMatches.reduce((sum, m) => sum + m.overall_score, 0) / startupMatches.length 
        : 0,
      high_confidence_matches: startupMatches.filter(m => m.confidence_level === 'high').length,
      interested_investors: startupMatches.filter(m => m.status === 'interested').length,
      contacted_investors: startupMatches.filter(m => m.status === 'contacted').length
    }
  })

  // Get investor interest by industry/stage
  const industryInterest = {} as Record<string, number>
  const stageInterest = {} as Record<string, number>

  matches.forEach(match => {
    const startup = match.startups
    if (startup?.industry) {
      industryInterest[startup.industry] = (industryInterest[startup.industry] || 0) + 1
    }
    if (startup?.stage) {
      stageInterest[startup.stage] = (stageInterest[startup.stage] || 0) + 1
    }
  })

  return {
    startup_metrics: startupMetrics,
    market_insights: {
      most_attractive_industry: Object.entries(industryInterest)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A',
      most_attractive_stage: Object.entries(stageInterest)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A',
      total_investor_interest: matches.length,
      avg_match_score: matches.length > 0 
        ? matches.reduce((sum, m) => sum + m.overall_score, 0) / matches.length 
        : 0
    }
  }
}
