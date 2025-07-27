import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client with service role key (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('API route: Startup creation request received')
    
    const body = await request.json()
    console.log('API route: Request body:', body)
    
    const { 
      founder_id,
      name,
      tagline,
      description,
      industry,
      stage,
      funding_goal,
      country,
      website_url 
    } = body

    // Validate required fields
    if (!founder_id || !name || !tagline || !description || !industry || !stage || !funding_goal) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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
        funding_goal,
        country: country || null,
        website_url: website_url || null
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
