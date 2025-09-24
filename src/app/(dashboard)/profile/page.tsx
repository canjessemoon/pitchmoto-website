'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuthUser } from '@/components/auth/use-auth-user'
import { Button } from '@/components/ui/button'
import { LocationTypeahead } from '@/components/ui/LocationTypeahead'
import Link from 'next/link'

interface ProfileData {
  user_id: string
  email: string
  full_name: string
  user_type: 'founder' | 'investor'
  bio?: string
  location?: string
  linkedin_url?: string
}

interface PasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function ProfilePage() {
  const { user, profile, isLoading: authLoading } = useAuthUser()
  const router = useRouter()
  
  const [profileData, setProfileData] = useState<ProfileData>({
    user_id: '',
    full_name: '',
    email: '',
    user_type: 'investor'
  })
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [profileMessage, setProfileMessage] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin')
    }
  }, [user, authLoading, router])

  // Load user profile data
  useEffect(() => {
    if (user && profile) {
      setProfileData({
        user_id: profile.user_id || user.id || '',
        full_name: profile.full_name || '',
        email: profile.email || user.email || '',
        user_type: profile.user_type || 'investor',
        bio: profile.bio || '',
        location: profile.location || '',
        linkedin_url: profile.linkedin_url || ''
      })
    } else if (user && !profile) {
      // If no profile exists, use user data
      setProfileData({
        user_id: user.id || '',
        full_name: user.user_metadata?.full_name || '',
        email: user.email || '',
        user_type: user.user_metadata?.user_type || 'investor',
        bio: '',
        location: '',
        linkedin_url: ''
      })
    }
  }, [user, profile])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) {
      setProfileMessage('User not found. Please try signing in again.')
      return
    }
    
    setProfileLoading(true)
    setProfileMessage('')

    try {
      console.log('🔄 Starting profile update for user:', user.id)
      console.log('📝 Profile data:', profileData)
      
      // Use dedicated API endpoint instead of direct Supabase calls
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          profileData: {
            email: profileData.email,
            full_name: profileData.full_name,
            user_type: profileData.user_type,
            bio: profileData.bio,
            location: profileData.location,
            linkedin_url: profileData.linkedin_url
          }
        })
      })

      console.log('📡 API response status:', response.status)
      
      const result = await response.json()
      console.log('� API response:', result)

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile')
      }

      if (result.success) {
        console.log('✅ Profile updated successfully!')
        setProfileMessage('✅ Profile updated successfully!')
        
        // Update local state immediately
        if (result.data && result.data[0]) {
          setProfileData(prev => ({
            ...prev,
            ...result.data[0]
          }))
          console.log('📱 Local state updated')
        }
        
        // Update auth metadata (non-blocking)
        try {
          console.log('🔐 Updating auth metadata...')
          const { error: authError } = await supabase.auth.updateUser({
            data: {
              full_name: profileData.full_name,
              user_type: profileData.user_type
            }
          })
          
          if (authError) {
            console.error('⚠️ Auth metadata update error:', authError)
          } else {
            console.log('✅ Auth metadata updated successfully')
          }
        } catch (authErr) {
          console.error('⚠️ Auth update error:', authErr)
          // Don't fail the whole operation for auth update
        }
      } else {
        setProfileMessage(`❌ Failed to update profile: ${result.error || 'Unknown error'}`)
      }
    } catch (err) {
      console.error('❌ Profile update error:', err)
      if (err instanceof Error) {
        if (err.message.includes('timed out')) {
          setProfileMessage('⏱️ Profile update timed out. Please try again.')
        } else {
          setProfileMessage(`❌ Failed to update profile: ${err.message}`)
        }
      } else {
        setProfileMessage('❌ Failed to update profile. Please try again.')
      }
    } finally {
      setProfileLoading(false)
      console.log('🏁 Profile update operation completed')
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage('New passwords do not match.')
      return
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordMessage('Password must be at least 6 characters long.')
      return
    }
    
    setPasswordLoading(true)
    setPasswordMessage('')

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) {
        setPasswordMessage(`Failed to update password: ${error.message}`)
      } else {
        setPasswordMessage('Password updated successfully!')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      }
    } catch (err) {
      console.error('Password update error:', err)
      setPasswordMessage('Failed to update password. Please try again.')
    } finally {
      setPasswordLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E64E1B] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold">
                <span className="text-[#405B53]">Pitch</span>
                <span className="text-[#E64E1B]">Moto</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-sm text-gray-700 hover:text-gray-900"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account information and preferences</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-[#E64E1B] text-[#E64E1B]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'password'
                  ? 'border-[#E64E1B] text-[#E64E1B]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Change Password
            </button>
          </nav>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileData.full_name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#405B53] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#405B53] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type
                </label>
                <div className="p-3 bg-gray-50 rounded-md">
                  <span className="text-sm text-gray-600">
                    You are registered as an <strong className="text-gray-900 capitalize">{profileData.user_type}</strong>
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Contact support if you need to change your account type.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <LocationTypeahead
                  value={profileData.location || ''}
                  onChange={(value) => setProfileData(prev => ({ ...prev, location: value }))}
                  placeholder="e.g., San Francisco, CA, USA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  value={profileData.linkedin_url || ''}
                  onChange={(e) => setProfileData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                  placeholder="https://linkedin.com/in/yourname"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#405B53] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={profileData.bio || ''}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  placeholder="Tell us a bit about yourself..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#405B53] focus:border-transparent"
                />
              </div>

              {profileMessage && (
                <div className={`p-3 rounded-md ${
                  profileMessage.includes('successfully') 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-red-50 text-red-700'
                }`}>
                  {profileMessage}
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={profileLoading}
                  className="bg-[#E64E1B] hover:bg-[#d63e15] text-white"
                >
                  {profileLoading ? 'Updating...' : 'Update Profile'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handlePasswordUpdate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#405B53] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#405B53] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#405B53] focus:border-transparent"
                />
              </div>

              {passwordMessage && (
                <div className={`p-3 rounded-md ${
                  passwordMessage.includes('successfully') 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-red-50 text-red-700'
                }`}>
                  {passwordMessage}
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={passwordLoading}
                  className="bg-[#E64E1B] hover:bg-[#d63e15] text-white"
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Account Details - for support purposes */}
        {user && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <details className="group">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Account Details
              </summary>
              <div className="mt-2 text-xs text-gray-400 font-mono">
                User ID: {user.id}<br />
                Email: {user.email}
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  )
}
