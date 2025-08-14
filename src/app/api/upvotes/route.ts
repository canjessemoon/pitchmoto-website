import { createServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

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
      return NextResponse.json({ error: 'Only investors can upvote' }, { status: 403 })
    }

    // Check if already upvoted
    const { data: existingUpvote } = await supabase
      .from('upvotes')
      .select('id')
      .eq('user_id', user.id)
      .eq('pitch_id', pitch_id)
      .single()

    if (existingUpvote) {
      return NextResponse.json({ error: 'Already upvoted' }, { status: 409 })
    }

    // Create upvote
    const { data: upvote, error: upvoteError } = await supabase
      .from('upvotes')
      .insert([{
        user_id: user.id,
        pitch_id: pitch_id
      }])
      .select()
      .single()

    if (upvoteError) {
      return NextResponse.json({ error: 'Failed to create upvote' }, { status: 500 })
    }

    // Update upvote count on pitch
    const { error: updateError } = await supabase.rpc('increment_upvote_count', {
      pitch_id: pitch_id
    })

    if (updateError) {
      console.error('Failed to update upvote count:', updateError)
    }

    return NextResponse.json({ success: true, upvote })
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

    // Update upvote count on pitch
    const { error: updateError } = await supabase.rpc('decrement_upvote_count', {
      pitch_id: pitch_id
    })

    if (updateError) {
      console.error('Failed to update upvote count:', updateError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing upvote:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
