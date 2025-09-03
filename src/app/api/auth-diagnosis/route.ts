import { createServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    console.log('🔍 Checking auth status for:', email)

    // Use service role to check user status
    const supabase = createServerClient()
    
    // Get user by email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('Error listing users:', listError)
      return NextResponse.json({ error: 'Failed to check user status' }, { status: 500 })
    }

    const user = users.find((u: any) => u.email === email)
    
    if (!user) {
      return NextResponse.json({ 
        exists: false,
        message: 'User not found. Please sign up first.'
      })
    }

    // Check email confirmation status
    const isEmailConfirmed = !!user.email_confirmed_at
    const lastSignIn = user.last_sign_in_at
    const createdAt = user.created_at

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      exists: true,
      user: {
        id: user.id,
        email: user.email,
        email_confirmed: isEmailConfirmed,
        email_confirmed_at: user.email_confirmed_at,
        last_sign_in_at: lastSignIn,
        created_at: createdAt,
        phone_confirmed: !!user.phone_confirmed_at,
        banned_until: user.banned_until,
        app_metadata: user.app_metadata,
        user_metadata: user.user_metadata
      },
      profile: profile || null,
      profileError: profileError?.message || null,
      diagnosis: {
        needsEmailVerification: !isEmailConfirmed,
        hasProfile: !!profile,
        userType: profile?.user_type || 'unknown',
        canSignIn: isEmailConfirmed && !user.banned_until,
        recommendations: [
          ...(!isEmailConfirmed ? ['Verify email address'] : []),
          ...(!profile ? ['Create user profile'] : []),
          ...(user.banned_until ? ['Account is temporarily banned'] : [])
        ]
      }
    })

  } catch (error) {
    console.error('Error in auth diagnosis:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
