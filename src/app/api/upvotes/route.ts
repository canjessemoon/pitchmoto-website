import { createServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/upvotes?pitch_id=xxx - Get upvote status for a pitch
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const pitchId = searchParams.get('pitch_id')

    if (!pitchId) {
      return NextResponse.json({ error: 'pitch_id is required' }, { status: 400 })
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has upvoted this pitch
    const { data: upvote, error } = await supabase
      .from('upvotes')
      .select('*')
      .eq('user_id', user.id)
      .eq('pitch_id', pitchId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking upvote:', error)
      return NextResponse.json({ error: 'Failed to check upvote status' }, { status: 500 })
    }

    return NextResponse.json({ 
      hasUpvoted: !!upvote,
      upvoteId: upvote?.id || null
    })

  } catch (error) {
    console.error('Error in upvotes GET:', error)
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
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (profile?.user_type !== 'investor') {
      return NextResponse.json({ error: 'Only investors can upvote' }, { status: 403 })
    }

    // Check if already upvoted (toggle functionality)
    const { data: existingUpvote } = await supabase
      .from('upvotes')
      .select('id')
      .eq('user_id', user.id)
      .eq('pitch_id', pitch_id)
      .single()

    if (existingUpvote) {
      // Remove upvote (toggle off)
      const { error: deleteError } = await supabase
        .from('upvotes')
        .delete()
        .eq('id', existingUpvote.id)

      if (deleteError) {
        console.error('Error removing upvote:', deleteError)
        return NextResponse.json({ error: 'Failed to remove upvote' }, { status: 500 })
      }

      return NextResponse.json({ 
        action: 'removed',
        hasUpvoted: false,
        message: 'Upvote removed successfully'
      })
    } else {
      // Create upvote (toggle on)
      const { data: upvote, error: upvoteError } = await supabase
        .from('upvotes')
        .insert([{
          user_id: user.id,
          pitch_id: pitch_id
        }])
        .select()
        .single()

      if (upvoteError) {
        console.error('Error creating upvote:', upvoteError)
        return NextResponse.json({ error: 'Failed to create upvote' }, { status: 500 })
      }

      return NextResponse.json({ 
        action: 'added',
        hasUpvoted: true,
        upvoteId: upvote.id,
        message: 'Upvote added successfully'
      })
    }

  } catch (error) {
    console.error('Error creating upvote:', error)
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

    // Delete upvote
    const { error: deleteError } = await supabase
      .from('upvotes')
      .delete()
      .eq('user_id', user.id)
      .eq('pitch_id', pitch_id)

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to remove upvote' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      hasUpvoted: false,
      message: 'Upvote removed successfully'
    })
  } catch (error) {
    console.error('Error removing upvote:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
