'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MATCHING_CONFIG } from '@/lib/matching'
import { INVESTOR_STAGES } from '@/lib/stages'
import { getCountryOptions, getCountryName } from '@/lib/countries'

// Validation schema
const thesisSchema = z.object({
  min_funding_ask: z.number().min(0),
  max_funding_ask: z.number().min(0),
  preferred_industries: z.array(z.string()),
  preferred_stages: z.array(z.string()),
  countries: z.array(z.string()),
  no_location_pref: z.boolean(),
  remote_ok: z.boolean(),
  keywords: z.array(z.string()),
  exclude_keywords: z.array(z.string()),
  industry_weight: z.number().min(0).max(1),
  stage_weight: z.number().min(0).max(1),
  funding_weight: z.number().min(0).max(1),
  location_weight: z.number().min(0).max(1),
  traction_weight: z.number().min(0).max(1),
  team_weight: z.number().min(0).max(1)
}).refine(
  (data) => data.min_funding_ask <= data.max_funding_ask,
  { message: "Minimum funding must be less than maximum funding", path: ["max_funding_ask"] }
).refine(
  (data) => data.no_location_pref || data.countries.length > 0,
  { message: "Either select 'No location preference' or choose at least one country", path: ["countries"] }
)

type ThesisFormData = z.infer<typeof thesisSchema>

// Export the type for use in other components
export type { ThesisFormData }

interface InvestmentThesisWizardProps {
  onComplete: (thesis: ThesisFormData) => void | Promise<void>
  onCancel: () => void
  existingThesis?: Partial<ThesisFormData>
  isLoading?: boolean
}

