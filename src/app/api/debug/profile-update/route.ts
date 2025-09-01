import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    
    // Get the user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error:', sessionError)
      return NextResponse.json({ error: 'Session error', details: sessionError.message }, { status: 401 })
    }

    if (!session) {
      console.error('No session found')
      return NextResponse.json({ error: 'No session found' }, { status: 401 })
    }

    const user = session.user
    console.log('User ID from session:', user.id)
    
    // Get request body
    const body = await request.json()
    console.log('Update data:', body)
    
    // Try to get current profile first
    console.log('Fetching current profile...')
    const { data: currentProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (fetchError) {
      console.error('Error fetching current profile:', fetchError)
      return NextResponse.json({ 
        error: 'Failed to fetch current profile', 
        details: fetchError.message,
        code: fetchError.code 
      }, { status: 500 })
    }
    
    console.log('Current profile:', currentProfile)
    
    // Now try the update
    console.log('Attempting update...')
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: body.full_name || currentProfile.full_name,
        bio: body.bio || currentProfile.bio,
        company: body.company || currentProfile.company,
        location: body.location || currentProfile.location,
        website: body.website || currentProfile.website,
        linkedin_url: body.linkedin_url || currentProfile.linkedin_url
      })
      .eq('id', user.id)
      .select()
    
    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ 
        error: 'Update failed', 
        details: updateError.message,
        code: updateError.code,
        hint: updateError.hint 
      }, { status: 500 })
    }
    
    console.log('Update successful:', updateData)
    
    return NextResponse.json({ 
      success: true, 
      data: updateData,
      session: {
        user_id: user.id,
        email: user.email
      }
    })
    
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Unexpected error', 
      details: error.message 
    }, { status: 500 })
  }
}
