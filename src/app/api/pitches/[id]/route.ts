import { createServerClient } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { id: pitchId } = await params // Await params for Next.js 15

    if (!pitchId) {
      return NextResponse.json({ error: 'Pitch ID is required' }, { status: 400 })
    }

    const { data: pitch, error } = await supabase
      .from('pitches')
      .select(`
        id,
        title,
        content,
        pitch_type,
        funding_ask,
        upvote_count,
        created_at,
        updated_at,
        video_url,
        slide_url,
        startups:startup_id (
          id,
          name,
          logo_url,
          website_url,
          country,
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
    // Use admin client to bypass RLS for MVP testing
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    const { id: pitchId } = await params // Await params for Next.js 15
    const body = await request.json()

    if (!pitchId) {
      return NextResponse.json({ error: 'Pitch ID is required' }, { status: 400 })
    }

    // For MVP testing, skip auth check since you're the only user
    // TODO: Add proper auth when we have multiple users

    // Update the pitch
    const { data: updatedPitch, error: updateError } = await supabaseAdmin
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
      message: 'Pitch updated successfully!'
    })
  } catch (error) {
    console.error('Error updating pitch:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
