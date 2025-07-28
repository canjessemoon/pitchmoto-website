import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client with service role key (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    console.log('API: Fetching public pitches')

    // Get query parameters for filtering/sorting
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const industry = searchParams.get('industry')
    const stage = searchParams.get('stage')
    const sortBy = searchParams.get('sortBy') || 'newest'

    // Build the query
    let query = supabaseAdmin
      .from('pitches')
      .select(`
        *,
        startup:startups (
          id,
          name,
          tagline,
          description,
          industry,
          stage,
          funding_goal,
          country,
          website_url,
          logo_url,
          created_at
        )
      `)

    // TODO: Add published status filter when we implement it
    // .eq('published', true)

    // Apply filters if provided
    if (industry) {
      query = query.eq('startup.industry', industry)
    }
    if (stage) {
      query = query.eq('startup.stage', stage)
    }

    // Apply sorting
    switch (sortBy) {
      case 'trending':
        query = query.order('upvote_count', { ascending: false })
        break
      case 'funding':
        query = query.order('startup.funding_goal', { ascending: false })
        break
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false })
        break
    }

    const { data: pitches, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Database error: ' + error.message },
        { status: 500 }
      )
    }

    // Apply text search on frontend for now (could move to database later)
    let filteredPitches = pitches || []
    if (search) {
      const searchLower = search.toLowerCase()
      filteredPitches = filteredPitches.filter(pitch => 
        pitch.startup.name.toLowerCase().includes(searchLower) ||
        pitch.title.toLowerCase().includes(searchLower) ||
        pitch.startup.tagline.toLowerCase().includes(searchLower)
      )
    }

    console.log(`Fetched ${filteredPitches.length} public pitches`)

    return NextResponse.json({ 
      success: true, 
      pitches: filteredPitches
    })

  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
