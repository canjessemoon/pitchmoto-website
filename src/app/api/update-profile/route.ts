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
    const { email, updates } = await request.json()
    
    if (!email || !updates) {
      return NextResponse.json({ error: 'Email and updates required' }, { status: 400 })
    }

    const supabase = createSupabaseAdmin()
    
    if (!supabase) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 500 })
    }
    
    // Update the profile
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('email', email)
      .select()
    
    if (error) {
      console.error('Update error:', error)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: data?.[0]
    })
  } catch (error: any) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
