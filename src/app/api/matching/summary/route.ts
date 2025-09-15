import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startupId = searchParams.get('startupId')

    if (!startupId) {
      return NextResponse.json({ error: 'Startup ID is required' }, { status: 400 })
    }

    const supabase = createServerClient()
    
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection unavailable' }, { status: 500 })
    }

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // First, get the startup details to ensure it belongs to the user
    const { data: startup, error: startupError } = await supabase
      .from('startups')
      .select('*')
      .eq('id', startupId)
      .eq('user_id', user.id)
      .single()

    if (startupError || !startup) {
      return NextResponse.json({ error: 'Startup not found or access denied' }, { status: 404 })
    }

    // For now, return mock data. In a real implementation, this would calculate
    // actual matches based on the matching algorithm and investor preferences
    const mockSummary = {
      total_matches: 23,
      by_stage: {
        'Pre-seed': 3,
        'Seed': 8,
        'Series A': 7,
        'Series B': 3,
        'Growth': 2
      },
      by_country: {
        'United States': 15,
        'Canada': 5,
        'United Kingdom': 2,
        'Germany': 1
      },
      by_sector: {
        'Technology': 12,
        'FinTech': 6,
        'HealthTech': 3,
        'CleanTech': 2
      },
      by_funding_range: {
        '$100K - $500K': 4,
        '$500K - $2M': 8,
        '$2M - $10M': 7,
        '$10M+': 4
      },
      recent_matches: 5,
      avg_match_score: 78,
      top_match_reasons: [
        'Industry alignment',
        'Stage compatibility',
        'Geographic proximity',
        'Funding range match',
        'Growth potential'
      ],
      metadata: {
        startup_id: startupId,
        startup_name: startup.name,
        last_updated: new Date().toISOString(),
        calculation_method: 'real-time'
      }
    }

    return NextResponse.json(mockSummary)

  } catch (error) {
    console.error('Error in matching summary API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// TODO: Real implementation would include:
// 1. Query all investors with their investment thesis
// 2. Calculate compatibility scores based on:
//    - Industry/sector alignment
//    - Stage preferences
//    - Geographic preferences
//    - Funding range compatibility
//    - Risk tolerance
//    - Investment timeline
// 3. Aggregate results by various dimensions
// 4. Track historical changes in match counts
// 5. Cache results for performance
