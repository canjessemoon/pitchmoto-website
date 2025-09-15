'use client'

import { useAuthUser } from '@/components/auth/use-auth-user'
import { supabase } from '@/lib/supabase'
import { useState, useEffect } from 'react'

export default function DebugAuthPage() {
  const { user, profile, isLoading, error } = useAuthUser()
  const [authSession, setAuthSession] = useState<any>(null)
  const [profileData, setProfileData] = useState<any>(null)
  const [profileError, setProfileError] = useState<string | null>(null)

  useEffect(() => {
    checkAuthSession()
  }, [])

  useEffect(() => {
    if (user) {
      checkProfile()
    }
  }, [user])

  const checkAuthSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
      console.error('Session error:', error)
    }
    setAuthSession(session)
  }

  const checkProfile = async () => {
    if (!user?.id) return
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (error) {
        setProfileError(error.message)
      } else {
        setProfileData(data)
      }
    } catch (err: any) {
      setProfileError(err.message)
    }
  }

  const createProfile = async () => {
    if (!user?.id) return
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || null,
          user_type: 'founder' // Set as founder since you signed up as founder
        })
        .select()
        .single()
      
      if (error) {
        console.error('Failed to create profile:', error)
        alert('Failed to create profile: ' + error.message)
      } else {
        console.log('Profile created:', data)
        setProfileData(data)
        alert('Profile created successfully!')
      }
    } catch (err: any) {
      console.error('Error creating profile:', err)
      alert('Error creating profile: ' + err.message)
    }
  }

  const updateUserType = async () => {
    if (!user?.id) return
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ user_type: 'founder' })
        .eq('user_id', user.id)
        .select()
        .single()
      
      if (error) {
        console.error('Failed to update profile:', error)
        alert('Failed to update profile: ' + error.message)
      } else {
        console.log('Profile updated:', data)
        setProfileData(data)
        alert('Profile updated successfully!')
      }
    } catch (err: any) {
      console.error('Error updating profile:', err)
      alert('Error updating profile: ' + err.message)
    }
  }

  if (isLoading) {
    return <div className="p-8">Loading auth state...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
      
      <div className="space-y-6">
        {/* Auth User */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Auth User (from hook)</h2>
          {user ? (
            <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
              {JSON.stringify({
                id: user.id,
                email: user.email,
                email_confirmed_at: user.email_confirmed_at,
                user_metadata: user.user_metadata,
                app_metadata: user.app_metadata
              }, null, 2)}
            </pre>
          ) : (
            <p className="text-red-600">No user found</p>
          )}
          {error && (
            <p className="text-red-600 mt-2">Hook Error: {error}</p>
          )}
        </div>

        {/* Auth Session */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Auth Session</h2>
          {authSession ? (
            <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
              {JSON.stringify({
                user: {
                  id: authSession.user.id,
                  email: authSession.user.email,
                  email_confirmed_at: authSession.user.email_confirmed_at,
                  user_metadata: authSession.user.user_metadata
                },
                expires_at: authSession.expires_at
              }, null, 2)}
            </pre>
          ) : (
            <p className="text-red-600">No session found</p>
          )}
        </div>

        {/* Profile Data */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">User Profile (from hook)</h2>
          {profile ? (
            <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
              {JSON.stringify(profile, null, 2)}
            </pre>
          ) : (
            <p className="text-red-600">No profile found from hook</p>
          )}
        </div>

        {/* Profile Data Direct Query */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">User Profile (direct query)</h2>
          {profileData ? (
            <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
              {JSON.stringify(profileData, null, 2)}
            </pre>
          ) : profileError ? (
            <p className="text-red-600">Profile Error: {profileError}</p>
          ) : (
            <p className="text-yellow-600">No profile found</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Actions</h2>
          <div className="space-x-4">
            <button
              onClick={createProfile}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              disabled={!!profileData}
            >
              Create Founder Profile
            </button>
            <button
              onClick={updateUserType}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              disabled={!profileData}
            >
              Set User Type to Founder
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}