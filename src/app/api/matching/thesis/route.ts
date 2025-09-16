import { NextRequest, NextResponse } from 'next/server'
import { supabase, createAdminClient } from '@/lib/supabase'
import { z } from 'zod'

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

// GET /api/matching/thesis - Get investor's active thesis
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({ error: 'Missing user_id parameter' }, { status: 400 })
    }

    // Use admin client to bypass RLS policies
    const adminSupabase = createAdminClient()
    
    if (!adminSupabase) {
      console.error('Admin client not available')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const { data: thesis, error } = await adminSupabase
      .from('investor_theses')
      .select('*')
      .eq('investor_id', userId)
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
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    // Use admin client to bypass RLS policies
    const adminSupabase = createAdminClient()
    
    if (!adminSupabase) {
      console.error('Admin client not available')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

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

    // Deactivate existing thesis first
    await adminSupabase
      .from('investor_theses')
      .update({ is_active: false })
      .eq('investor_id', userId)

    // Create new thesis
    const { data: thesis, error } = await adminSupabase
      .from('investor_theses')
      .insert({
        investor_id: userId,
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
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    // Use admin client to bypass RLS policies
    const adminSupabase = createAdminClient()
    
    if (!adminSupabase) {
      console.error('Admin client not available')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Validate input
    const validatedData = investorThesisSchema.partial().parse(body)

    // Update the active thesis
    const { data: thesis, error } = await adminSupabase
      .from('investor_theses')
      .update(validatedData)
      .eq('investor_id', userId)
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
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({ error: 'Missing user_id parameter' }, { status: 400 })
    }

    // Use admin client to bypass RLS policies
    const adminSupabase = createAdminClient()
    
    if (!adminSupabase) {
      console.error('Admin client not available')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Deactivate the thesis instead of deleting
    const { error } = await adminSupabase
      .from('investor_theses')
      .update({ is_active: false })
      .eq('investor_id', userId)
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
