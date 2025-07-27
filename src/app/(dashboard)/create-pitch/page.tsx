'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers'
import { storageHelpers } from '@/lib/storage-helpers'
import { pitchSchema } from '@/lib/validations'
import { ArrowLeft, ArrowRight, FileText, Upload, Check, AlertCircle, Building2 } from 'lucide-react'
import FileUpload from '@/components/ui/FileUpload'

// Form data interface
interface PitchFormData {
  startupId: string
  title: string
  content: string
  fundingAsk: number
  pitchType: 'slide' | 'video' | 'text'
  deckFile: File | null
  videoFile: File | null
  videoUrl: string
  onePagerFile: File | null
}

// Startup interface for selection
interface Startup {
  id: string
  name: string
  tagline: string
  industry: string
  stage: string
}

export default function CreatePitchPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [startups, setStartups] = useState<Startup[]>([])
  const [loadingStartups, setLoadingStartups] = useState(true)
  
  const [formData, setFormData] = useState<PitchFormData>({
    startupId: '',
    title: '',
    content: '',
    fundingAsk: 100000,
    pitchType: 'slide',
    deckFile: null,
    videoFile: null,
    videoUrl: '',
    onePagerFile: null
  })

  // Load user's startups on component mount
  useEffect(() => {
    if (user?.profile && user.profile.user_type === 'founder') {
      loadUserStartups()
    }
  }, [user])

  const loadUserStartups = async () => {
    try {
      const response = await fetch(`/api/startups/my-startups?founder_id=${user!.id}`)
      if (response.ok) {
        const data = await response.json()
        setStartups(data.startups || [])
      } else {
        console.error('Failed to load startups')
      }
    } catch (error) {
      console.error('Error loading startups:', error)
    } finally {
      setLoadingStartups(false)
    }
  }

  // Redirect if not a founder
  React.useEffect(() => {
    if (user?.profile && user.profile.user_type !== 'founder') {
      router.push('/dashboard')
    }
  }, [user?.profile, router])

  const updateFormData = (field: keyof PitchFormData, value: any) => {
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
        return formData.startupId !== ''
      case 2:
        return formData.title.length >= 5 && 
               formData.content.length >= 50 &&
               formData.fundingAsk >= 1000
      case 3:
        // At least one file should be uploaded or video URL provided
        return formData.deckFile || formData.videoUrl.trim() !== '' || formData.onePagerFile
      default:
        return true
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      console.log('Starting pitch creation process...')
      console.log('User ID:', user!.id)
      console.log('Form data:', formData)

      // Validate the form data
      const validationResult = pitchSchema.safeParse({
        title: formData.title,
        content: formData.content,
        pitchType: formData.pitchType
      })

      if (!validationResult.success) {
        console.error('Validation failed:', validationResult.error.issues)
        throw new Error(validationResult.error.issues[0].message)
      }

      console.log('Validation passed, creating pitch via API...')

      // Determine pitch type based on uploaded files
      let pitchType: 'slide' | 'video' | 'text' = 'text' // default
      if (formData.deckFile) {
        pitchType = 'slide'
      } else if (formData.videoUrl.trim() !== '') {
        pitchType = 'video'
      }

      console.log('Determined pitch type:', pitchType)

      // Create pitch via API route
      const response = await fetch('/api/pitches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startup_id: formData.startupId,
          title: formData.title,
          content: formData.content,
          pitch_type: pitchType,
          funding_ask: formData.fundingAsk
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

      const pitch = result.pitch

      if (!pitch) {
        throw new Error('No pitch data returned from API')
      }

      console.log('Pitch created successfully:', pitch.id)

      // TODO: Upload files and update pitch with file URLs
      // For now, skip file uploads to avoid complexity
      // This can be added in a future iteration

      console.log('Pitch creation completed successfully!')

      // Success! Redirect to dashboard
      router.push('/dashboard?tab=pitches&saved=true')

    } catch (error: any) {
      console.error('Error creating pitch:', error)
      setSubmitError(error.message || 'Failed to create pitch. Please try again.')
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
          <p className="text-gray-600">Only founders can create pitches.</p>
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
            <FileText className="h-8 w-8 text-[#405B53] mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">Create Your Pitch</h1>
          </div>
          <p className="text-gray-600">Share your startup story with potential investors</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  step <= currentStep
                    ? 'bg-[#405B53] text-white'
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
                  step <= currentStep ? 'bg-[#405B53]' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {/* Step 1: Select Startup */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Select Your Startup</h2>
                <p className="text-gray-600 mt-1">Which startup would you like to create a pitch for?</p>
              </div>

              {loadingStartups ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#405B53] mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your startups...</p>
                </div>
              ) : startups.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Startups Found</h3>
                  <p className="text-gray-600 mb-4">You need to create a startup before you can create a pitch.</p>
                  <button
                    onClick={() => router.push('/create-startup')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-indigo-500"
                  >
                    Create Startup First
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose Startup *
                  </label>
                  {startups.map((startup) => (
                    <div
                      key={startup.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        formData.startupId === startup.id
                          ? 'border-[#405B53] bg-[#405B53]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => updateFormData('startupId', startup.id)}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="startup"
                          value={startup.id}
                          checked={formData.startupId === startup.id}
                          onChange={() => updateFormData('startupId', startup.id)}
                          className="h-4 w-4 text-[#405B53] mr-3"
                        />
                        <div>
                          <h3 className="font-medium text-gray-900">{startup.name}</h3>
                          <p className="text-sm text-gray-600">{startup.tagline}</p>
                          <div className="flex space-x-4 text-xs text-gray-500 mt-1">
                            <span>{startup.industry}</span>
                            <span>•</span>
                            <span>{startup.stage}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Pitch Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Pitch Details</h2>
                <p className="text-gray-600 mt-1">Tell your story and make your ask</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pitch Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  placeholder="e.g., Revolutionizing How Startups Meet Investors"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#405B53] focus:border-transparent"
                />
                <p className="text-gray-500 text-sm mt-1">{formData.title.length}/5 characters minimum</p>
                {formData.title.length > 0 && formData.title.length < 5 && (
                  <p className="text-red-500 text-sm mt-1">Title must be at least 5 characters</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pitch Content * <span className="text-gray-500">(Your full pitch story)</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => updateFormData('content', e.target.value)}
                  placeholder="Tell investors about your startup: the problem you're solving, your solution, market opportunity, traction, team, and why you're the right founders to build this..."
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#405B53] focus:border-transparent"
                />
                <p className="text-gray-500 text-sm mt-1">{formData.content.length}/50 characters minimum</p>
                {formData.content.length > 0 && formData.content.length < 50 && (
                  <p className="text-red-500 text-sm mt-1">Content must be at least 50 characters</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Funding Ask * <span className="text-gray-500">(USD)</span>
                </label>
                <input
                  type="number"
                  value={formData.fundingAsk}
                  onChange={(e) => updateFormData('fundingAsk', parseInt(e.target.value) || 0)}
                  min="1000"
                  step="1000"
                  placeholder="100000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#405B53] focus:border-transparent"
                />
                <p className="text-gray-500 text-sm mt-1">
                  ${formData.fundingAsk.toLocaleString()} (minimum $1,000)
                </p>
              </div>
            </div>
          )}

          {/* Step 3: File Uploads */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Upload Pitch Materials</h2>
                <p className="text-gray-600 mt-1">Upload your deck, video, and supporting materials</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pitch Deck <span className="text-gray-500">(PDF - Recommended)</span>
                </label>
                <FileUpload
                  onUpload={async (file) => {
                    updateFormData('deckFile', file)
                    return { data: { url: 'preview' }, error: null }
                  }}
                  accept="application/pdf"
                  maxSize={50 * 1024 * 1024} // 50MB
                  uploadText="Upload Pitch Deck (PDF)"
                  validate={(file) => {
                    if (file.type !== 'application/pdf') {
                      return { valid: false, error: 'Please upload a PDF file' }
                    }
                    return { valid: true, error: null }
                  }}
                />
                <p className="text-gray-500 text-sm mt-1">
                  Upload your investor pitch deck (PDF format, max 50MB)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Pitch Video <span className="text-gray-500">(Option 1: Link - Recommended)</span>
                </label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => updateFormData('videoUrl', e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#405B53] focus:border-transparent"
                />
                <p className="text-gray-500 text-sm mt-1 mb-4">
                  <strong>Recommended:</strong> Share a link to your video pitch on YouTube, Vimeo, or other platforms
                </p>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-gray-500">Option 2: Upload Video File</span>
                </label>
                <FileUpload
                  onUpload={async (file) => {
                    updateFormData('videoFile', file)
                    return { data: { url: 'preview' }, error: null }
                  }}
                  accept="video/mp4,video/webm,video/quicktime"
                  maxSize={500 * 1024 * 1024} // 500MB
                  uploadText="Upload Pitch Video"
                  validate={(file) => {
                    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime']
                    if (!validTypes.includes(file.type)) {
                      return { valid: false, error: 'Please upload MP4, WebM, or QuickTime video' }
                    }
                    return { valid: true, error: null }
                  }}
                />
                <p className="text-gray-500 text-sm mt-1">
                  Upload a video file (MP4, WebM, or MOV format, max 500MB)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  One-Pager <span className="text-gray-500">(Optional)</span>
                </label>
                <FileUpload
                  onUpload={async (file) => {
                    updateFormData('onePagerFile', file)
                    return { data: { url: 'preview' }, error: null }
                  }}
                  accept="application/pdf"
                  maxSize={10 * 1024 * 1024} // 10MB
                  uploadText="Upload One-Pager (PDF)"
                  validate={(file) => {
                    if (file.type !== 'application/pdf') {
                      return { valid: false, error: 'Please upload a PDF file' }
                    }
                    return { valid: true, error: null }
                  }}
                />
                <p className="text-gray-500 text-sm mt-1">
                  Upload a one-page summary (PDF format, max 10MB)
                </p>
              </div>

              {!formData.deckFile && !formData.videoFile && !formData.videoUrl.trim() && !formData.onePagerFile && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-amber-700 text-sm">
                    Please upload at least one file (deck, video, or one-pager) or provide a video URL to continue.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Review & Save */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Review & Save</h2>
                <p className="text-gray-600 mt-1">Review your pitch details before saving as draft</p>
              </div>

              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{formData.title}</h3>
                  <p className="text-sm text-gray-600">
                    Startup: {startups.find(s => s.id === formData.startupId)?.name}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{formData.content}</p>
                </div>

                <div className="grid grid-cols-1 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Funding Ask:</span> ${formData.fundingAsk.toLocaleString()}
                  </div>
                </div>

                <div className="text-sm">
                  <span className="font-medium">Content Provided:</span>
                  <ul className="mt-1 space-y-1">
                    {formData.deckFile && <li>• Pitch Deck: {formData.deckFile.name}</li>}
                    {formData.videoFile && <li>• Video File: {formData.videoFile.name}</li>}
                    {formData.videoUrl.trim() && <li>• Video URL: {formData.videoUrl}</li>}
                    {formData.onePagerFile && <li>• One-Pager: {formData.onePagerFile.name}</li>}
                  </ul>
                </div>
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
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Save Pitch
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
