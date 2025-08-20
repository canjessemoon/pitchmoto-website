'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers'
import { supabase } from '@/lib/supabase'
import { storageHelpers } from '@/lib/storage-helpers'
import { startupSchema } from '@/lib/validations'
import { ArrowLeft, ArrowRight, Building2, Upload, Check, AlertCircle } from 'lucide-react'
import FileUpload from '@/components/ui/FileUpload'

// Form data interface
interface StartupFormData {
  name: string
  tagline: string
  description: string
  industry: string
  stage: string
  fundingGoal: number
  country: string
  website: string
  logoFile: File | null
}

// Industry options
const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce', 
  'SaaS', 'Mobile Apps', 'AI/ML', 'Blockchain', 'IoT', 
  'Gaming', 'Media', 'Real Estate', 'Transportation', 'Food & Beverage',
  'Fashion', 'Travel', 'Sports', 'Energy', 'Other'
]

// Stage options
const STAGES = [
  'Idea/Concept',
  'MVP/Prototype', 
  'Early Revenue',
  'Growth Stage',
  'Scaling',
  'Pre-IPO'
]

// Country options for incorporation
const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 
  'France', 'Netherlands', 'Singapore', 'Switzerland', 'Ireland',
  'Denmark', 'Sweden', 'Norway', 'Finland', 'Belgium', 'Austria',
  'Israel', 'India', 'Japan', 'South Korea', 'Hong Kong', 'New Zealand',
  'Spain', 'Italy', 'Portugal', 'Luxembourg', 'Estonia', 'Lithuania',
  'Latvia', 'Poland', 'Czech Republic', 'Slovenia', 'Brazil', 'Mexico',
  'Argentina', 'Chile', 'Colombia', 'UAE', 'Saudi Arabia', 'South Africa',
  'Nigeria', 'Kenya', 'Ghana', 'Egypt', 'Morocco', 'Other'
]

