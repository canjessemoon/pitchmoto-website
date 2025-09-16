'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthUser } from '@/components/auth/use-auth-user'
import { LocationTypeahead } from '@/components/ui/LocationTypeahead'
import { AlertCircle, CheckCircle, Building, User, Globe, MapPin } from 'lucide-react'

interface ProfileForm {
  full_name: string
  bio: string
  location: string
  linkedin_url: string
  website: string
}

export default function InvestorProfilePage() {
  const router = useRouter()
  const { user, profile } = useAuthUser()
  const [formData, setFormData] = useState<ProfileForm>({
    full_name: '',
    bio: '',
    location: '',
    linkedin_url: '',
    website: ''
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Load existing profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        linkedin_url: profile.linkedin_url || '',
        website: profile.website || ''
      })
    }
  }, [profile])

  const handleChange = (field: keyof ProfileForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setSaved(false)
    setError('')
    setHasUnsavedChanges(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted!')
    console.log('User ID:', user?.id)
    console.log('Form data:', formData)
    
    if (!user?.id) {
      console.error('No user ID found')
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('Calling /api/profile...')
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          full_name: formData.full_name,
          bio: formData.bio,
          location: formData.location,
          linkedin_url: formData.linkedin_url,
          website: formData.website
        })
      })

      const result = await response.json()
      console.log('API response:', result)

      if (response.ok) {
        console.log('Profile updated successfully!')
        setSaved(true)
        setHasUnsavedChanges(false)
        setTimeout(() => setSaved(false), 3000) // Hide success message after 3 seconds
      } else {
        console.error('API error:', result.error)
        setError(result.error || 'Failed to update profile')
      }
    } catch (err) {
      console.error('Catch block error:', err)
      setError('Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (profile?.user_type !== 'investor') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">This page is only accessible to investors.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold">
                <span className="text-[#405B53]">Pitch</span>
                <span className="text-[#E64E1B]">Moto</span>
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <button
                onClick={() => router.push('/app/investors/dashboard')}
                className="text-sm font-medium text-gray-700 hover:text-[#E64E1B] transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={() => router.push('/app/investors/matches')}
                className="text-sm font-medium text-gray-700 hover:text-[#E64E1B] transition-colors"
              >
                Matches
              </button>
              <button
                onClick={() => router.push('/app/investors/thesis')}
                className="text-sm font-medium text-gray-700 hover:text-[#E64E1B] transition-colors"
              >
                Thesis
              </button>
              <button
                onClick={() => router.push('/app/investors/profile')}
                className="text-sm font-medium text-[#405B53] hover:text-[#E64E1B] transition-colors"
              >
                Profile
              </button>
              <span className="text-sm text-gray-700">
                Welcome, {profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Investor'}
              </span>
              <button
                onClick={() => router.push('/auth/signin')}
                className="text-sm font-medium text-gray-700 hover:text-[#E64E1B] transition-colors px-3 py-1 border border-gray-300 rounded"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900">Investor Profile</h1>
          {hasUnsavedChanges && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 animate-pulse">
              • Unsaved changes
            </span>
          )}
          {saved && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              ✓ Saved
            </span>
          )}
        </div>
        <p className="mt-2 text-gray-600">
          Manage your firm information and professional details. This information helps founders understand your investment focus and background.
        </p>
      </div>

      {/* Success/Error Messages */}
      {saved && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-6 animate-in fade-in-0 slide-in-from-top-2 duration-300">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-medium text-green-900 mb-1">
                Profile Updated Successfully! 🎉
              </h3>
              <p className="text-sm text-green-700 mb-2">
                Your firm information has been saved and is now visible to founders who view your profile.
              </p>
              <div className="text-xs text-green-600">
                Updated: {formData.full_name && `Name, `}
                {formData.bio && `Bio, `}
                {formData.location && `Location, `}
                {formData.linkedin_url && `LinkedIn, `}
                {formData.website && `Website, `}
                and other details.
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Your basic personal details and contact information.
            </p>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                id="full_name"
                type="text"
                value={formData.full_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('full_name', e.target.value)}
                placeholder="Your full name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700 mb-1">
                LinkedIn Profile
              </label>
              <input
                id="linkedin_url"
                type="url"
                value={formData.linkedin_url}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('linkedin_url', e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Firm Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Building className="h-5 w-5" />
              Firm & Investment Information
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Information about your investment firm and professional background.
            </p>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                Firm Description / Bio
              </label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('bio', e.target.value)}
                placeholder="Tell founders about your firm, investment focus, portfolio companies, and what makes you a valuable partner. Include firm name, role, AUM, check size, etc."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Include: Firm name, your role, portfolio highlights, investment thesis, check size range, value-add you provide
              </p>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="h-4 w-4 inline mr-1" />
                Firm Location
              </label>
              <LocationTypeahead
                value={formData.location}
                onChange={(value) => handleChange('location', value)}
                placeholder="e.g., San Francisco, CA, USA"
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                <Globe className="h-4 w-4 inline mr-1" />
                Firm Website
              </label>
              <input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('website', e.target.value)}
                placeholder="https://yourfirm.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`
              px-8 py-3 rounded-lg font-medium transition-all duration-200 focus:ring-2 focus:ring-offset-2
              ${loading 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : saved 
                  ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500' 
                  : 'bg-[#E64E1B] text-white hover:bg-[#d63f0d] focus:ring-[#E64E1B]'
              }
              ${loading ? 'animate-pulse' : ''}
            `}
          >
            <div className="flex items-center space-x-2">
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {saved && !loading && (
                <CheckCircle className="h-4 w-4" />
              )}
              <span>
                {loading 
                  ? 'Saving Profile...' 
                  : saved 
                    ? 'Profile Saved!' 
                    : hasUnsavedChanges 
                      ? 'Save Changes' 
                      : 'Save Profile'
                }
              </span>
            </div>
          </button>
        </div>
      </form>

      {/* Profile Tips */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">💡 Profile Tips</h3>
        </div>
        <div className="px-6 py-4">
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• <strong>Firm Description:</strong> Include your firm name, role, assets under management (AUM), typical check size, and investment focus areas</li>
            <li>• <strong>Value Proposition:</strong> Highlight what unique value you bring beyond capital (network, expertise, operational support)</li>
            <li>• <strong>Portfolio Examples:</strong> Mention notable investments or portfolio companies that demonstrate your experience</li>
            <li>• <strong>Decision Process:</strong> Briefly describe your investment process and timeline to help founders understand expectations</li>
            <li>• <strong>Professional Details:</strong> Your background, previous experience, and credentials that establish credibility</li>
          </ul>
        </div>
      </div>
      </div>
    </div>
  )
}