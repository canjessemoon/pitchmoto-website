import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

export async function GET() {
  try {
    // Test 1: Try to select all columns from user_profiles (limit 1)
    const { data: sampleData, error: sampleError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .limit(1)

    // Test 2: Try specific column combinations that might exist
    const possibleSchemas = [
      'user_id, email, first_name, last_name, user_type',
      'user_id, email, full_name, user_type', 
      'id, email, first_name, last_name, user_type',
      'id, email, full_name, user_type'
    ]

    const schemaTests = []
    
    for (const schema of possibleSchemas) {
      try {
        const { data, error } = await supabaseAdmin
          .from('user_profiles')
          .select(schema)
          .limit(1)
        
        schemaTests.push({
          schema,
          success: !error,
          error: error?.message,
          hasData: !!data && data.length > 0
        })
      } catch (e) {
        schemaTests.push({
          schema,
          success: false,
          error: String(e)
        })
      }
    }

    return NextResponse.json({
      table_exists: true,
      sample_select: {
        success: !sampleError,
        error: sampleError?.message,
        columns_found: sampleData?.[0] ? Object.keys(sampleData[0]) : [],
        sample_data: sampleData?.[0] || null
      },
      schema_tests: schemaTests
    })
  } catch (error) {
    return NextResponse.json({ 
      error: String(error),
      table_exists: false 
    }, { status: 500 })
  }
}