export default function CreateStartupPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<StartupFormData>({
    name: '',
    tagline: '',
    description: '',
    industry: '',
    stage: '',
    fundingGoal: 100000,
    country: '',
    website: '',
    logoFile: null
  })

  // Redirect if not a founder
  React.useEffect(() => {
    if (user?.profile && user.profile.user_type !== 'founder') {
      router.push('/dashboard')
    }
  }, [user?.profile, router])

  const updateFormData = (field: keyof StartupFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return formData.name.length >= 2 && 
               formData.tagline.length >= 10 && 
               formData.description.length >= 50
      case 2:
        return formData.industry && formData.stage && formData.fundingGoal >= 1000
      case 3:
        return true // Optional fields
      default:
        return true
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      console.log('Starting startup creation process...')
      
      if (!user?.id) {
        setSubmitError('User ID not found. Please try signing in again.')
        return
      }
      
      console.log('User ID:', user.id)
      // Validate the form data
      const validationResult = startupSchema.safeParse({
        name: formData.name,
        tagline: formData.tagline,
        description: formData.description,
        industry: formData.industry,
        stage: formData.stage,
        fundingGoal: formData.fundingGoal,
        country: formData.country || undefined,
        website: formData.website || undefined
      })

      if (!validationResult.success) {
        console.error('Validation failed:', validationResult.error.issues)
        throw new Error(validationResult.error.issues[0].message)
      }

      console.log('Validation passed, creating startup via API...')

      // Create startup via API route instead of direct client call
      const response = await fetch('/api/startups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          founder_id: user.id,
          name: formData.name,
          tagline: formData.tagline,
          description: formData.description,
          industry: formData.industry,
          stage: formData.stage,
          funding_goal: formData.fundingGoal,
          country: formData.country || null,
          website_url: formData.website || null
        })
      })

      console.log('API response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API error:', errorData)
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      console.log('API response:', result)

      const startup = result.startup

      if (!startup) {
        throw new Error('No startup data returned from API')
      }

      console.log('Startup created successfully:', startup)

      // Skip logo upload for now to avoid timeout - we can add this later
      // TODO: Move logo upload to a separate step or make it asynchronous

      console.log('Startup creation completed successfully!')

      // Success! Redirect to startup dashboard
      router.push('/dashboard?tab=startup&created=true')

    } catch (error: any) {
      console.error('Error creating startup:', error)
      setSubmitError(error.message || 'Failed to create startup. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user || !user.profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#405B53] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (user.profile.user_type !== 'founder') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">Only founders can create startups.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-[#405B53] mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">Create Your Startup</h1>
          </div>
          <p className="text-gray-600">Tell investors about your company in 4 simple steps</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  step <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step < currentStep ? <Check className="h-4 w-4" /> : step}
              </div>
            ))}
          </div>
          <div className="flex space-x-1">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex-1 h-2 rounded ${
                  step <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
                <p className="text-gray-600 mt-1">What's your company called and what do you do?</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  placeholder="e.g., PitchMoto"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#405B53] focus:border-transparent"
                />
                {formData.name.length > 0 && formData.name.length < 2 && (
                  <p className="text-red-500 text-sm mt-1">Company name must be at least 2 characters</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tagline * <span className="text-gray-500">(One-liner describing what you do)</span>
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => updateFormData('tagline', e.target.value)}
                  placeholder="e.g., The platform where startups meet investors"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#405B53] focus:border-transparent"
                />
                <p className="text-gray-500 text-sm mt-1">{formData.tagline.length}/10 characters minimum</p>
                {formData.tagline.length > 0 && formData.tagline.length < 10 && (
                  <p className="text-red-500 text-sm mt-1">Tagline must be at least 10 characters</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description * <span className="text-gray-500">(Detailed explanation of your startup)</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="Describe your startup, the problem you're solving, your solution, and what makes you unique..."
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#405B53] focus:border-transparent"
                />
                <p className="text-gray-500 text-sm mt-1">{formData.description.length}/50 characters minimum</p>
                {formData.description.length > 0 && formData.description.length < 50 && (
                  <p className="text-red-500 text-sm mt-1">Description must be at least 50 characters</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Business Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Business Details</h2>
                <p className="text-gray-600 mt-1">Help investors understand your market and stage</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry *
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => updateFormData('industry', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#405B53] focus:border-transparent"
                >
                  <option value="">Select your industry</option>
                  {INDUSTRIES.map((industry) => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Stage *
                </label>
                <select
                  value={formData.stage}
                  onChange={(e) => updateFormData('stage', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#405B53] focus:border-transparent"
                >
                  <option value="">Select your current stage</option>
                  {STAGES.map((stage) => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Funding Goal * <span className="text-gray-500">(USD)</span>
                </label>
                <input
                  type="number"
                  value={formData.fundingGoal}
                  onChange={(e) => updateFormData('fundingGoal', parseInt(e.target.value) || 0)}
                  min="1000"
                  step="1000"
                  placeholder="100000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#405B53] focus:border-transparent"
                />
                <p className="text-gray-500 text-sm mt-1">
                  ${formData.fundingGoal.toLocaleString()} (minimum $1,000)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country of Incorporation <span className="text-gray-500">(Optional)</span>
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => updateFormData('country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#405B53] focus:border-transparent"
                >
                  <option value="">Select country where your business is incorporated</option>
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
                <p className="text-gray-500 text-sm mt-1">
                  This helps investors understand your legal jurisdiction
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Assets & Links */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Assets & Links</h2>
                <p className="text-gray-600 mt-1">Add your logo and website (optional but recommended)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Logo <span className="text-gray-500">(Optional)</span>
                </label>
                <FileUpload
                  onUpload={async (file) => {
                    updateFormData('logoFile', file)
                    return { data: { url: URL.createObjectURL(file) }, error: null }
                  }}
                  accept="image/jpeg,image/png,image/svg+xml,image/webp"
                  maxSize={2 * 1024 * 1024} // 2MB
                  uploadText="Upload Company Logo"
                  validate={(file) => {
                    const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']
                    if (!validTypes.includes(file.type)) {
                      return { valid: false, error: 'Please upload a JPG, PNG, SVG, or WebP image' }
                    }
                    return { valid: true, error: null }
                  }}
                />
                <p className="text-gray-500 text-sm mt-1">
                  Recommended: Square logo, PNG or SVG format, max 2MB
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website URL <span className="text-gray-500">(Optional)</span>
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => updateFormData('website', e.target.value)}
                  placeholder="https://yourcompany.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#405B53] focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Review & Submit</h2>
                <p className="text-gray-600 mt-1">Review your information before creating your startup</p>
              </div>

              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{formData.name}</h3>
                  <p className="text-gray-600 text-sm">{formData.tagline}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">{formData.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Industry:</span> {formData.industry}
                  </div>
                  <div>
                    <span className="font-medium">Stage:</span> {formData.stage}
                  </div>
                  <div>
                    <span className="font-medium">Funding Goal:</span> ${formData.fundingGoal.toLocaleString()}
                  </div>
                  {formData.website && (
                    <div>
                      <span className="font-medium">Website:</span> {formData.website}
                    </div>
                  )}
                </div>

                {formData.logoFile && (
                  <div>
                    <span className="font-medium text-sm">Logo:</span> {formData.logoFile.name}
                  </div>
                )}
              </div>

              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{submitError}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${
              currentStep === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Previous
          </button>

          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              disabled={!validateCurrentStep()}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                validateCurrentStep()
                  ? 'bg-blue-600 text-white hover:bg-indigo-500'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !validateCurrentStep()}
              className={`flex items-center px-6 py-2 rounded-md text-sm font-medium ${
                isSubmitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Create Startup
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
