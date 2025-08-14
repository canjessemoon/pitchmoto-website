import { createServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const pitch_id = searchParams.get('pitch_id')

    if (!pitch_id) {
      return NextResponse.json({ error: 'Pitch ID is required' }, { status: 400 })
    }

    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        updated_at,
        profiles:user_id (
          id,
          full_name,
          avatar_url,
          role
        )
      `)
      .eq('pitch_id', pitch_id)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
    }

    return NextResponse.json({ comments })
  } catch (error) {
    console.error('Error fetching comments:', error)
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

    const { pitch_id, content } = await request.json()

    if (!pitch_id || !content) {
      return NextResponse.json({ error: 'Pitch ID and content are required' }, { status: 400 })
    }

    // Validate content length
    if (content.trim().length < 1 || content.length > 2000) {
      return NextResponse.json({ error: 'Content must be between 1 and 2000 characters' }, { status: 400 })
    }

    // Create comment
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .insert([{
        user_id: user.id,
        pitch_id: pitch_id,
        content: content.trim()
      }])
      .select(`
        id,
        content,
        created_at,
        updated_at,
        profiles:user_id (
          id,
          full_name,
          avatar_url,
          role
        )
      `)
      .single()

    if (commentError) {
      return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
    }

    return NextResponse.json({ success: true, comment })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { comment_id, content } = await request.json()

    if (!comment_id || !content) {
      return NextResponse.json({ error: 'Comment ID and content are required' }, { status: 400 })
    }

    // Validate content length
    if (content.trim().length < 1 || content.length > 2000) {
      return NextResponse.json({ error: 'Content must be between 1 and 2000 characters' }, { status: 400 })
    }

    // Update comment (only if user owns it)
    const { data: comment, error: updateError } = await supabase
      .from('comments')
      .update({ content: content.trim() })
      .eq('id', comment_id)
      .eq('user_id', user.id)
      .select(`
        id,
        content,
        created_at,
        updated_at,
        profiles:user_id (
          id,
          full_name,
          avatar_url,
          role
        )
      `)
      .single()

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 })
    }

    return NextResponse.json({ success: true, comment })
  } catch (error) {
    console.error('Error updating comment:', error)
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
    const comment_id = searchParams.get('comment_id')

    if (!comment_id) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 })
    }

    // Delete comment (only if user owns it)
    const { error: deleteError } = await supabase
      .from('comments')
      .delete()
      .eq('id', comment_id)
      .eq('user_id', user.id)

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
