import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email, fullName, userType } = await request.json()

    const supabase = createServerClient()
    
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection unavailable' }, { status: 500 })
    }

    // Get the current user from the session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Try to create/update the user profile
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        email: email || user.email,
        full_name: fullName || user.user_metadata?.full_name,
        user_type: userType || user.user_metadata?.user_type || 'founder',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Profile creation error:', error)
      
      // If the table doesn't exist, return a helpful message
      if (error.code === '42P01') {
        return NextResponse.json({ 
          error: 'Database table not found. Please contact support.',
          details: 'user_profiles table does not exist'
        }, { status: 500 })
      }
      
      // For other errors, return a generic message
      return NextResponse.json({ 
        error: 'Failed to create profile', 
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      profile: data,
      message: 'Profile created successfully' 
    })

  } catch (error) {
    console.error('Profile creation API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
