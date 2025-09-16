import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Function to create supabase admin client
function createSupabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
    return null
  }
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY
  )
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 })
    }

    const supabase = createSupabaseAdmin()
    
    if (!supabase) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 500 })
    }
    
    // Check profiles table only (safer than auth.users)
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, user_type, created_at')
      .eq('email', email)
      .limit(1)
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({
      email,
      found: profiles && profiles.length > 0,
      profile: profiles?.[0] || null
    })
  } catch (error: any) {
    console.error('Check email error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
