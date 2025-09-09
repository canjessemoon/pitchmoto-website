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
    const startup_id = searchParams.get('startup_id')

    if (startup_id) {
      // Check if specific startup is watchlisted
      const { data } = await supabase
        .from('watchlists')
        .select('id')
        .eq('investor_id', user.id)
        .eq('startup_id', startup_id)
        .single()

      return NextResponse.json({ isWatchlisted: !!data })
    } else {
      // Get all watchlisted startups
      const { data: watchlist, error } = await supabase
        .from('watchlists')
        .select(`
          id,
          created_at,
          startup:startup_id (
            id,
            name,
            tagline,
            description,
            industry,
            stage,
            funding_goal,
            current_funding,
            country,
            logo_url,
            website_url
          )
        `)
        .eq('investor_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching watchlist:', error)
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

    const { startup_id } = await request.json()

    if (!startup_id) {
      return NextResponse.json({ error: 'Startup ID is required' }, { status: 400 })
    }

    // Check if user is an investor
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (profile?.user_type !== 'investor') {
      return NextResponse.json({ error: 'Only investors can save to watchlist' }, { status: 403 })
    }

    // Check if already watchlisted (toggle functionality)
    const { data: existingEntry } = await supabase
      .from('watchlists')
      .select('id')
      .eq('investor_id', user.id)
      .eq('startup_id', startup_id)
      .single()

    if (existingEntry) {
      // Remove from watchlist (toggle off)
      const { error: deleteError } = await supabase
        .from('watchlists')
        .delete()
        .eq('id', existingEntry.id)

      if (deleteError) {
        console.error('Error removing from watchlist:', deleteError)
        return NextResponse.json({ error: 'Failed to remove from watchlist' }, { status: 500 })
      }

      return NextResponse.json({ 
        action: 'removed',
        isWatchlisted: false,
        message: 'Removed from watchlist successfully'
      })
    } else {
      // Add to watchlist (toggle on)
      const { data: watchlistEntry, error: insertError } = await supabase
        .from('watchlists')
        .insert([{
          investor_id: user.id,
          startup_id: startup_id
        }])
        .select()
        .single()

      if (insertError) {
        console.error('Error adding to watchlist:', insertError)
        return NextResponse.json({ error: 'Failed to add to watchlist' }, { status: 500 })
      }

      return NextResponse.json({ 
        action: 'added',
        isWatchlisted: true,
        watchlistId: watchlistEntry.id,
        message: 'Added to watchlist successfully'
      })
    }

  } catch (error) {
    console.error('Error handling watchlist:', error)
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
    const startup_id = searchParams.get('startup_id')

    if (!startup_id) {
      return NextResponse.json({ error: 'Startup ID is required' }, { status: 400 })
    }

    // Remove from watchlist
    const { error: deleteError } = await supabase
      .from('watchlists')
      .delete()
      .eq('investor_id', user.id)
      .eq('startup_id', startup_id)

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to remove from watchlist' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      isWatchlisted: false,
      message: 'Removed from watchlist successfully'
    })
  } catch (error) {
    console.error('Error removing from watchlist:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
