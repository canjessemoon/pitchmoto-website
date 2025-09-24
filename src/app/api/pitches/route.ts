import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'

// Function to create supabase admin client with build-time protection
function createSupabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
    return null
  }
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// Function to get user from session
async function getUserFromSession(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return null
    }

    // Check if environment variables are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return null
    }

    // Create a supabase client for user session verification
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // Try to get user from the session token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return null
    }

    return user
  } catch (error) {
    console.error('Error getting user from session:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = createSupabaseAdmin()
    
    // Handle build-time when environment variables are not available
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (userId) {
      // Founder view: Get pitches for specific user's startups
      console.log('API: Fetching pitches for user:', userId)

      // First, get the user's startups
      const { data: startups, error: startupsError } = await supabaseAdmin
        .from('startups')
        .select('id')
        .eq('founder_id', userId)

      if (startupsError) {
        console.error('Error fetching startups:', startupsError)
        return NextResponse.json(
          { error: 'Database error: ' + startupsError.message },
          { status: 500 }
        )
      }

      if (!startups || startups.length === 0) {
        // User has no startups, return empty array
        return NextResponse.json({ 
          success: true, 
          pitches: []
        })
      }

      const startupIds = startups.map((s: any) => s.id)

      // Get pitches for the user's startups
      const { data: pitches, error } = await supabaseAdmin
        .from('pitches')
        .select(`
          *,
          startup:startups (
            id,
            name,
            tagline
          )
        `)
        .in('startup_id', startupIds)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Database error:', error)
        return NextResponse.json(
          { error: 'Database error: ' + error.message },
          { status: 500 }
        )
      }

      console.log('Fetched user pitches:', pitches)

      return NextResponse.json({ 
        success: true, 
        pitches: pitches || []
      })
    } else {
      // Investor view: Get all published pitches for browsing
      console.log('API: Fetching all published pitches for browsing')

      const { data: pitches, error } = await supabaseAdmin
        .from('pitches')
        .select(`
          *,
          startup:startups (
            id,
            name,
            tagline,
            logo_url,
            country
          )
        `)
        .eq('status', 'published')  // Only show published pitches to investors
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Database error:', error)
        return NextResponse.json(
          { error: 'Database error: ' + error.message },
          { status: 500 }
        )
      }

      console.log('Fetched all pitches:', pitches?.length || 0)

      return NextResponse.json({ 
        success: true, 
        pitches: pitches || []
      })
    }

  } catch (error: any) {
    console.error('API error:', error)
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
    
    const body = await request.json()
    console.log('API: Creating pitch with data:', body)

    const { startup_id, title, content, pitch_type, funding_ask, slide_url, video_url } = body

    // Basic validation
    if (!startup_id || !title || !content || !pitch_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Prepare insert data
    const insertData: any = {
      startup_id,
      title,
      content,
      pitch_type,
      status: 'draft' // New pitches start as draft
    }

    // Add funding_ask if provided
    if (funding_ask) {
      insertData.funding_ask = funding_ask
    }

    // Add file URLs if provided
    if (slide_url) {
      insertData.slide_url = slide_url
    }
    
    if (video_url) {
      insertData.video_url = video_url
    }

    console.log('Inserting data:', insertData)

    // Insert pitch into database using service role
    const { data: pitch, error: insertError } = await supabaseAdmin
      .from('pitches')
      .insert(insertData)
      .select()
      .single()

    if (insertError) {
      console.error('Database error:', insertError)
      return NextResponse.json(
        { error: 'Database error: ' + insertError.message },
        { status: 500 }
      )
    }

    console.log('Pitch created successfully:', pitch)

    return NextResponse.json({ 
      success: true, 
      pitch: pitch 
    })

  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
