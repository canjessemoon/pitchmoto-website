import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Function to create supabase admin client
function createSupabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null
  }
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseAdmin()
    
    if (!supabase) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 500 })
    }
    
    // Try to add columns one by one using direct SQL
    const columns = [
      'bio TEXT',
      'company TEXT', 
      'location TEXT',
      'website TEXT',
      'linkedin_url TEXT',
      'profile_picture_url TEXT'
    ]
    
    const results = []
    
    for (const column of columns) {
      try {
        const [columnName] = column.split(' ')
        
        // Try to add the column
        const { error } = await supabase
          .from('profiles')
          .select(columnName)
          .limit(1)
          
        if (error && error.code === '42703') {
          // Column doesn't exist, so we need to add it
          results.push(`Column ${columnName} needs to be added (error: ${error.message})`)
        } else {
          results.push(`Column ${columnName} already exists`)
        }
      } catch (err: any) {
        results.push(`Error checking column: ${err.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Column check completed',
      results,
      note: 'To add missing columns, you need to run the ADD_PROFILE_FIELDS.sql in Supabase dashboard'
    })
  } catch (error: any) {
    console.error('Add profile fields error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
