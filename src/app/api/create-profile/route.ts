import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { 
      userId, 
      email, 
      fullName, 
      userType = 'founder',
      linkedinUrl,
      websiteUrl
    } = await request.json()

    // Validate required fields
    if (!userId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and email' },
        { status: 400 }
      )
    }

    // Create admin client to bypass RLS
    const adminSupabase = createAdminClient()
    
    if (!adminSupabase) {
      console.error('Admin client not available - missing environment variables')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Insert profile using admin client (bypasses RLS)
    const { data, error } = await adminSupabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        email: email,
        full_name: fullName,
        first_name: fullName ? fullName.split(' ')[0] : null,
        last_name: fullName ? fullName.split(' ').slice(1).join(' ') || null : null,
        user_type: userType,
        bio: null,
        profile_image_url: null,
        location: null,
        linkedin_url: linkedinUrl || null,
        website: websiteUrl || null
      })
      .select()
      .single()

    if (error) {
      console.error('Profile creation failed in API route:', {
        error,
        code: error?.code,
        message: error?.message,
        details: error?.details,
        hint: error?.hint
      })

      // If it's a foreign key constraint error, the user might not exist yet
      if (error?.code === '23503') {
        return NextResponse.json(
          { error: 'User not found in auth system', code: error.code },
          { status: 400 }
        )
      }

      // If it's a unique constraint error, profile already exists
      if (error?.code === '23505') {
        console.log('Profile already exists, fetching existing profile')
        const { data: existingProfile, error: fetchError } = await adminSupabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (fetchError) {
          return NextResponse.json(
            { error: 'Profile exists but could not be retrieved', code: fetchError.code },
            { status: 500 }
          )
        }

        return NextResponse.json({ 
          success: true, 
          profile: existingProfile,
          message: 'Profile already exists'
        })
      }

      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 500 }
      )
    }

    console.log('✅ Profile created successfully via API route:', {
      userId,
      userType,
      profileId: data?.user_id
    })

    return NextResponse.json({ 
      success: true, 
      profile: data 
    })

  } catch (err) {
    console.error('Profile creation API route exception:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}