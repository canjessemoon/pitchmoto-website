import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Test 1: List all tables in the public schema
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE')

    // Test 2: Check if user_profiles exists instead
    const { data: userProfilesTest, error: userProfilesError } = await supabaseAdmin
      .from('user_profiles')
      .select('count', { count: 'exact', head: true })

    // Test 3: Check what we can access
    const { data: authTest, error: authError } = await supabaseAdmin.auth.getUser()

    return NextResponse.json({
      database_tables: {
        success: !tablesError,
        tables: tables?.map(t => t.table_name) || [],
        error: tablesError?.message
      },
      user_profiles_table: {
        exists: !userProfilesError,
        error: userProfilesError?.message
      },
      auth_access: {
        success: !authError,
        error: authError?.message
      }
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
