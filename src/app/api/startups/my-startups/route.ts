import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create supabase client with service role (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Get founder_id from query parameters
    const { searchParams } = new URL(request.url)
    const founderId = searchParams.get('founder_id')

    if (!founderId) {
      return NextResponse.json(
        { error: 'founder_id is required' },
        { status: 400 }
      )
    }

    console.log('API: Fetching startups for founder:', founderId)

    // Fetch user's startups using service role
    const { data: startups, error: fetchError } = await supabaseAdmin
      .from('startups')
      .select('id, name, tagline, industry, stage')
      .eq('founder_id', founderId)
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('Database error:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch startups: ' + fetchError.message },
        { status: 500 }
      )
    }

    console.log('Found', startups?.length || 0, 'startups for founder')

    return NextResponse.json({ 
      success: true, 
      startups: startups || [] 
    })

  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
