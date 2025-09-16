import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Function to create supabase admin client with build-time protection
function createSupabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
    return null
  }
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY
  )
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 })
    }

    const supabase = createSupabaseAdmin()
    
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase admin client not available' }, { status: 500 })
    }
    
    // Check auth.users table
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    const userInAuth = authUsers?.users?.find(u => u.email === email)
    
    // Check profiles table  
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
    
    return NextResponse.json({
      email,
      authUser: userInAuth ? {
        id: userInAuth.id,
        email: userInAuth.email,
        email_confirmed_at: userInAuth.email_confirmed_at,
        created_at: userInAuth.created_at,
        last_sign_in_at: userInAuth.last_sign_in_at,
        user_metadata: userInAuth.user_metadata
      } : null,
      profile: profiles?.[0] || null,
      authError: authError?.message,
      profileError: profileError?.message
    })
  } catch (error: any) {
    console.error('Debug auth error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
