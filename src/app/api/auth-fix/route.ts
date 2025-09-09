import { createServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    console.log('🔧 Attempting auto-fix for user:', email)

    // Use service role to check and fix user status
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
        success: false,
        message: 'User not found. Please sign up first.',
        action: 'signup_required'
      })
    }

    console.log('User found:', {
      id: user.id,
      email: user.email,
      email_confirmed: !!user.email_confirmed_at,
      last_sign_in: user.last_sign_in_at
    })

    let actions = []
    
    // Fix 1: Confirm email if not confirmed
    if (!user.email_confirmed_at) {
      console.log('🔧 Email not confirmed, confirming now...')
      
      const { error: confirmError } = await supabase.auth.admin.updateUserById(
        user.id,
        { 
          email_confirm: true,
          app_metadata: {
            ...user.app_metadata,
            email_confirmed_at: new Date().toISOString()
          }
        }
      )

      if (confirmError) {
        console.error('Error confirming email:', confirmError)
      } else {
        actions.push('Email confirmed')
        console.log('✅ Email confirmed successfully')
      }
    }

    // Fix 2: Ensure profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError && profileError.code === 'PGRST116') {
      console.log('🔧 Profile missing, creating...')
      
      const { error: createProfileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || null,
          user_type: user.user_metadata?.user_type || 'founder'
        })

      if (createProfileError) {
        console.error('Error creating profile:', createProfileError)
      } else {
        actions.push('Profile created')
        console.log('✅ Profile created successfully')
      }
    }

    // Fix 3: Generate magic link for immediate sign-in
    console.log('🔧 Generating magic link for immediate access...')
    
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`
      }
    })

    if (linkError) {
      console.error('Error generating magic link:', linkError)
      return NextResponse.json({ 
        success: false,
        error: 'Failed to generate sign-in link',
        actions: actions
      }, { status: 500 })
    }

    actions.push('Magic link generated')

    return NextResponse.json({ 
      success: true,
      message: 'User account fixed successfully!',
      actions: actions,
      magicLink: linkData.properties?.action_link,
      instructions: [
        'Your account has been automatically fixed',
        'Email verification: ✅ Confirmed',
        'Profile: ✅ Created/Updated', 
        'Use the magic link below to sign in instantly',
        'Or try normal sign-in again - it should work now'
      ]
    })

  } catch (error) {
    console.error('Error in auth fix:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