export default function InvestmentThesisWizard({
  onComplete,
  onCancel,
  existingThesis,
  isLoading = false
}: InvestmentThesisWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [keywordInput, setKeywordInput] = useState('')
  const [excludeKeywordInput, setExcludeKeywordInput] = useState('')

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<ThesisFormData>({
    resolver: zodResolver(thesisSchema),
    defaultValues: {
      min_funding_ask: 250000,
      max_funding_ask: 5000000,
      preferred_industries: [],
      preferred_stages: [],
      countries: [],
      no_location_pref: false,
      remote_ok: true,
      industry_weight: 0.25,
      stage_weight: 0.20,
      funding_weight: 0.15,
      location_weight: 0.10,
      traction_weight: 0.20,
      team_weight: 0.10,
      keywords: [],
      exclude_keywords: [],
      ...existingThesis
    }
  })

  const watchedWeights = watch([
    'industry_weight',
    'stage_weight', 
    'funding_weight',
    'location_weight',
    'traction_weight',
    'team_weight'
  ])

  const totalWeight = watchedWeights.reduce((sum, weight) => sum + (weight || 0), 0)

  const steps = [
    { id: 1, title: 'Investment Preferences', description: 'Define your investment criteria' },
    { id: 2, title: 'Scoring Weights', description: 'Set importance of each factor' },
    { id: 3, title: 'Keywords & Filters', description: 'Add search terms and exclusions' },
    { id: 4, title: 'Review & Complete', description: 'Review your investment thesis' }
  ]

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value.toLocaleString()}`
  }

  // Funding range helper functions for better granularity
  const getFundingSteps = () => [
    0, 25000, 50000, 75000, 100000, 150000, 200000, 250000, 300000, 350000, 400000, 450000, 500000,
    600000, 700000, 800000, 900000, 1000000, 1250000, 1500000, 1750000, 2000000, 2500000, 3000000,
    3500000, 4000000, 4500000, 5000000, 6000000, 7000000, 8000000, 9000000, 10000000, 12500000,
    15000000, 20000000, 25000000, 30000000, 40000000, 50000000, 75000000, 100000000
  ]

  const getClosestFundingValue = (targetValue: number) => {
    const steps = getFundingSteps()
    return steps.reduce((prev, curr) => 
      Math.abs(curr - targetValue) < Math.abs(prev - targetValue) ? curr : prev
    )
  }

  const getFundingSliderValue = (fundingValue: number) => {
    const steps = getFundingSteps()
    return steps.indexOf(fundingValue)
  }

  const getFundingFromSliderValue = (sliderValue: number) => {
    const steps = getFundingSteps()
    return steps[sliderValue] || 0
  }

  const addKeyword = (type: 'keywords' | 'exclude_keywords') => {
    const input = type === 'keywords' ? keywordInput : excludeKeywordInput
    if (!input.trim()) return

    const currentKeywords = watch(type)
    if (!currentKeywords.includes(input.trim())) {
      setValue(type, [...currentKeywords, input.trim()])
    }
    
    if (type === 'keywords') setKeywordInput('')
    else setExcludeKeywordInput('')
  }

  const removeKeyword = (type: 'keywords' | 'exclude_keywords', keyword: string) => {
    const currentKeywords = watch(type)
    setValue(type, currentKeywords.filter(k => k !== keyword))
  }

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onSubmit = (data: ThesisFormData) => {
    onComplete(data)
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Progress Header */}
      <div className="bg-[#405B53] text-white p-6">
        <h2 className="text-2xl font-bold mb-4">
          {existingThesis ? 'Update Investment Thesis' : 'Create Investment Thesis'}
        </h2>
        
        {/* Step Progress */}
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                ${currentStep >= step.id 
                  ? 'bg-[#E64E1B] text-white' 
                  : 'bg-[#8C948B] text-white'
                }
              `}>
                {step.id}
              </div>
              <div className="ml-2 hidden sm:block">
                <div className="text-sm font-medium">{step.title}</div>
                <div className="text-xs opacity-75">{step.description}</div>
              </div>
              {index < steps.length - 1 && (
                <div className="mx-4 w-8 h-px bg-[#8C948B]" />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
        {/* Step 1: Investment Preferences */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-[#405B53] mb-4">Investment Preferences</h3>
            
            {/* Funding Range */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Funding Ask
                  </label>
                  <Controller
                    name="min_funding_ask"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-3">
                        {/* Number Input */}
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="100000000"
                            step="25000"
                            value={field.value}
                            onChange={(e) => {
                              const newValue = Math.max(0, parseInt(e.target.value) || 0)
                              field.onChange(newValue)
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#405B53] focus:border-transparent"
                            placeholder="Enter amount"
                          />
                          <div className="absolute right-3 top-2 text-gray-500 text-sm">USD</div>
                        </div>
                        
                        {/* Slider */}
                        <input
                          type="range"
                          min="0"
                          max={getFundingSteps().length - 1}
                          step="1"
                          value={getFundingSliderValue(field.value)}
                          onChange={(e) => {
                            const newValue = getFundingFromSliderValue(parseInt(e.target.value))
                            field.onChange(newValue)
                          }}
                          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                        
                        <div className="text-center text-lg font-semibold text-[#405B53]">
                          {formatCurrency(field.value)}
                        </div>
                      </div>
                    )}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Funding Ask
                  </label>
                  <Controller
                    name="max_funding_ask"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-3">
                        {/* Number Input */}
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="100000000"
                            step="25000"
                            value={field.value}
                            onChange={(e) => {
                              const newValue = Math.max(0, parseInt(e.target.value) || 0)
                              field.onChange(newValue)
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#405B53] focus:border-transparent"
                            placeholder="Enter amount"
                          />
                          <div className="absolute right-3 top-2 text-gray-500 text-sm">USD</div>
                        </div>
                        
                        {/* Slider */}
                        <input
                          type="range"
                          min="0"
                          max={getFundingSteps().length - 1}
                          step="1"
                          value={getFundingSliderValue(field.value)}
                          onChange={(e) => {
                            const newValue = getFundingFromSliderValue(parseInt(e.target.value))
                            field.onChange(newValue)
                          }}
                          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                        
                        <div className="text-center text-lg font-semibold text-[#405B53]">
                          {formatCurrency(field.value)}
                        </div>
                      </div>
                    )}
                  />
                  {errors.max_funding_ask && (
                    <p className="text-red-500 text-sm mt-1">{errors.max_funding_ask.message}</p>
                  )}
                </div>
              </div>

              {/* Funding Range Quick Presets */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-3">💡 Quick Presets</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setValue('min_funding_ask', 100000)
                      setValue('max_funding_ask', 500000)
                    }}
                    className="px-3 py-2 text-xs bg-white border border-blue-300 rounded hover:bg-blue-50 transition-colors"
                  >
                    Pre-Seed
                    <div className="text-blue-600">$100K - $500K</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setValue('min_funding_ask', 500000)
                      setValue('max_funding_ask', 2000000)
                    }}
                    className="px-3 py-2 text-xs bg-white border border-blue-300 rounded hover:bg-blue-50 transition-colors"
                  >
                    Seed
                    <div className="text-blue-600">$500K - $2M</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setValue('min_funding_ask', 2000000)
                      setValue('max_funding_ask', 10000000)
                    }}
                    className="px-3 py-2 text-xs bg-white border border-blue-300 rounded hover:bg-blue-50 transition-colors"
                  >
                    Series A
                    <div className="text-blue-600">$2M - $10M</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setValue('min_funding_ask', 10000000)
                      setValue('max_funding_ask', 50000000)
                    }}
                    className="px-3 py-2 text-xs bg-white border border-blue-300 rounded hover:bg-blue-50 transition-colors"
                  >
                    Series B+
                    <div className="text-blue-600">$10M - $50M</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Industries */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Industries
              </label>
              <Controller
                name="preferred_industries"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {MATCHING_CONFIG.INDUSTRIES.map(industry => (
                      <label key={industry} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.value.includes(industry)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              field.onChange([...field.value, industry])
                            } else {
                              field.onChange(field.value.filter(i => i !== industry))
                            }
                          }}
                          className="rounded border-gray-300 text-[#E64E1B] focus:ring-[#E64E1B]"
                        />
                        <span className="text-sm">{industry}</span>
                      </label>
                    ))}
                  </div>
                )}
              />
            </div>

            {/* Stages */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Investment Stages
              </label>
              <Controller
                name="preferred_stages"
                control={control}
                render={({ field }) => (
                  <div className="space-y-3">
                    {INVESTOR_STAGES.map(stage => (
                      <label key={stage.value} className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={field.value.includes(stage.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              field.onChange([...field.value, stage.value])
                            } else {
                              field.onChange(field.value.filter(s => s !== stage.value))
                            }
                          }}
                          className="mt-1 rounded border-gray-300 text-[#E64E1B] focus:ring-[#E64E1B]"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{stage.label}</div>
                          <div className="text-sm text-gray-600 mt-1">{stage.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              />
            </div>
          </div>
        )}

        {/* Step 2: Scoring Weights */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-[#405B53] mb-4">Scoring Weights</h3>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
              <div className="flex items-center">
                <div className="text-yellow-600 mr-2">⚖️</div>
                <div>
                  <p className="text-sm text-yellow-800">
                    Adjust how important each factor is when scoring startup matches. 
                    Total should equal 1.0 for optimal results.
                  </p>
                  <p className="text-sm font-medium text-yellow-900 mt-1">
                    Current total: <span className={totalWeight === 1 ? 'text-green-600' : 'text-red-600'}>
                      {totalWeight.toFixed(2)}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { key: 'industry_weight', label: 'Industry Match', description: 'How important is industry alignment?' },
                { key: 'stage_weight', label: 'Stage Match', description: 'How important is startup stage?' },
                { key: 'funding_weight', label: 'Funding Range', description: 'How important is funding amount?' },
                { key: 'location_weight', label: 'Location', description: 'How important is geographic location?' },
                { key: 'traction_weight', label: 'Traction', description: 'How important are traction metrics?' },
                { key: 'team_weight', label: 'Team Quality', description: 'How important is the founding team?' }
              ].map(({ key, label, description }) => (
                <div key={key} className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                  </label>
                  <p className="text-xs text-gray-500 mb-3">{description}</p>
                  <Controller
                    name={key as keyof ThesisFormData}
                    control={control}
                    render={({ field }) => (
                      <div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={field.value as number}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>0%</span>
                          <span className="font-medium text-[#405B53]">
                            {Math.round((field.value as number) * 100)}%
                          </span>
                          <span>100%</span>
                        </div>
                      </div>
                    )}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Keywords & Filters */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-[#405B53] mb-4">Keywords & Filters</h3>
            
            {/* Keywords */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keywords (Optional)
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Add keywords to boost matches that mention these terms
              </p>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword('keywords'))}
                  placeholder="e.g., AI, SaaS, mobile"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-[#E64E1B] focus:border-[#E64E1B]"
                />
                <button
                  type="button"
                  onClick={() => addKeyword('keywords')}
                  className="px-4 py-2 bg-[#E64E1B] text-white rounded-md hover:bg-[#d63d0f] transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {watch('keywords').map((keyword) => (
                  <span
                    key={keyword}
                    className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => removeKeyword('keywords', keyword)}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Exclude Keywords */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exclude Keywords (Optional)
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Automatically exclude startups that mention these terms
              </p>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={excludeKeywordInput}
                  onChange={(e) => setExcludeKeywordInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword('exclude_keywords'))}
                  placeholder="e.g., crypto, gambling"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-[#E64E1B] focus:border-[#E64E1B]"
                />
                <button
                  type="button"
                  onClick={() => addKeyword('exclude_keywords')}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {watch('exclude_keywords').map((keyword) => (
                  <span
                    key={keyword}
                    className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => removeKeyword('exclude_keywords', keyword)}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Location Preferences */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Geographic Preferences
              </label>
              <p className="text-sm text-gray-500 mb-4">
                Pick the countries you invest in. We match on the startup's country.
              </p>
              
              {/* No location preference toggle */}
              <Controller
                name="no_location_pref"
                control={control}
                render={({ field }) => (
                  <div className="mb-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="rounded border-gray-300 text-[#E64E1B] focus:ring-[#E64E1B]"
                      />
                      <span className="text-sm font-medium">No location preference</span>
                    </label>
                    <p className="text-xs text-gray-500 ml-6">Ignore geography in matching</p>
                  </div>
                )}
              />

              {/* Country selector - disabled if no location preference */}
              <Controller
                name="countries"
                control={control}
                render={({ field }) => (
                  <div className={watch('no_location_pref') ? 'opacity-50 pointer-events-none' : ''}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Countries
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
                      {getCountryOptions().map(country => (
                        <label key={country.value} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.value.includes(country.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                field.onChange([...field.value, country.value])
                              } else {
                                field.onChange(field.value.filter(c => c !== country.value))
                              }
                            }}
                            className="rounded border-gray-300 text-[#E64E1B] focus:ring-[#E64E1B]"
                            disabled={watch('no_location_pref')}
                          />
                          <span className="text-sm">{country.label}</span>
                        </label>
                      ))}
                    </div>
                    {errors.countries && (
                      <p className="text-red-500 text-sm mt-1">{errors.countries.message}</p>
                    )}
                  </div>
                )}
              />

              {/* Remote/Distributed OK */}
              <Controller
                name="remote_ok"
                control={control}
                render={({ field }) => (
                  <div className="mt-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="rounded border-gray-300 text-[#E64E1B] focus:ring-[#E64E1B]"
                      />
                      <span className="text-sm">Remote / Distributed OK</span>
                    </label>
                    <p className="text-xs text-gray-500 ml-6">I invest in remote-first teams</p>
                  </div>
                )}
              />
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-[#405B53] mb-4">Review Your Investment Thesis</h3>
            
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Funding Range</h4>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(watch('min_funding_ask'))} - {formatCurrency(watch('max_funding_ask'))}
                  </p>
                </div>
              </div>

              {watch('preferred_industries').length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Preferred Industries</h4>
                  <p className="text-sm text-gray-600">{watch('preferred_industries').join(', ')}</p>
                </div>
              )}

              {watch('preferred_stages').length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Preferred Investment Stages</h4>
                  <p className="text-sm text-gray-600">
                    {watch('preferred_stages').map(stageValue => {
                      const stage = INVESTOR_STAGES.find(s => s.value === stageValue)
                      return stage?.label || stageValue
                    }).join(', ')}
                  </p>
                </div>
              )}

              {/* Location Preferences Review */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Geographic Preferences</h4>
                {watch('no_location_pref') ? (
                  <p className="text-sm text-gray-600">No location preference - Global</p>
                ) : watch('countries').length > 0 ? (
                  <p className="text-sm text-gray-600">
                    {watch('countries').map(code => getCountryName(code)).join(', ')}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 italic">No countries selected</p>
                )}
                {watch('remote_ok') && (
                  <p className="text-xs text-green-600 mt-1">✓ Remote/Distributed teams welcome</p>
                )}
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Scoring Weights</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  <div>Industry: {Math.round(watch('industry_weight') * 100)}%</div>
                  <div>Stage: {Math.round(watch('stage_weight') * 100)}%</div>
                  <div>Funding: {Math.round(watch('funding_weight') * 100)}%</div>
                  <div>Location: {Math.round(watch('location_weight') * 100)}%</div>
                  <div>Traction: {Math.round(watch('traction_weight') * 100)}%</div>
                  <div>Team: {Math.round(watch('team_weight') * 100)}%</div>
                </div>
              </div>

              {watch('keywords').length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Keywords</h4>
                  <p className="text-sm text-gray-600">{watch('keywords').join(', ')}</p>
                </div>
              )}

              {watch('exclude_keywords').length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Exclude Keywords</h4>
                  <p className="text-sm text-gray-600">{watch('exclude_keywords').join(', ')}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <div className="flex space-x-3">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
            )}
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>

          <div>
            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2 bg-[#E64E1B] text-white rounded-md hover:bg-[#d63d0f] transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading || !isValid}
                className="px-6 py-2 bg-[#E64E1B] text-white rounded-md hover:bg-[#d63d0f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Saving...' : (existingThesis ? 'Update Thesis' : 'Create Thesis')}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
