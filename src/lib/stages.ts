// Stage definitions for founders and investors with mapping

export const FOUNDER_STAGES = [
  {
    value: 'Idea/Concept',
    label: 'Idea/Concept',
    description: 'Early stage with a business idea or concept, pre-product development'
  },
  {
    value: 'MVP/Prototype',
    label: 'MVP/Prototype', 
    description: 'Minimum viable product or prototype developed, initial testing phase'
  },
  {
    value: 'Early Revenue',
    label: 'Early Revenue',
    description: 'Product launched with initial customers and early revenue generation'
  },
  {
    value: 'Growth Stage',
    label: 'Growth Stage',
    description: 'Proven product-market fit with growing customer base and revenue'
  },
  {
    value: 'Scaling',
    label: 'Scaling',
    description: 'Rapidly expanding operations, team, and market presence'
  },
  {
    value: 'Pre-IPO',
    label: 'Pre-IPO',
    description: 'Mature company preparing for public offering or major exit'
  }
] as const

export const INVESTOR_STAGES = [
  {
    value: 'pre_seed',
    label: 'Pre-Seed',
    description: 'Very early stage companies, typically idea to early product development'
  },
  {
    value: 'seed',
    label: 'Seed',
    description: 'Early-stage companies with MVP/prototype seeking initial funding'
  },
  {
    value: 'series_a',
    label: 'Series A',
    description: 'Companies with proven product-market fit ready to scale'
  },
  {
    value: 'series_b',
    label: 'Series B',
    description: 'Growth-stage companies scaling operations and expanding market reach'
  },
  {
    value: 'series_c_growth',
    label: 'Series C / Growth',
    description: 'Mature companies with strong growth metrics seeking expansion capital'
  }
] as const

// Mapping from founder stages to investor stages for matching algorithm
export const STAGE_MAPPING: Record<string, string[]> = {
  'Idea/Concept': ['pre_seed'],
  'MVP/Prototype': ['pre_seed', 'seed'],
  'Early Revenue': ['seed'],
  'Growth Stage': ['series_a'],
  'Scaling': ['series_b'],
  'Pre-IPO': ['series_c_growth']
}

// Reverse mapping for display purposes
export const INVESTOR_TO_FOUNDER_MAPPING: Record<string, string[]> = {
  'pre_seed': ['Idea/Concept', 'MVP/Prototype'],
  'seed': ['MVP/Prototype', 'Early Revenue'],
  'series_a': ['Growth Stage'],
  'series_b': ['Scaling'],
  'series_c_growth': ['Pre-IPO']
}

// Helper functions
export function getFounderStages() {
  return FOUNDER_STAGES.map(stage => stage.value)
}

export function getInvestorStages() {
  return INVESTOR_STAGES.map(stage => stage.value)
}

export function mapFounderStageToInvestor(founderStage: string): string[] {
  return STAGE_MAPPING[founderStage] || []
}

export function mapInvestorStageToFounder(investorStage: string): string[] {
  return INVESTOR_TO_FOUNDER_MAPPING[investorStage] || []
}

export function getStageDescription(stage: string, userType: 'founder' | 'investor'): string {
  if (userType === 'founder') {
    const stageData = FOUNDER_STAGES.find(s => s.value === stage)
    return stageData?.description || ''
  } else {
    const stageData = INVESTOR_STAGES.find(s => s.value === stage)
    return stageData?.description || ''
  }
}
