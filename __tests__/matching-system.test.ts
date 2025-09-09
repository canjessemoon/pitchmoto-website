import { describe, test, expect, beforeEach } from '@jest/globals'
import { 
  calculateEnhancedMatchScore, 
  calculateKeywordScore,
  calculateAdvancedTractionScore,
  calculateRecencyFactor,
  calculateDiversityBonus,
  generateMatchAnalytics,
  ADVANCED_SCORING_CONFIG
} from '../src/lib/advanced-matching'

// Mock data for testing
const mockStartup = {
  id: 'startup-1',
  name: 'AI Healthcare Solutions',
  tagline: 'Revolutionary AI platform for medical diagnosis',
  description: 'We use artificial intelligence and machine learning to help doctors diagnose diseases faster and more accurately. Our platform integrates with existing hospital systems.',
  industry: 'Healthcare',
  stage: 'Seed',
  funding_goal: 2000000,
  current_funding: 500000,
  logo_url: 'https://example.com/logo.png',
  website_url: 'https://aihealthcare.com',
  created_at: '2025-08-01T10:00:00Z',
  updated_at: '2025-08-01T10:00:00Z',
  founder_id: 'founder-1',
  pitch_deck_url: 'https://example.com/deck.pdf',
  profiles: {
    id: 'founder-1',
    full_name: 'Dr. Jane Smith',
    bio: 'Former surgeon with 10+ years experience, PhD in Computer Science from Stanford. Previously founded two successful health tech startups.',
    company: 'AI Healthcare Solutions',
    location: 'San Francisco',
    linkedin_url: 'https://linkedin.com/in/janesmith',
    email: 'jane@aihealthcare.com',
    user_type: 'founder' as const,
    profile_picture_url: null,
    website: null,
    created_at: '2025-07-01T10:00:00Z',
    updated_at: '2025-07-01T10:00:00Z'
  }
}

const mockThesis = {
  id: 'thesis-1',
  investor_id: 'investor-1',
  min_funding_ask: 1000000,
  max_funding_ask: 5000000,
  preferred_industries: ['Healthcare', 'Technology'],
  preferred_stages: ['Seed', 'Series A'],
  preferred_locations: ['San Francisco', 'New York'],
  min_equity_percentage: 5.0,
  max_equity_percentage: 20.0,
  industry_weight: 0.25,
  stage_weight: 0.20,
  funding_weight: 0.15,
  location_weight: 0.10,
  traction_weight: 0.20,
  team_weight: 0.10,
  keywords: ['AI', 'healthcare', 'machine learning'],
  exclude_keywords: ['crypto', 'gambling'],
  is_active: true,
  created_at: '2025-07-15T10:00:00Z',
  updated_at: '2025-07-15T10:00:00Z'
}

