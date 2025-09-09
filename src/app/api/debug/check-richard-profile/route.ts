import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email') || 'jdmoon+richard@gmail.com'
    
    // Check user_profiles table for Richard's profile
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('email', email)

    // Also check auth.users table
    const { data: authUsers, error: authError } = await supabaseAdmin
      .rpc('get_auth_user_by_email', { user_email: email })
      .single()

    // If no RPC function, try a different approach
    let authUser = null
    if (authError) {
      // Try to get all users and filter (less secure but for debugging)
      const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()
      authUser = users?.find(u => u.email === email) || null
    } else {
      authUser = authUsers
    }

    return NextResponse.json({
      email,
      timestamp: new Date().toISOString(),
      user_profiles: {
        found: profiles && profiles.length > 0,
        count: profiles?.length || 0,
        data: profiles || [],
        error: profileError?.message
      },
      auth_users: {
        found: !!authUser,
        data: authUser ? {
          id: (authUser as any).id,
          email: (authUser as any).email,
          created_at: (authUser as any).created_at,
          last_sign_in_at: (authUser as any).last_sign_in_at,
          user_metadata: (authUser as any).user_metadata
        } : null,
        error: authError?.message
      }
    })
  } catch (error) {
    console.error('Profile check error:', error)
    return NextResponse.json(
      { error: 'Failed to check profile', details: String(error) },
      { status: 500 }
    )
  }
}
