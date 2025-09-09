import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('Testing Supabase connection...')
    
    // Test 1: Basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true })
    
    console.log('Connection test result:', { connectionTest, connectionError })
    
    // Test 2: Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    console.log('Current user:', { user: user?.id, userError })
    
    // Test 3: Try to select profiles (without filtering)
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5)
    
    console.log('All profiles test:', { 
      count: allProfiles?.length, 
      error: allProfilesError,
      profiles: allProfiles?.map(p => ({ id: p.id, email: p.email }))
    })
    
    // Test 4: Check RLS policies
    const { data: policies, error: policyError } = await supabase.rpc('get_policies_info')
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      tests: {
        connection: { success: !connectionError, error: connectionError },
        currentUser: { 
          success: !userError, 
          userId: user?.id,
          userEmail: user?.email,
          error: userError 
        },
        profilesAccess: { 
          success: !allProfilesError, 
          count: allProfiles?.length || 0,
          error: allProfilesError 
        },
        rls: { error: policyError }
      },
      environment: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
      }
    })
  } catch (error) {
    console.error('Supabase test error:', error)
    return NextResponse.json(
      { 
        error: 'Test failed', 
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
