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
    const supabaseAdmin = createSupabaseAdmin()
    
    // Handle build-time when environment variables are not available
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }
    
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')
    
    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id parameter is required' },
        { status: 400 }
      )
    }

    console.log('API route: Fetching startups for user:', user_id)

    // Fetch startups for the user
    const { data: startups, error } = await supabaseAdmin
      .from('startups')
      .select('*')
      .eq('founder_id', user_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('API route: Database error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    console.log('API route: Fetched', startups?.length || 0, 'startups')

    return NextResponse.json({ 
      success: true, 
      startups: startups || []
    })

  } catch (error: any) {
    console.error('API route: Unexpected error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = createSupabaseAdmin()
    
    // Handle build-time when environment variables are not available
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }
    
    console.log('API route: Startup creation request received')
    
    const body = await request.json()
    console.log('API route: Request body:', body)
    console.log('API route: funding_goal value:', body.funding_goal, 'type:', typeof body.funding_goal)
    
    const { 
      founder_id,
      name,
      tagline,
      description,
      industry,
      stage,
      funding_goal,
      is_not_raising_funding,
      country,
      website_url,
      logo_url,
      tags
    } = body

    // Validate required fields (now allowing $0 funding_goal)
    if (!founder_id || !name || !tagline || !description || !industry || !stage || (funding_goal === undefined || funding_goal === null || funding_goal < 0)) {
      console.log('Validation failed:', { founder_id, name, tagline, description, industry, stage, funding_goal })
      return NextResponse.json(
        { error: 'Missing required fields or invalid funding goal' },
        { status: 400 }
      )
    }

    console.log('API route: Creating startup in database...')

    // Insert startup using server-side Supabase client with service role
    const { data: startup, error } = await supabaseAdmin
      .from('startups')
      .insert({
        founder_id,
        name,
        tagline,
        description,
        industry,
        stage,
        funding_ask: funding_goal, // Database expects funding_ask column
        funding_goal: funding_goal, // Also set funding_goal if it exists
        is_not_raising_funding: is_not_raising_funding || false,
        country: country || null,
        website_url: website_url || null,
        logo_url: logo_url || null,
        tags: tags || []
      })
      .select()
      .single()

    console.log('API route: Insert result:', { startup, error })

    if (error) {
      console.error('API route: Database error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    console.log('API route: Startup created successfully:', startup.id)

    return NextResponse.json({ 
      success: true, 
      startup 
    })

  } catch (error: any) {
    console.error('API route: Unexpected error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
