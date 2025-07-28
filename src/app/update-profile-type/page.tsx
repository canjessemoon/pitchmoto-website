'use client'

import { useState } from 'react'
import { useAuth } from '@/components/providers'
import { profileHelpers } from '@/lib/auth-helpers'
import { useRouter } from 'next/navigation'

export default function UpdateProfileTypePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const updateToInvestor = async () => {
    if (!user) {
      setMessage('Please sign in first')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      console.log('Updating profile to investor for user:', user.id)
      
      const { error } = await profileHelpers.updateProfile(user.id, {
        user_type: 'investor'
      })

      if (error) {
        console.error('Update error:', error)
        setMessage(`Error: ${error.message}`)
      } else {
        setMessage('✅ Successfully updated to investor! You can now sign out and sign back in.')
        console.log('Profile updated successfully')
        
        // Optionally redirect after a delay
        setTimeout(() => {
          router.push('/app/startups')
        }, 2000)
      }
    } catch (err: any) {
      console.error('Unexpected error:', err)
      setMessage(`Unexpected error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const updateToFounder = async () => {
    if (!user) {
      setMessage('Please sign in first')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      console.log('Updating profile to founder for user:', user.id)
      
      const { error } = await profileHelpers.updateProfile(user.id, {
        user_type: 'founder'
      })

      if (error) {
        console.error('Update error:', error)
        setMessage(`Error: ${error.message}`)
      } else {
        setMessage('✅ Successfully updated to founder! You can now sign out and sign back in.')
        console.log('Profile updated successfully')
        
        // Optionally redirect after a delay
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      }
    } catch (err: any) {
      console.error('Unexpected error:', err)
      setMessage(`Unexpected error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Update Profile Type</h1>
        <p>Please sign in to update your profile.</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Update Profile Type</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-6">
        <p><strong>Current Email:</strong> {user.email}</p>
        <p><strong>Current Type:</strong> {user.profile?.user_type}</p>
      </div>

      <div className="space-y-4">
        <button
          onClick={updateToInvestor}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Updating...' : 'Update to Investor Account'}
        </button>

        <button
          onClick={updateToFounder}
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Updating...' : 'Update to Founder Account'}
        </button>
      </div>

      {message && (
        <div className={`mt-4 p-4 rounded ${
          message.includes('✅') 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}

      <div className="mt-8 text-sm text-gray-600">
        <p><strong>Note:</strong> After updating your profile type:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>You may need to sign out and sign back in for changes to take effect</li>
          <li>Investor accounts will be routed to startup discovery (/app/startups)</li>
          <li>Founder accounts will be routed to the dashboard (/dashboard)</li>
        </ul>
      </div>
    </div>
  )
}
