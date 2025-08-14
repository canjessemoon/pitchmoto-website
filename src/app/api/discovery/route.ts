import { createServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    
    // Get query parameters
    const search = searchParams.get('search') || ''
    const sector = searchParams.get('sector') || ''
    const location = searchParams.get('location') || ''
    const stage = searchParams.get('stage') || ''
    const country = searchParams.get('country') || ''
    const sort = searchParams.get('sort') || 'trending' // trending, newest
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    const offset = (page - 1) * limit

    let query = supabase
      .from('pitches')
      .select(`
        id,
        title,
        tagline,
        sector,
        location,
        stage,
        funding_ask,
        upvote_count,
        created_at,
        updated_at,
        startups:startup_id (
          id,
          name,
          logo_url,
          country
        )
      `)
      .eq('status', 'published') // Only show published pitches
      .range(offset, offset + limit - 1)

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,tagline.ilike.%${search}%`)
    }
    
    if (sector) {
      query = query.eq('sector', sector)
    }
    
    if (location) {
      query = query.ilike('location', `%${location}%`)
    }
    
    if (stage) {
      query = query.eq('stage', stage)
    }

    // Apply country filter via startup relationship
    if (country) {
      // This would need a more complex query - for now we'll handle it in post-processing
    }

    // Apply sorting
    if (sort === 'newest') {
      query = query.order('created_at', { ascending: false })
    } else if (sort === 'trending') {
      query = query.order('upvote_count', { ascending: false })
        .order('created_at', { ascending: false }) // Secondary sort by recency
    }

    const { data: pitches, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch pitches' }, { status: 500 })
    }

    // Filter by country in post-processing if needed
    let filteredPitches = pitches || []
    if (country) {
      filteredPitches = filteredPitches.filter(pitch => {
        const startup = pitch.startups as any
        return startup?.country?.toLowerCase().includes(country.toLowerCase())
      })
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('pitches')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')

    // Apply same filters for count
    if (search) {
      countQuery = countQuery.or(`title.ilike.%${search}%,tagline.ilike.%${search}%`)
    }
    
    if (sector) {
      countQuery = countQuery.eq('sector', sector)
    }
    
    if (location) {
      countQuery = countQuery.ilike('location', `%${location}%`)
    }
    
    if (stage) {
      countQuery = countQuery.eq('stage', stage)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('Count error:', countError)
    }

    return NextResponse.json({
      pitches: filteredPitches,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching pitches:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
