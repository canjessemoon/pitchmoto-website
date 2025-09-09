import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { Database } from '@/types/database'

// Validation schema for match status update
const updateMatchSchema = z.object({
  status: z.enum(['pending', 'viewed', 'interested', 'not_interested', 'contacted']),
  notes: z.string().optional()
})

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

// PUT /api/matching/matches/[id] - Update match status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await getAuthenticatedUser(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user } = authResult
    const matchId = params.id
    const body = await request.json()
    const validatedData = updateMatchSchema.parse(body)

    const supabase = createSupabaseClient()

    // Verify the match belongs to this investor
    const { data: match, error: matchError } = await supabase
      .from('startup_matches')
      .select('*')
      .eq('id', matchId)
      .eq('investor_id', user.id)
      .single()

    if (matchError || !match) {
      return NextResponse.json({ error: 'Match not found or unauthorized' }, { status: 404 })
    }

    // Update match status
    const updateData: any = {
      status: validatedData.status
    }

    // Set viewed_at when status changes to viewed
    if (validatedData.status === 'viewed' && match.status === 'pending') {
      updateData.viewed_at = new Date().toISOString()
    }

    const { data: updatedMatch, error: updateError } = await supabase
      .from('startup_matches')
      .update(updateData)
      .eq('id', matchId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating match:', updateError)
      return NextResponse.json({ error: 'Failed to update match' }, { status: 500 })
    }

    // Create an interaction record for the status change
    if (validatedData.status !== match.status) {
      let interactionType: 'view' | 'like' | 'pass' | 'contact'
      
      switch (validatedData.status) {
        case 'viewed':
          interactionType = 'view'
          break
        case 'interested':
          interactionType = 'like'
          break
        case 'not_interested':
          interactionType = 'pass'
          break
        case 'contacted':
          interactionType = 'contact'
          break
        default:
          interactionType = 'view'
      }

      await supabase
        .from('match_interactions')
        .insert({
          match_id: matchId,
          investor_id: user.id,
          startup_id: match.startup_id,
          interaction_type: interactionType,
          notes: validatedData.notes
        })
    }

    return NextResponse.json({ match: updatedMatch })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/matching/matches/[id] - Get single match details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await getAuthenticatedUser(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user, profile } = authResult
    const matchId = params.id
    const supabase = createSupabaseClient()

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
          pitch_deck_url,
          profiles!startups_founder_id_fkey (
            id,
            full_name,
            company,
            location,
            bio,
            linkedin_url
          )
        ),
        investor_theses (
          id,
          preferred_industries,
          preferred_stages,
          min_funding_ask,
          max_funding_ask
        )
      `)
      .eq('id', matchId)

    // Filter based on user type
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
        return NextResponse.json({ error: 'Match not found' }, { status: 404 })
      }
      query = query.in('startup_id', startupIds)
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: match, error } = await query.single()

    if (error || !match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    // Get recent interactions for this match
    const { data: interactions } = await supabase
      .from('match_interactions')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      match,
      recent_interactions: interactions || []
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
