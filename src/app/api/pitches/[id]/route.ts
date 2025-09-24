import { createServerClient } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Use admin client for this query since we need to check ownership
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    const { id: pitchId } = await params // Await params for Next.js 15
    const { searchParams } = new URL(request.url)
    const requestingUserId = searchParams.get('user_id')

    if (!pitchId) {
      return NextResponse.json({ error: 'Pitch ID is required' }, { status: 400 })
    }
    
    // Build query - include startup relationship for ownership check
    const { data: pitch, error } = await supabaseAdmin
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
        status,
        startup:startups!inner (
          id,
          name,
          logo_url,
          website_url,
          country,
          description,
          founder_id
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

    // Authorization check:
    // - If pitch is published, allow anyone (for public viewing)
    // - If user ID is provided and matches the founder, allow (for editing)
    // - Otherwise, deny access
    const isOwner = requestingUserId && (pitch.startup as any).founder_id === requestingUserId
    const isPublished = pitch.status === 'published'
    
    if (!isPublished && !isOwner) {
      return NextResponse.json({ 
        error: 'Access denied: This pitch is not publicly available' 
      }, { status: 403 })
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
    // Use admin client for database operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    const { id: pitchId } = await params // Await params for Next.js 15
    const body = await request.json()
    
    // Extract user_id from request body for authentication
    const requestingUserId = body.user_id
    
    console.log('PATCH request - pitchId:', pitchId, 'requestingUserId:', requestingUserId)

    if (!pitchId) {
      return NextResponse.json({ error: 'Pitch ID is required' }, { status: 400 })
    }
    
    if (!requestingUserId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 401 })
    }

    // First, check if the pitch exists and get its startup info
    const { data: pitch, error: fetchError } = await supabaseAdmin
      .from('pitches')
      .select(`
        id,
        startup_id,
        startup:startups!inner (
          id,
          founder_id
        )
      `)
      .eq('id', pitchId)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Pitch not found' }, { status: 404 })
      }
      console.error('Fetch error:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch pitch' }, { status: 500 })
    }

    // Check if the user owns the startup that owns this pitch
    if ((pitch.startup as any).founder_id !== requestingUserId) {
      return NextResponse.json({ 
        error: 'Forbidden: You can only edit your own pitches' 
      }, { status: 403 })
    }

    // Remove user_id from body before updating the pitch
    const { user_id, ...updateData } = body

    // Update the pitch
    const { data: updatedPitch, error: updateError } = await supabaseAdmin
      .from('pitches')
      .update({
        ...updateData,
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
