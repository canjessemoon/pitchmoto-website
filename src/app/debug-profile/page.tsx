'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/providers'
import { profileHelpers } from '@/lib/auth-helpers'

export default function DebugProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        console.log('Fetching profile for user:', user.id)
        const { data: profileData, error: profileError } = await profileHelpers.getProfile(user.id)
        
        console.log('Profile result:', { data: profileData, error: profileError })
        
        if (profileError) {
          setError(profileError.message || 'Unknown error')
        } else {
          setProfile(profileData)
        }
      } catch (err: any) {
        console.error('Profile fetch error:', err)
        setError(err.message || 'Unexpected error')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user])

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Debug Profile</h1>
        <p>Please sign in to view your profile data.</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Profile Information</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Auth User Data:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Profile Data:</h2>
          {error ? (
            <div className="text-red-600">Error: {error}</div>
          ) : (
            <pre className="text-sm overflow-auto">
              {JSON.stringify(profile, null, 2)}
            </pre>
          )}
        </div>

        <div className="bg-blue-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Expected Routing:</h2>
          <p>
            Based on profile.user_type: <strong>{profile?.user_type || 'undefined'}</strong>
          </p>
          <p>
            Should route to: <strong>
              {profile?.user_type === 'investor' ? '/app/startups' : 
               profile?.user_type === 'founder' ? '/dashboard' : 
               'unknown (defaulting to /dashboard)'}
            </strong>
          </p>
        </div>
      </div>
    </div>
  )
}
