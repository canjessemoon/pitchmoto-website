import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create admin client for testing
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, profileData } = body
    
    console.log('Admin profile update for user:', userId)
    console.log('Profile data:', profileData)
    
    // Use admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .upsert({
        user_id: userId,
        ...profileData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
    
    console.log('Admin upsert result:', { data, error })
    
    if (error) {
      return NextResponse.json(
        { error: error.message, details: error },
        { status: 400 }
      )
    }
    
    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Profile updated successfully using admin client'
    })
  } catch (error) {
    console.error('Admin profile update error:', error)
    return NextResponse.json(
      { error: 'Server error', details: error },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }
    
    // Check if profile exists using admin client
    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    return NextResponse.json({
      profile,
      error: error?.message,
      exists: !!profile
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Server error', details: error },
      { status: 500 }
    )
  }
}
