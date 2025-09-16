import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { 
  calculateEnhancedMatchScore, 
  generateMatchAnalytics,
  type StartupWithProfile 
} from '@/lib/advanced-matching'

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

// GET /api/matching/matches - Get matches for investor
export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user, profile } = authResult
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const minScore = parseInt(searchParams.get('min_score') || '0')
    const status = searchParams.get('status') || 'all'
    
    const offset = (page - 1) * limit
    const supabase = createSupabaseClient()

    // Build query based on user type
    let query = supabase
      .from('startup_matches')
      .select(`
        *,
        startups (
          id,
          name,
          tagline,
          description,
          industry,
          stage,
          funding_goal,
          current_funding,
          logo_url,
          website_url,
          profiles!startups_founder_id_fkey (
            full_name,
            company,
            location
          )
        ),
        investor_theses (
          id,
          preferred_industries,
          preferred_stages
        )
      `)
      .gte('overall_score', minScore)
      .order('overall_score', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filter by user type
    if (profile.user_type === 'investor') {
      query = query.eq('investor_id', user.id)
    } else if (profile.user_type === 'founder') {
      // Founders can see matches for their startups
      const { data: startups } = await supabase
        .from('startups')
        .select('id')
        .eq('founder_id', user.id)
      
      const startupIds = startups?.map(s => s.id) || []
      if (startupIds.length === 0) {
        return NextResponse.json({ matches: [], total: 0, page, limit })
      }
      query = query.in('startup_id', startupIds)
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Filter by status if specified
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: matches, error } = await query

    if (error) {
      console.error('Error fetching matches:', error)
      return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 })
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('startup_matches')
      .select('*', { count: 'exact', head: true })
      .gte('overall_score', minScore)

    if (profile.user_type === 'investor') {
      countQuery = countQuery.eq('investor_id', user.id)
    } else {
      const { data: startups } = await supabase
        .from('startups')
        .select('id')
        .eq('founder_id', user.id)
      
      const startupIds = startups?.map(s => s.id) || []
      countQuery = countQuery.in('startup_id', startupIds)
    }

    if (status !== 'all') {
      countQuery = countQuery.eq('status', status)
    }

    const { count } = await countQuery

    return NextResponse.json({
      matches: matches || [],
      total: count || 0,
      page,
      limit,
      has_more: ((count || 0) > offset + limit)
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/matching/matches/generate - Generate matches for investor
export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user, profile } = authResult

    if (profile.user_type !== 'investor') {
      return NextResponse.json({ error: 'Only investors can generate matches' }, { status: 403 })
    }

    const supabase = createSupabaseClient()

    // Get investor's active thesis
    const { data: thesis, error: thesisError } = await supabase
      .from('investor_theses')
      .select('*')
      .eq('investor_id', user.id)
      .eq('is_active', true)
      .single()

    if (thesisError || !thesis) {
      return NextResponse.json(
        { error: 'No active investment thesis found. Please create one first.' },
        { status: 400 }
      )
    }

    // Get existing matches for diversity calculation
    const { data: existingMatches } = await supabase
      .from('startup_matches')
      .select(`
        *,
        startups (industry, stage, profiles!startups_founder_id_fkey (location))
      `)
      .eq('investor_id', user.id)
      .eq('thesis_id', thesis.id)

    // Get all startups with enhanced data
    const { data: startups, error: startupsError } = await supabase
      .from('startups')
      .select(`
        *,
        profiles!startups_founder_id_fkey (
          id,
          full_name,
          company,
          location,
          bio,
          linkedin_url
        ),
        pitches (
          id,
          title,
          content,
          funding_ask,
          created_at
        )
      `)

    if (startupsError) {
      console.error('Error fetching startups:', startupsError)
      return NextResponse.json({ error: 'Failed to fetch startups' }, { status: 500 })
    }

    if (!startups || startups.length === 0) {
      return NextResponse.json({ matches: [], message: 'No startups found to match' })
    }

    // Delete existing matches for this investor and thesis
    await supabase
      .from('startup_matches')
      .delete()
      .eq('investor_id', user.id)
      .eq('thesis_id', thesis.id)

    // Calculate enhanced matches
    const matches = []
    for (const startup of startups) {
      const matchData = calculateEnhancedMatchScore(
        startup as StartupWithProfile, 
        thesis,
        existingMatches || []
      )
      
      // Only create matches above a minimum threshold
      if (matchData.overall_score >= 10) {
        matches.push({
          startup_id: startup.id,
          investor_id: user.id,
          thesis_id: thesis.id,
          overall_score: matchData.overall_score,
          industry_score: matchData.industry_score,
          stage_score: matchData.stage_score,
          funding_score: matchData.funding_score,
          location_score: matchData.location_score,
          traction_score: matchData.traction_score,
          team_score: matchData.team_score,
          match_reason: matchData.match_reason,
          confidence_level: matchData.confidence_level
        })
      }
    }

    // Sort matches by score and limit to top matches
    matches.sort((a, b) => b.overall_score - a.overall_score)
    const topMatches = matches.slice(0, 100) // Limit to top 100 matches

    // Insert matches in batches
    let insertedCount = 0
    if (topMatches.length > 0) {
      const batchSize = 50
      for (let i = 0; i < topMatches.length; i += batchSize) {
        const batch = topMatches.slice(i, i + batchSize)
        const { error: insertError } = await supabase
          .from('startup_matches')
          .insert(batch)

        if (insertError) {
          console.error('Error inserting match batch:', insertError)
          // Continue with remaining batches
        } else {
          insertedCount += batch.length
        }
      }
    }

    // Generate analytics for the matches
    const analytics = generateMatchAnalytics(
      topMatches.map(match => ({
        ...match,
        startups: startups.find(s => s.id === match.startup_id)
      }))
    )

    return NextResponse.json({
      message: `Generated ${insertedCount} matches`,
      count: insertedCount,
      total_scored: matches.length,
      thesis_id: thesis.id,
      analytics: {
        average_score: analytics.summary.average_score,
        high_confidence_count: analytics.summary.high_confidence_count,
        insights: analytics.insights,
        recommendations: analytics.recommendations
      }
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
