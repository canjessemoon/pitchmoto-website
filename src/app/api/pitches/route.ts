import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'

// Create supabase client with service role (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('API: Creating pitch with data:', body)

    const { startup_id, title, content, pitch_type, funding_ask } = body

    // Basic validation
    if (!startup_id || !title || !content || !pitch_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Prepare insert data - exclude funding_ask until column is added to database
    const insertData: any = {
      startup_id,
      title,
      content,
      pitch_type
    }

    // Add funding_ask if provided
    if (funding_ask) {
      insertData.funding_ask = funding_ask
    }

    console.log('Inserting data:', insertData)

    // Insert pitch into database using service role
    const { data: pitch, error: insertError } = await supabaseAdmin
      .from('pitches')
      .insert(insertData)
      .select()
      .single()

    if (insertError) {
      console.error('Database error:', insertError)
      return NextResponse.json(
        { error: 'Database error: ' + insertError.message },
        { status: 500 }
      )
    }

    console.log('Pitch created successfully:', pitch)

    return NextResponse.json({ 
      success: true, 
      pitch: pitch 
    })

  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
