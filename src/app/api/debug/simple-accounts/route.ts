import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function GET() {
  try {
    const adminSupabase = createAdminClient()
    
    if (!adminSupabase) {
      return NextResponse.json({ error: 'Admin client not available' }, { status: 500 })
    }

    // Get all auth users with jdmoon emails
    const { data: authUsers, error: authError } = await adminSupabase
      .from('users')
      .select('id, email, email_confirmed_at, created_at')
      .or('email.like.%jdmoon%,email.like.%testfounder%,email.like.%testinvestor%')
      .order('email')

    // Get all user profiles with jdmoon emails  
    const { data: profiles, error: profileError } = await adminSupabase
      .from('user_profiles')
      .select('*')
      .or('email.like.%jdmoon%,email.like.%testfounder%,email.like.%testinvestor%')
      .order('email')

    // Get investor theses
    const { data: theses, error: thesesError } = await adminSupabase
      .from('investor_theses')
      .select('*, user_profiles!inner(email)')
      .or('user_profiles.email.like.%jdmoon%,user_profiles.email.like.%testfounder%,user_profiles.email.like.%testinvestor%')

    // Get startups
    const { data: startups, error: startupsError } = await adminSupabase
      .from('startups')
      .select('*, user_profiles!inner(email)')
      .or('user_profiles.email.like.%jdmoon%,user_profiles.email.like.%testfounder%,user_profiles.email.like.%testinvestor%')

    return NextResponse.json({
      authUsers: authUsers || [],
      profiles: profiles || [],
      theses: theses || [],
      startups: startups || [],
      errors: {
        authError: authError?.message,
        profileError: profileError?.message,
        thesesError: thesesError?.message,
        startupsError: startupsError?.message
      }
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      error: 'Failed to analyze accounts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}