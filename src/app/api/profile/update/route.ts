import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create admin client for reliable updates
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
    console.log('🔄 Profile update API called')
    
    const body = await request.json()
    const { userId, profileData } = body
    
    if (!userId) {
      console.error('❌ No userId provided')
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    console.log('👤 Updating profile for user:', userId)
    console.log('📝 Profile data:', profileData)
    
    // Add timeout to the operation
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database operation timed out')), 15000) // 15 second timeout
    })
    
    // Prepare update data
    const updateData = {
      user_id: userId,
      email: profileData.email,
      full_name: profileData.full_name,
      user_type: profileData.user_type,
      bio: profileData.bio || null,
      location: profileData.location || null,
      linkedin_url: profileData.linkedin_url || null,
      updated_at: new Date().toISOString()
    }
    
    console.log('💾 Executing upsert with data:', updateData)
    
    // Use admin client to bypass RLS and ensure reliability
    const upsertOperation = supabaseAdmin
      .from('user_profiles')
      .upsert(updateData, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      })
      .select()
    
    // Race between upsert and timeout
    const { data, error } = await Promise.race([
      upsertOperation,
      timeoutPromise
    ]) as any
    
    console.log('📥 Upsert result:', { data, error })
    
    if (error) {
      console.error('❌ Profile update error:', error)
      return NextResponse.json(
        { 
          error: error.message || 'Failed to update profile',
          details: error 
        },
        { status: 400 }
      )
    }
    
    console.log('✅ Profile updated successfully')
    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Profile updated successfully'
    })
    
  } catch (error) {
    console.error('❌ Profile update API error:', error)
    
    if (error instanceof Error && error.message.includes('timed out')) {
      return NextResponse.json(
        { error: 'Profile update timed out. Please try again.' },
        { status: 408 }
      )
    }
    
    return NextResponse.json(
      { error: 'Server error occurred', details: error },
      { status: 500 }
    )
  }
}