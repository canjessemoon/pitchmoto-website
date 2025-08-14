import { createServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const pitch_id = searchParams.get('pitch_id')

    if (pitch_id) {
      // Check if specific pitch is watchlisted
      const { data } = await supabase
        .from('watchlists')
        .select('id')
        .eq('user_id', user.id)
        .eq('pitch_id', pitch_id)
        .single()

      return NextResponse.json({ isWatchlisted: !!data })
    } else {
      // Get all watchlisted pitches
      const { data: watchlist, error } = await supabase
        .from('watchlists')
        .select(`
          id,
          created_at,
          pitches:pitch_id (
            id,
            title,
            tagline,
            sector,
            location,
            stage,
            funding_ask,
            upvote_count,
            created_at,
            startups:startup_id (
              id,
              name,
              logo_url,
              country
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        return NextResponse.json({ error: 'Failed to fetch watchlist' }, { status: 500 })
      }

      return NextResponse.json({ watchlist })
    }
  } catch (error) {
    console.error('Error handling watchlist request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { pitch_id } = await request.json()

    if (!pitch_id) {
      return NextResponse.json({ error: 'Pitch ID is required' }, { status: 400 })
    }

    // Check if user is an investor
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'investor') {
      return NextResponse.json({ error: 'Only investors can save to watchlist' }, { status: 403 })
    }

    // Check if already watchlisted
    const { data: existingEntry } = await supabase
      .from('watchlists')
      .select('id')
      .eq('user_id', user.id)
      .eq('pitch_id', pitch_id)
      .single()

    if (existingEntry) {
      return NextResponse.json({ error: 'Already in watchlist' }, { status: 409 })
    }

    // Add to watchlist
    const { data: watchlistEntry, error: insertError } = await supabase
      .from('watchlists')
      .insert([{
        user_id: user.id,
        pitch_id: pitch_id
      }])
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: 'Failed to add to watchlist' }, { status: 500 })
    }

    return NextResponse.json({ success: true, watchlistEntry })
  } catch (error) {
    console.error('Error adding to watchlist:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const pitch_id = searchParams.get('pitch_id')

    if (!pitch_id) {
      return NextResponse.json({ error: 'Pitch ID is required' }, { status: 400 })
    }

    // Remove from watchlist
    const { error: deleteError } = await supabase
      .from('watchlists')
      .delete()
      .eq('user_id', user.id)
      .eq('pitch_id', pitch_id)

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to remove from watchlist' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing from watchlist:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
