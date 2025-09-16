'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/components/providers'
import { ArrowLeft, Save, X, Check, AlertCircle, FileText, Upload } from 'lucide-react'
import FileUpload from '@/components/ui/FileUpload'

// Form data interface
interface PitchFormData {
  startup_id: string
  title: string
  content: string
  funding_ask: number
  pitch_type: 'slide' | 'video' | 'text'
  video_url: string
  status: 'draft' | 'published'
  deckFile: File | null
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

export default function EditPitchPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const pitchId = params.id as string
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [startups, setStartups] = useState<Startup[]>([])
  const [loadingStartups, setLoadingStartups] = useState(true)
  
  const [formData, setFormData] = useState<PitchFormData>({
    startup_id: '',
    title: '',
    content: '',
    funding_ask: 100000,
    pitch_type: 'text',
    video_url: '',
    status: 'draft',
    deckFile: null,
    onePagerFile: null
  })

  const loadUserStartups = useCallback(async () => {
    if (!user?.id) return
    
    try {
      const response = await fetch(`/api/startups/my-startups?founder_id=${user.id}`)
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
  }, [user])

  const loadPitchData = useCallback(async () => {
    if (!pitchId || !user?.id) return
    
    try {
      const response = await fetch(`/api/pitches/${pitchId}`)
      if (response.ok) {
        const data = await response.json()
        const pitch = data.pitch
        
        setFormData({
          startup_id: pitch.startups?.id || '',
          title: pitch.title || '',
          content: pitch.content || '',
          funding_ask: pitch.funding_ask || 100000,
          pitch_type: pitch.pitch_type || 'text',
          video_url: pitch.video_url || '',
          status: pitch.status || 'draft',
          deckFile: null, // Files need to be re-uploaded
          onePagerFile: null
        })
      } else {
        console.error('Failed to load pitch')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error loading pitch:', error)
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }, [pitchId, user, router])

  // Load user's startups and pitch data on component mount
  useEffect(() => {
    if (user?.profile && user.profile.user_type === 'founder') {
      loadUserStartups()
      loadPitchData()
    }
  }, [user, loadUserStartups, loadPitchData])

  // Redirect if not a founder
  React.useEffect(() => {
    if (user?.profile && user.profile.user_type !== 'founder') {
      router.push('/dashboard')
    }
  }, [user?.profile, router])

  const updateFormData = (field: keyof PitchFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    return (
      formData.title.length >= 5 && 
      formData.content.length >= 50 &&
      formData.funding_ask >= 1000 &&
      formData.startup_id !== ''
    )
  }

  const handleSave = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      console.log('Updating pitch...', pitchId)
      
      if (!user?.id) {
        setSubmitError('User ID not found. Please try signing in again.')
        return
      }

      // Determine pitch type based on files/video
      let pitchType: 'slide' | 'video' | 'text' = 'text' // default
      if (formData.deckFile) {
        pitchType = 'slide'
      } else if (formData.video_url.trim() !== '') {
        pitchType = 'video'
      }

      // Update pitch via API route (always save as current status, don't change it)
      const response = await fetch(`/api/pitches/${pitchId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startup_id: formData.startup_id,
          title: formData.title,
          content: formData.content,
          pitch_type: pitchType,
          funding_ask: formData.funding_ask,
          video_url: formData.video_url,
          // Don't change status, keep current status
          status: formData.status
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API error:', errorData)
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      console.log('API response:', result)

      // Success! Redirect to dashboard
      router.push(`/dashboard?updated=true&status=${formData.status}`)

    } catch (error: any) {
      console.error('Error updating pitch:', error)
      setSubmitError(error.message || 'Failed to update pitch. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePublish = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      console.log('Publishing pitch...', pitchId)
      
      if (!user?.id) {
        setSubmitError('User ID not found. Please try signing in again.')
        return
      }

      // Determine pitch type based on files/video
      let pitchType: 'slide' | 'video' | 'text' = 'text' // default
      if (formData.deckFile) {
        pitchType = 'slide'
      } else if (formData.video_url.trim() !== '') {
        pitchType = 'video'
      }

      // Update pitch and publish
      const response = await fetch(`/api/pitches/${pitchId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startup_id: formData.startup_id,
          title: formData.title,
          content: formData.content,
          pitch_type: pitchType,
          funding_ask: formData.funding_ask,
          video_url: formData.video_url,
          status: 'published' // Force publish
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API error:', errorData)
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      console.log('API response:', result)

      // Success! Update local state and redirect
      setFormData(prev => ({ ...prev, status: 'published' }))
      router.push(`/dashboard?updated=true&status=published`)

    } catch (error: any) {
      console.error('Error publishing pitch:', error)
      setSubmitError(error.message || 'Failed to publish pitch. Please try again.')
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
          <p className="text-gray-600">Only founders can edit pitches.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#405B53] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pitch...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="mr-4 p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-[#405B53] mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Edit Your Pitch</h1>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-xs px-2 py-1 rounded ${
              formData.status === 'published' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {formData.status === 'published' ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="space-y-6">
            {/* Startup Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Startup *
              </label>
              {loadingStartups ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#405B53] mx-auto"></div>
                </div>
              ) : (
                <select
                  value={formData.startup_id}
                  onChange={(e) => updateFormData('startup_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#405B53] focus:border-transparent"
                >
                  <option value="">Select a startup...</option>
                  {startups.map((startup) => (
                    <option key={startup.id} value={startup.id}>
                      {startup.name} - {startup.tagline}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Pitch Title */}
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

            {/* Pitch Content */}
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

            {/* Funding Ask */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Funding Ask * <span className="text-gray-500">(USD)</span>
              </label>
              <input
                type="number"
                value={formData.funding_ask}
                onChange={(e) => updateFormData('funding_ask', parseInt(e.target.value) || 0)}
                min="1000"
                step="1000"
                placeholder="100000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#405B53] focus:border-transparent"
              />
              <p className="text-gray-500 text-sm mt-1">
                ${formData.funding_ask.toLocaleString()} (minimum $1,000)
              </p>
            </div>

            {/* Video URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Pitch URL <span className="text-gray-500">(Optional)</span>
              </label>
              <input
                type="url"
                value={formData.video_url}
                onChange={(e) => updateFormData('video_url', e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#405B53] focus:border-transparent"
              />
              <p className="text-gray-500 text-sm mt-1">
                Share a YouTube, Vimeo, or Loom link to your pitch video
              </p>
            </div>

            {/* Pitch Deck Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pitch Deck <span className="text-gray-500">(PDF - Optional)</span>
              </label>
              <FileUpload
                onUpload={async (file) => {
                  updateFormData('deckFile', file)
                  return { data: { url: 'preview' }, error: null }
                }}
                accept="application/pdf"
                maxSize={50 * 1024 * 1024} // 50MB
                uploadText="📎 Upload New Pitch Deck (PDF)"
                validate={(file) => {
                  if (file.type !== 'application/pdf') {
                    return { valid: false, error: 'Please upload a PDF file' }
                  }
                  return { valid: true, error: null }
                }}
              />
              <p className="text-gray-500 text-sm mt-1">
                📋 Upload a new pitch deck to replace the existing one (PDF format, max 50MB)
              </p>
            </div>

            {/* One-Pager Upload */}
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
                uploadText="📄 Upload New One-Pager (PDF)"
                validate={(file) => {
                  if (file.type !== 'application/pdf') {
                    return { valid: false, error: 'Please upload a PDF file' }
                  }
                  return { valid: true, error: null }
                }}
              />
              <p className="text-gray-500 text-sm mt-1">
                📝 Upload a new one-page summary to replace the existing one (PDF format, max 10MB)
              </p>
            </div>
          </div>

          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-6">
              <p className="text-red-700 text-sm">{submitError}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </button>

          <div className="flex space-x-3">
            <button
              onClick={() => handleSave()}
              disabled={isSubmitting || !validateForm()}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                isSubmitting || !validateForm()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  Save Changes
                </>
              )}
            </button>

            {formData.status === 'draft' && (
              <button
                onClick={() => handlePublish()}
                disabled={isSubmitting || !validateForm()}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                  isSubmitting || !validateForm()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Publishing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-1" />
                    Publish Now
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
