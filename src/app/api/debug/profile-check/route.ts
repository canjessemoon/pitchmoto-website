import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 })
    }

    // Check auth.users
    const { data: { user }, error: authError } = await supabase.auth.admin.getUserByEmail(email)
    
    // Check profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()

    // Check by user ID if we have the user
    let profileById = null
    if (user) {
      const { data: profileByIdData, error: profileByIdError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      profileById = profileByIdData
    }

    return NextResponse.json({
      email,
      auth_user: user ? {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        user_metadata: user.user_metadata
      } : null,
      auth_error: authError?.message,
      profile_by_email: profile,
      profile_by_email_error: profileError?.message,
      profile_by_id: profileById,
      needs_profile_creation: !profile && !profileById
    })
  } catch (error) {
    console.error('Debug profile check error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}
