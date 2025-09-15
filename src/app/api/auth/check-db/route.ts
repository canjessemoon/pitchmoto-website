import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection unavailable' }, { status: 500 })
    }

    // Check if we're in development mode
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Only available in development mode' }, { status: 403 })
    }

    // Test if user_profiles table exists by trying a simple query
    const { data: testData, error: testError } = await supabase
      .from('user_profiles')
      .select('user_id')
      .limit(1)

    if (testError) {
      console.error('Database test error:', testError)
      
      if (testError.code === '42P01') {
        return NextResponse.json({
          error: 'user_profiles table does not exist',
          solution: 'Please run the database initialization script in Supabase SQL editor',
          script: '/database/init-user-profiles.sql',
          details: testError.message
        }, { status: 500 })
      }
      
      return NextResponse.json({
        error: 'Database access error',
        details: testError.message
      }, { status: 500 })
    }

    // Test creating a dummy profile
    const testUserId = '00000000-0000-0000-0000-000000000000' // Test UUID
    const { data: createData, error: createError } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: testUserId,
        email: 'test@example.com',
        full_name: 'Test User',
        user_type: 'founder'
      })
      .select()

    if (createError) {
      return NextResponse.json({
        error: 'Cannot create profile',
        details: createError.message,
        hint: 'Check Row Level Security policies'
      }, { status: 500 })
    }

    // Clean up test data
    await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', testUserId)

    return NextResponse.json({
      success: true,
      message: 'Database is properly configured',
      tableExists: true,
      canInsert: true
    })

  } catch (error) {
    console.error('Database check error:', error)
    return NextResponse.json({
      error: 'Database check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
