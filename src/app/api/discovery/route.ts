import { createServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Function to create supabase admin client with build-time protection
function createSupabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
    return null
  }
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY
  )
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseAdmin()
    
    if (!supabase) {
      console.error('Supabase admin client is null - environment variables missing')
      return NextResponse.json({ error: 'Database configuration error' }, { status: 500 })
    }
    
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
        content,
        upvote_count,
        created_at,
        updated_at,
        startups:startup_id (
          id,
          name,
          logo_url
        )
      `)
      .range(offset, offset + limit - 1)

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
    }
    
    if (sector) {
      // query = query.eq('sector', sector) // Disabled until sector column exists
    }
    
    if (location) {
      // query = query.ilike('location', `%${location}%`) // Disabled until location column exists
    }
    
    if (stage) {
      // query = query.eq('stage', stage) // Disabled until stage column exists
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

    // Filter by country in post-processing if needed (disabled until country column exists)
    let filteredPitches = pitches || []
    /*
    if (country) {
      filteredPitches = filteredPitches.filter((pitch: any) => {
        const startup = pitch.startups as any
        return startup?.country?.toLowerCase().includes(country.toLowerCase())
      })
    }
    */

    // Get total count for pagination
    let countQuery = supabase
      .from('pitches')
      .select('*', { count: 'exact', head: true })

    // Apply same filters for count
    if (search) {
      countQuery = countQuery.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
    }
    
    if (sector) {
      // countQuery = countQuery.eq('sector', sector) // Disabled until sector column exists
    }
    
    if (location) {
      // countQuery = countQuery.ilike('location', `%${location}%`) // Disabled until location column exists
    }
    
    if (stage) {
      // countQuery = countQuery.eq('stage', stage) // Disabled until stage column exists
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
