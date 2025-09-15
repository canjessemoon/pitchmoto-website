import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { Database } from '@/types/database'

// Validation schema for investor thesis
const investorThesisSchema = z.object({
  min_funding_ask: z.number().min(0).default(0),
  max_funding_ask: z.number().min(0).default(10000000),
  preferred_industries: z.array(z.string()).default([]),
  preferred_stages: z.array(z.string()).default([]),
  countries: z.array(z.string()).default([]),
  no_location_pref: z.boolean().default(false),
  remote_ok: z.boolean().default(true),
  industry_weight: z.number().min(0).max(1).default(0.25),
  stage_weight: z.number().min(0).max(1).default(0.20),
  funding_weight: z.number().min(0).max(1).default(0.15),
  location_weight: z.number().min(0).max(1).default(0.10),
  traction_weight: z.number().min(0).max(1).default(0.20),
  team_weight: z.number().min(0).max(1).default(0.10),
  keywords: z.array(z.string()).default([]),
  exclude_keywords: z.array(z.string()).default([]),
  is_active: z.boolean().default(true)
})

function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${supabaseAnonKey}`
      }
    }
  })
}

function createSupabaseServerClient() {
  const cookieStore = cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: '', ...options })
      },
    },
  })
}

async function getAuthenticatedUser() {
  const supabase = createSupabaseServerClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return null
  }

  // Get user profile to check role
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.user_type !== 'investor') {
    return null
  }

  return { user, profile }
}

// GET /api/matching/thesis - Get investor's active thesis
export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user } = authResult
    const supabase = createSupabaseClient()

    const { data: thesis, error } = await supabase
      .from('investor_theses')
      .select('*')
      .eq('investor_id', user.id)
      .eq('is_active', true)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching thesis:', error)
      return NextResponse.json({ error: 'Failed to fetch thesis' }, { status: 500 })
    }

    return NextResponse.json({ thesis: thesis || null })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/matching/thesis - Create or update investor thesis
export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user } = authResult
    const body = await request.json()

    // Validate input
    const validatedData = investorThesisSchema.parse(body)

    // Additional validation: funding range
    if (validatedData.min_funding_ask > validatedData.max_funding_ask) {
      return NextResponse.json(
        { error: 'Minimum funding ask cannot be greater than maximum funding ask' },
        { status: 400 }
      )
    }

    // Additional validation: location preferences
    if (!validatedData.no_location_pref && validatedData.countries.length === 0) {
      return NextResponse.json(
        { error: 'Either select countries or enable "No location preference"' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseClient()

    // Deactivate existing thesis first
    await supabase
      .from('investor_theses')
      .update({ is_active: false })
      .eq('investor_id', user.id)

    // Create new thesis
    const { data: thesis, error } = await supabase
      .from('investor_theses')
      .insert({
        investor_id: user.id,
        ...validatedData
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating thesis:', error)
      return NextResponse.json({ error: 'Failed to create thesis' }, { status: 500 })
    }

    return NextResponse.json({ thesis }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/matching/thesis - Update existing thesis
export async function PUT(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user } = authResult
    const body = await request.json()

    // Validate input
    const validatedData = investorThesisSchema.partial().parse(body)

    const supabase = createSupabaseClient()

    // Update the active thesis
    const { data: thesis, error } = await supabase
      .from('investor_theses')
      .update(validatedData)
      .eq('investor_id', user.id)
      .eq('is_active', true)
      .select()
      .single()

    if (error) {
      console.error('Error updating thesis:', error)
      return NextResponse.json({ error: 'Failed to update thesis' }, { status: 500 })
    }

    return NextResponse.json({ thesis })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/matching/thesis - Deactivate thesis
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user } = authResult
    const supabase = createSupabaseClient()

    // Deactivate the thesis instead of deleting
    const { error } = await supabase
      .from('investor_theses')
      .update({ is_active: false })
      .eq('investor_id', user.id)
      .eq('is_active', true)

    if (error) {
      console.error('Error deactivating thesis:', error)
      return NextResponse.json({ error: 'Failed to deactivate thesis' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Thesis deactivated successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