describe('Enhanced Matching System', () => {
  describe('calculateKeywordScore', () => {
    test('should return high score for exact keyword matches', () => {
      const text = 'artificial intelligence machine learning healthcare platform'
      const keywords = ['AI', 'machine learning', 'healthcare']
      const excludeKeywords: string[] = []

      const result = calculateKeywordScore(text, keywords, excludeKeywords)

      expect(result.score).toBeGreaterThan(80)
      expect(result.matches).toHaveLength(3)
      expect(result.exclusions).toHaveLength(0)
    })

    test('should return zero score for excluded keywords', () => {
      const text = 'cryptocurrency blockchain betting platform'
      const keywords = ['blockchain', 'platform']
      const excludeKeywords = ['crypto', 'betting']

      const result = calculateKeywordScore(text, keywords, excludeKeywords)

      expect(result.score).toBe(0)
      expect(result.exclusions.length).toBeGreaterThan(0)
    })

    test('should handle semantic matching', () => {
      const text = 'artificial intelligence deep learning neural networks'
      const keywords = ['AI', 'machine learning']
      const excludeKeywords: string[] = []

      const result = calculateKeywordScore(text, keywords, excludeKeywords)

      expect(result.score).toBeGreaterThan(50)
      expect(result.matches.some(m => m.includes('artificial intelligence'))).toBe(true)
    })

    test('should return neutral score for no keywords', () => {
      const text = 'startup platform technology'
      const keywords: string[] = []
      const excludeKeywords: string[] = []

      const result = calculateKeywordScore(text, keywords, excludeKeywords)

      expect(result.score).toBe(80)
      expect(result.matches).toHaveLength(0)
    })
  })

  describe('calculateAdvancedTractionScore', () => {
    test('should calculate high traction score for well-funded startup', () => {
      const startup = {
        ...mockStartup,
        current_funding: 1800000, // 90% of goal
        website_url: 'https://example.com',
        pitch_deck_url: 'https://example.com/deck.pdf'
      }

      const result = calculateAdvancedTractionScore(startup)

      expect(result.score).toBeGreaterThan(80)
      expect(result.metrics.funding_progress).toBeGreaterThan(90)
      expect(result.details).toContain('Fully funded (90%)')
    })

    test('should calculate lower score for early-stage startup', () => {
      const startup = {
        ...mockStartup,
        current_funding: 50000, // 2.5% of goal
        website_url: null,
        pitch_deck_url: null,
        profiles: {
          ...mockStartup.profiles,
          bio: 'Basic bio'
        }
      }

      const result = calculateAdvancedTractionScore(startup)

      expect(result.score).toBeLessThan(60)
      expect(result.metrics.funding_progress).toBeLessThan(50)
    })

    test('should reward strong team profiles', () => {
      const startup = {
        ...mockStartup,
        profiles: {
          ...mockStartup.profiles,
          bio: 'Extensive background with 15+ years in healthcare technology, former CTO at major hospital system, published researcher with 20+ papers in medical AI',
          linkedin_url: 'https://linkedin.com/in/expert',
          company: 'Previous HealthTech Co'
        }
      }

      const result = calculateAdvancedTractionScore(startup)

      expect(result.metrics.team_strength).toBeGreaterThan(80)
      expect(result.details.some(d => d.includes('founder'))).toBe(true)
    })
  })

  describe('calculateRecencyFactor', () => {
    test('should return full score for fresh startups', () => {
      const recentDate = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() // 15 days ago
      const factor = calculateRecencyFactor(recentDate)

      expect(factor).toBe(1.0)
    })

    test('should apply decay for older startups', () => {
      const oldDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() // 60 days ago
      const factor = calculateRecencyFactor(oldDate)

      expect(factor).toBeLessThan(1.0)
      expect(factor).toBeGreaterThan(0.8) // Minimum threshold
    })
  })

  describe('calculateDiversityBonus', () => {
    test('should give bonus for new industry', () => {
      const existingMatches = [
        { startups: { industry: 'Technology', stage: 'Seed', profiles: { location: 'SF' } } },
        { startups: { industry: 'Technology', stage: 'Series A', profiles: { location: 'NY' } } }
      ]
      
      const newStartup = { ...mockStartup, industry: 'Healthcare' }
      
      const bonus = calculateDiversityBonus(existingMatches, newStartup)

      expect(bonus).toBeGreaterThan(0)
    })

    test('should give no bonus for same industry', () => {
      const existingMatches = [
        { startups: { industry: 'Healthcare', stage: 'Seed', profiles: { location: 'SF' } } }
      ]
      
      const newStartup = { ...mockStartup, industry: 'Healthcare' }
      
      const bonus = calculateDiversityBonus(existingMatches, newStartup)

      expect(bonus).toBeLessThan(ADVANCED_SCORING_CONFIG.DIVERSITY_BONUS.INDUSTRY_DIVERSITY * 100)
    })
  })

  describe('calculateEnhancedMatchScore', () => {
    test('should calculate comprehensive match score', () => {
      const result = calculateEnhancedMatchScore(mockStartup, mockThesis, [])

      expect(result.overall_score).toBeGreaterThan(0)
      expect(result.overall_score).toBeLessThanOrEqual(100)
      expect(result.industry_score).toBe(100) // Perfect match
      expect(result.stage_score).toBe(100) // Perfect match
      expect(result.funding_score).toBe(100) // Within range
      expect(result.keyword_score).toBeGreaterThan(80) // Strong keyword match
      expect(result.confidence_level).toBe('high')
    })

    test('should exclude startup with forbidden keywords', () => {
      const startupWithCrypto = {
        ...mockStartup,
        description: 'Healthcare platform using cryptocurrency payments and blockchain'
      }

      const result = calculateEnhancedMatchScore(startupWithCrypto, mockThesis, [])

      expect(result.overall_score).toBe(0)
      expect(result.match_reason).toContain('Excluded due to')
      expect(result.confidence_level).toBe('low')
    })

    test('should handle startup with no industry match', () => {
      const startupNoMatch = {
        ...mockStartup,
        industry: 'Agriculture' // Not in preferred industries
      }

      const result = calculateEnhancedMatchScore(startupNoMatch, mockThesis, [])

      expect(result.industry_score).toBe(0)
      expect(result.overall_score).toBeLessThan(70) // Lower due to poor industry match
    })

    test('should apply recency and diversity bonuses', () => {
      const recentStartup = {
        ...mockStartup,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
      }

      const existingMatches = [
        { startups: { industry: 'Technology', profiles: { location: 'Seattle' } } }
      ]

      const result = calculateEnhancedMatchScore(recentStartup, mockThesis, existingMatches)

      expect(result.recency_factor).toBe(1.0)
      expect(result.diversity_bonus).toBeGreaterThan(0)
      expect(result.overall_score).toBeGreaterThan(85) // Should be high with bonuses
    })
  })

  describe('generateMatchAnalytics', () => {
    test('should generate comprehensive analytics for matches', () => {
      const matches = [
        {
          overall_score: 85,
          confidence_level: 'high',
          startups: { industry: 'Healthcare', stage: 'Seed' }
        },
        {
          overall_score: 72,
          confidence_level: 'medium',
          startups: { industry: 'Technology', stage: 'Series A' }
        },
        {
          overall_score: 45,
          confidence_level: 'low',
          startups: { industry: 'Healthcare', stage: 'MVP' }
        }
      ]

      const analytics = generateMatchAnalytics(matches)

      expect(analytics.summary.total_matches).toBe(3)
      expect(analytics.summary.average_score).toBeCloseTo(67.3, 1)
      expect(analytics.summary.high_confidence_count).toBe(1)
      expect(analytics.summary.industry_distribution.Healthcare).toBe(2)
      expect(analytics.summary.industry_distribution.Technology).toBe(1)
      expect(analytics.insights).toContain('Found 3 matches')
      expect(analytics.recommendations.length).toBeGreaterThan(0)
    })

    test('should handle empty matches array', () => {
      const analytics = generateMatchAnalytics([])

      expect(analytics.summary.total_matches).toBe(0)
      expect(analytics.summary.average_score).toBe(0)
      expect(analytics.insights).toContain('No matches found')
      expect(analytics.recommendations).toContain('Review your industry preferences')
    })

    test('should provide specific recommendations based on data', () => {
      const lowQualityMatches = Array(10).fill(null).map((_, i) => ({
        overall_score: 30 + i,
        confidence_level: 'low',
        startups: { industry: 'Technology', stage: 'Idea' }
      }))

      const analytics = generateMatchAnalytics(lowQualityMatches)

      expect(analytics.summary.average_score).toBeLessThan(50)
      expect(analytics.recommendations).toContain('Consider adjusting your investment criteria for better matches')
    })
  })

  describe('Edge Cases and Error Handling', () => {
    test('should handle startup with missing data', () => {
      const incompleteStartup = {
        ...mockStartup,
        current_funding: 0,
        website_url: null,
        pitch_deck_url: null,
        profiles: null
      }

      const result = calculateEnhancedMatchScore(incompleteStartup, mockThesis, [])

      expect(result.overall_score).toBeGreaterThan(0) // Should still calculate
      expect(result.team_score).toBeLessThan(60) // Lower due to missing profile
      expect(result.traction_score).toBeLessThan(50) // Lower due to no funding/assets
    })

    test('should handle thesis with extreme weights', () => {
      const extremeThesis = {
        ...mockThesis,
        industry_weight: 1.0,
        stage_weight: 0.0,
        funding_weight: 0.0,
        location_weight: 0.0,
        traction_weight: 0.0,
        team_weight: 0.0
      }

      const result = calculateEnhancedMatchScore(mockStartup, extremeThesis, [])

      expect(result.overall_score).toBe(result.industry_score) // Should equal industry score
    })

    test('should handle very old startup dates', () => {
      const oldStartup = {
        ...mockStartup,
        created_at: '2020-01-01T10:00:00Z' // Very old
      }

      const result = calculateEnhancedMatchScore(oldStartup, mockThesis, [])

      expect(result.recency_factor).toBe(0.8) // Minimum threshold
      expect(result.overall_score).toBeGreaterThan(0)
    })
  })

  describe('Performance Tests', () => {
    test('should handle large numbers of existing matches efficiently', () => {
      const manyMatches = Array(1000).fill(null).map((_, i) => ({
        startups: { 
          industry: i % 2 === 0 ? 'Technology' : 'Healthcare',
          stage: 'Seed',
          profiles: { location: 'San Francisco' }
        }
      }))

      const start = Date.now()
      const result = calculateEnhancedMatchScore(mockStartup, mockThesis, manyMatches)
      const duration = Date.now() - start

      expect(duration).toBeLessThan(100) // Should complete within 100ms
      expect(result.overall_score).toBeGreaterThan(0)
    })
  })
})

