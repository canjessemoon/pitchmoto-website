import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId, email, fullName, userType } = await request.json()

    const supabase = createServerClient()
    
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection unavailable' }, { status: 500 })
    }

    // Check if user is authenticated (for self-service) or if this is an admin operation
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // For development, don't require authentication for profile fixes
    console.log('Auth user:', user?.id, 'Auth error:', authError)

    // For development, allow creating profiles without strict auth
    // In production, you'd want to restrict this more
    const targetUserId = userId
    const targetEmail = email  
    const targetFullName = fullName || 'Jian Yang'
    const targetUserType = userType || 'founder'

    if (!targetUserId || !targetEmail) {
      return NextResponse.json({ 
        error: 'Missing required fields', 
        details: 'userId and email are required' 
      }, { status: 400 })
    }

    // Create or update the user profile
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: targetUserId,
        email: targetEmail,
        full_name: targetFullName,
        user_type: targetUserType,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Profile creation error:', error)
      return NextResponse.json({ 
        error: 'Failed to create profile', 
        details: error.message,
        code: error.code
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      profile: data,
      message: 'Profile created/updated successfully' 
    })

  } catch (error) {
    console.error('Manual profile creation error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
