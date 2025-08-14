import { createServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const pitchId = params.id

    if (!pitchId) {
      return NextResponse.json({ error: 'Pitch ID is required' }, { status: 400 })
    }

    const { data: pitch, error } = await supabase
      .from('pitches')
      .select(`
        id,
        title,
        tagline,
        content,
        sector,
        location,
        stage,
        funding_ask,
        upvote_count,
        status,
        created_at,
        updated_at,
        video_url,
        deck_url,
        one_pager_url,
        startups:startup_id (
          id,
          name,
          logo_url,
          website_url,
          country,
          founded_year,
          team_size,
          description
        )
      `)
      .eq('id', pitchId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Pitch not found' }, { status: 404 })
      }
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch pitch' }, { status: 500 })
    }

    return NextResponse.json({ pitch })
  } catch (error) {
    console.error('Error fetching pitch:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const pitchId = params.id
    const body = await request.json()

    if (!pitchId) {
      return NextResponse.json({ error: 'Pitch ID is required' }, { status: 400 })
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized - No user found' }, { status: 401 })
    }

    console.log('Current user ID:', user.id)

    // Verify the pitch belongs to the user
    const { data: pitch, error: fetchError } = await supabase
      .from('pitches')
      .select(`
        id,
        startup_id,
        startups:startup_id (
          founder_id
        )
      `)
      .eq('id', pitchId)
      .single()

    if (fetchError || !pitch) {
      console.error('Pitch fetch error:', fetchError)
      return NextResponse.json({ error: 'Pitch not found' }, { status: 404 })
    }

    console.log('Pitch data:', JSON.stringify(pitch, null, 2))

    const startup = Array.isArray(pitch.startups) ? pitch.startups[0] : pitch.startups
    console.log('Startup founder_id:', startup?.founder_id)
    console.log('Current user id:', user.id)
    
    if (startup?.founder_id !== user.id) {
      return NextResponse.json({ 
        error: `Unauthorized - Pitch belongs to ${startup?.founder_id}, but you are ${user.id}` 
      }, { status: 403 })
    }

    // Update the pitch
    const { data: updatedPitch, error: updateError } = await supabase
      .from('pitches')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', pitchId)
      .select()
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ error: 'Failed to update pitch' }, { status: 500 })
    }

    return NextResponse.json({ 
      pitch: updatedPitch,
      message: body.status === 'published' ? 'Pitch published successfully!' : 'Pitch updated successfully!'
    })
  } catch (error) {
    console.error('Error updating pitch:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