// Integration test helpers
export function createTestStartup(overrides: Partial<typeof mockStartup> = {}) {
  return { ...mockStartup, ...overrides }
}

export function createTestThesis(overrides: Partial<typeof mockThesis> = {}) {
  return { ...mockThesis, ...overrides }
}

// Performance benchmarking helper
export function benchmarkMatchingPerformance(numStartups: number, numIterations: number = 1) {
  const startups = Array(numStartups).fill(null).map((_, i) => 
    createTestStartup({ 
      id: `startup-${i}`,
      name: `Startup ${i}`,
      industry: ['Technology', 'Healthcare', 'Finance'][i % 3],
      stage: ['Seed', 'Series A', 'Series B'][i % 3]
    })
  )

  const results = []
  
  for (let i = 0; i < numIterations; i++) {
    const start = Date.now()
    
    startups.forEach(startup => {
      calculateEnhancedMatchScore(startup, mockThesis, [])
    })
    
    const duration = Date.now() - start
    results.push(duration)
  }

  return {
    avg_duration: results.reduce((sum, d) => sum + d, 0) / results.length,
    min_duration: Math.min(...results),
    max_duration: Math.max(...results),
    startups_per_second: (numStartups * numIterations) / (results.reduce((sum, d) => sum + d, 0) / 1000)
  }
}
