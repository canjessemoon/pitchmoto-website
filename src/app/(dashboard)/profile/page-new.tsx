'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuthUser } from '@/components/auth/use-auth-user'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ProfileData {
  first_name: string
  last_name: string
  email: string
  user_type: 'founder' | 'investor'
  bio?: string
  location?: string
  linkedin_url?: string
  twitter_url?: string
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
    first_name: '',
    last_name: '',
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
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || user.email || '',
        user_type: profile.user_type || 'investor',
        bio: profile.bio || '',
        location: profile.location || '',
        linkedin_url: profile.linkedin_url || '',
        twitter_url: profile.twitter_url || ''
      })
    } else if (user && !profile) {
      // If no profile exists, use user data
      setProfileData({
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
        email: user.email || '',
        user_type: user.user_metadata?.user_type || 'investor',
        bio: '',
        location: '',
        linkedin_url: '',
        twitter_url: ''
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
      const updateData = {
        user_id: user.id,
        email: profileData.email,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        user_type: profileData.user_type,
        bio: profileData.bio || null,
        location: profileData.location || null,
        linkedin_url: profileData.linkedin_url || null,
        twitter_url: profileData.twitter_url || null
      }

      const { error } = await supabase
        .from('user_profiles')
        .upsert(updateData, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        })

      if (error) {
        console.error('Profile update error:', error)
        setProfileMessage(`Failed to update profile: ${error.message}`)
      } else {
        setProfileMessage('Profile updated successfully!')
        
        // Also update auth user metadata
        await supabase.auth.updateUser({
          data: {
            first_name: profileData.first_name,
            last_name: profileData.last_name,
            user_type: profileData.user_type
          }
        })
      }
    } catch (err) {
      console.error('Profile update error:', err)
      setProfileMessage('Failed to update profile. Please try again.')
    } finally {
      setProfileLoading(false)
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
                href="/app/investors/dashboard"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileData.first_name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#405B53] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileData.last_name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
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
                <input
                  type="text"
                  value={profileData.location || ''}
                  onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., San Francisco, CA"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#405B53] focus:border-transparent"
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
                  Twitter Profile
                </label>
                <input
                  type="url"
                  value={profileData.twitter_url || ''}
                  onChange={(e) => setProfileData(prev => ({ ...prev, twitter_url: e.target.value }))}
                  placeholder="https://twitter.com/yourname"
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
      </div>
    </div>
  )
}
