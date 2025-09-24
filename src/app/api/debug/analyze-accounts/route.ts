import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const adminSupabase = createAdminClient()
    
    if (!adminSupabase) {
      return NextResponse.json({ error: 'Admin client not available' }, { status: 500 })
    }

    const results = {
      mainAnalysis: [],
      summary: [],
      testFounders: [],
      orphanedProfiles: [],
      duplicateProfiles: [],
      investorThesis: [],
      founderStartups: [],
      allAuthUsers: []
    }

    // 1. Main user analysis with profile data
    const { data: mainAnalysis, error: error1 } = await adminSupabase.rpc('exec_sql', {
      sql: `
        SELECT 
            au.id as user_id,
            au.email,
            au.email_confirmed_at,
            au.created_at as auth_created,
            au.last_sign_in_at,
            up.user_type,
            up.full_name,
            up.first_name,
            up.last_name,
            CASE 
                WHEN au.email_confirmed_at IS NULL THEN 'Email Not Verified'
                WHEN up.user_id IS NULL THEN 'No Profile Created'
                WHEN up.user_type IS NULL THEN 'No User Type Set'
                WHEN up.full_name IS NULL OR up.full_name = '' THEN 'Profile Incomplete'
                ELSE 'Profile Complete'
            END as account_status,
            CASE 
                WHEN au.email_confirmed_at IS NULL THEN '❌ Not Verified'
                ELSE '✅ Verified'
            END as email_status
        FROM auth.users au
        LEFT JOIN public.user_profiles up ON au.id = up.user_id
        WHERE au.email LIKE '%jdmoon%' OR au.email LIKE '%testfounder%' OR au.email LIKE '%testinvestor%'
        ORDER BY au.created_at DESC;
      `
    })

    if (error1) {
      console.error('Error in main analysis:', error1)
    } else {
      results.mainAnalysis = mainAnalysis || []
    }

    // 2. Summary counts by user type
    const { data: summary, error: error2 } = await adminSupabase
      .from('user_profiles')
      .select(`
        user_type,
        count:user_id.count(),
        users!inner(email_confirmed_at)
      `)
      .or('email.like.%jdmoon%,email.like.%testfounder%,email.like.%testinvestor%')

    if (error2) {
      console.error('Error in summary:', error2)
    } else {
      results.summary = summary || []
    }

    // 3. Test founder accounts (1-8)
    const { data: testFounders, error: error3 } = await adminSupabase
      .from('user_profiles')
      .select(`
        email,
        user_type,
        full_name,
        users!inner(email_confirmed_at)
      `)
      .like('email', 'jdmoon+testfounder_@gmail.com'.replace('_', '%'))

    if (error3) {
      console.error('Error in test founders:', error3)
    } else {
      results.testFounders = testFounders || []
    }

    // 4. Investment thesis status for investors
    const { data: investorThesis, error: error4 } = await adminSupabase
      .from('user_profiles')
      .select(`
        email,
        full_name,
        user_type,
        investor_theses(
          id,
          created_at,
          min_funding_ask,
          max_funding_ask,
          preferred_industries,
          preferred_stages,
          is_active
        )
      `)
      .eq('user_type', 'investor')
      .or('email.like.%jdmoon%,email.like.%testfounder%,email.like.%testinvestor%')

    if (error4) {
      console.error('Error in investor thesis:', error4)
    } else {
      results.investorThesis = investorThesis || []
    }

    // 5. Founder startups
    const { data: founderStartups, error: error5 } = await adminSupabase
      .from('user_profiles')
      .select(`
        email,
        user_type,
        startups(
          name,
          tagline,
          industry,
          stage,
          funding_ask,
          created_at,
          pitches(count)
        )
      `)
      .eq('user_type', 'founder')
      .or('email.like.%jdmoon%,email.like.%testfounder%,email.like.%testinvestor%')

    if (error5) {
      console.error('Error in founder startups:', error5)
    } else {
      results.founderStartups = founderStartups || []
    }

    // 6. All users in auth.users table
    const { data: allAuthUsers, error: error6 } = await adminSupabase.rpc('exec_sql', {
      sql: `
        SELECT 
            au.id,
            au.email,
            au.email_confirmed_at IS NOT NULL as email_verified,
            au.created_at,
            up.user_id IS NOT NULL as has_profile,
            up.user_type
        FROM auth.users au
        LEFT JOIN public.user_profiles up ON au.id = up.user_id
        WHERE au.email LIKE '%jdmoon%' OR au.email LIKE '%testfounder%' OR au.email LIKE '%testinvestor%'
        ORDER BY au.email;
      `
    })

    if (error6) {
      console.error('Error in all auth users:', error6)
    } else {
      results.allAuthUsers = allAuthUsers || []
    }

    return NextResponse.json({
      success: true,
      results,
      errors: {
        mainAnalysis: error1?.message,
        summary: error2?.message,
        testFounders: error3?.message,
        investorThesis: error4?.message,
        founderStartups: error5?.message,
        allAuthUsers: error6?.message
      }
    })

  } catch (error) {
    console.error('Error analyzing accounts:', error)
    return NextResponse.json({ 
      error: 'Failed to analyze accounts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}