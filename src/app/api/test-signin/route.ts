import { createServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // For testing - sign in user directly without password verification
    console.log('🔄 Quick sign-in for testing:', email)

    // Use service role to bypass normal auth
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('Error listing users:', listError)
      return NextResponse.json({ error: 'Failed to find user' }, { status: 500 })
    }

    const user = users.find(u => u.email === email)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Generate a sign-in link for immediate access
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pitches`
      }
    })

    if (linkError) {
      console.error('Error generating sign-in link:', linkError)
      return NextResponse.json({ error: 'Failed to generate sign-in link' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Sign-in link generated',
      signInUrl: linkData.properties?.action_link,
      user: {
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at
      }
    })

  } catch (error) {
    console.error('Error in quick sign-in:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
