import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Function to create supabase admin client
function createSupabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
    return null
  }
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY
  )
}

export async function POST(request: NextRequest) {
  try {
    const { email, userType } = await request.json()
    
    if (!email || !userType) {
      return NextResponse.json({ error: 'Email and userType required' }, { status: 400 })
    }

    if (!['founder', 'investor', 'admin'].includes(userType)) {
      return NextResponse.json({ error: 'Invalid userType' }, { status: 400 })
    }

    const supabase = createSupabaseAdmin()
    
    if (!supabase) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 500 })
    }
    
    // Update the user_type in profiles table
    const { data, error } = await supabase
      .from('profiles')
      .update({ user_type: userType })
      .eq('email', email)
      .select()
    
    if (error) {
      console.error('Update error:', error)
      return NextResponse.json({ error: 'Failed to update user type' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `User type updated to ${userType}`,
      profile: data?.[0]
    })
  } catch (error: any) {
    console.error('Fix user type error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
