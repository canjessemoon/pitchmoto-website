import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { Database } from '@/types/database'

// Validation schema for match interactions
const interactionSchema = z.object({
  match_id: z.string().uuid(),
  interaction_type: z.enum(['view', 'like', 'pass', 'save', 'contact', 'note']),
  notes: z.string().optional()
})

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

// POST /api/matching/interactions - Record a match interaction
export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user, profile } = authResult

    if (profile.user_type !== 'investor') {
      return NextResponse.json({ error: 'Only investors can create interactions' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = interactionSchema.parse(body)

    const supabase = createSupabaseClient()

    // Verify the match belongs to this investor
    const { data: match, error: matchError } = await supabase
      .from('startup_matches')
      .select('*')
      .eq('id', validatedData.match_id)
      .eq('investor_id', user.id)
      .single()

    if (matchError || !match) {
      return NextResponse.json({ error: 'Match not found or unauthorized' }, { status: 404 })
    }

    // Record the interaction
    const { data: interaction, error: interactionError } = await supabase
      .from('match_interactions')
      .insert({
        match_id: validatedData.match_id,
        investor_id: user.id,
        startup_id: match.startup_id,
        interaction_type: validatedData.interaction_type,
        notes: validatedData.notes
      })
      .select()
      .single()

    if (interactionError) {
      console.error('Error creating interaction:', interactionError)
      return NextResponse.json({ error: 'Failed to record interaction' }, { status: 500 })
    }

    // Update match status based on interaction type
    let newStatus = match.status
    let updateData: any = {}

    switch (validatedData.interaction_type) {
      case 'view':
        if (match.status === 'pending') {
          newStatus = 'viewed'
          updateData.viewed_at = new Date().toISOString()
        }
        break
      case 'like':
        newStatus = 'interested'
        break
      case 'pass':
        newStatus = 'not_interested'
        break
      case 'contact':
        newStatus = 'contacted'
        break
    }

    if (newStatus !== match.status || Object.keys(updateData).length > 0) {
      updateData.status = newStatus
      await supabase
        .from('startup_matches')
        .update(updateData)
        .eq('id', validatedData.match_id)
    }

    return NextResponse.json({ 
      interaction,
      match_status: newStatus
    }, { status: 201 })

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

// GET /api/matching/interactions - Get interactions for a match or investor
export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user, profile } = authResult
    const { searchParams } = new URL(request.url)
    
    const matchId = searchParams.get('match_id')
    const startupId = searchParams.get('startup_id')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    const offset = (page - 1) * limit
    const supabase = createSupabaseClient()

    let query = supabase
      .from('match_interactions')
      .select(`
        *,
        startup_matches (
          id,
          startup_id,
          overall_score,
          status
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filter based on user type and parameters
    if (profile.user_type === 'investor') {
      query = query.eq('investor_id', user.id)
      
      if (matchId) {
        // Verify match belongs to investor
        const { data: match } = await supabase
          .from('startup_matches')
          .select('investor_id')
          .eq('id', matchId)
          .eq('investor_id', user.id)
          .single()
        
        if (!match) {
          return NextResponse.json({ error: 'Match not found' }, { status: 404 })
        }
        
        query = query.eq('match_id', matchId)
      }
      
      if (startupId) {
        query = query.eq('startup_id', startupId)
      }
    } else if (profile.user_type === 'founder') {
      // Founders can see interactions on their startups
      const { data: startups } = await supabase
        .from('startups')
        .select('id')
        .eq('founder_id', user.id)
      
      const startupIds = startups?.map(s => s.id) || []
      if (startupIds.length === 0) {
        return NextResponse.json({ interactions: [], total: 0, page, limit })
      }
      
      query = query.in('startup_id', startupIds)
      
      if (startupId && startupIds.includes(startupId)) {
        query = query.eq('startup_id', startupId)
      }
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: interactions, error } = await query

    if (error) {
      console.error('Error fetching interactions:', error)
      return NextResponse.json({ error: 'Failed to fetch interactions' }, { status: 500 })
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('match_interactions')
      .select('*', { count: 'exact', head: true })

    if (profile.user_type === 'investor') {
      countQuery = countQuery.eq('investor_id', user.id)
      if (matchId) countQuery = countQuery.eq('match_id', matchId)
      if (startupId) countQuery = countQuery.eq('startup_id', startupId)
    } else {
      const { data: startups } = await supabase
        .from('startups')
        .select('id')
        .eq('founder_id', user.id)
      
      const startupIds = startups?.map(s => s.id) || []
      countQuery = countQuery.in('startup_id', startupIds)
      if (startupId && startupIds.includes(startupId)) {
        countQuery = countQuery.eq('startup_id', startupId)
      }
    }

    const { count } = await countQuery

    return NextResponse.json({
      interactions: interactions || [],
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
