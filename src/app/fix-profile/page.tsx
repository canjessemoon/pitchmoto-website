'use client'

import { useState } from 'react'
import { useAuth } from '@/components/providers'
import Link from 'next/link'

export default function FixProfilePage() {
  const { user } = useAuth()
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fixProfile = async () => {
    if (!user) {
      setResult({ error: 'Please sign in first' })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/fix-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          fullName: user.user_metadata?.full_name || 'Jian Yang',
          userType: 'founder' // Set this to the correct type
        })
      })
      
      const result = await response.json()
      setResult(result)

      if (result.success) {
        // Refresh the page after 2 seconds
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      }
    } catch (error) {
      setResult({
        error: 'Failed to fix profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Fix User Profile</h1>
          
          {user ? (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded">
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Name:</strong> {user.user_metadata?.full_name || 'Not set'}</p>
                <p><strong>Type:</strong> {user.user_metadata?.user_type || 'Not set'}</p>
              </div>
              
              <button
                onClick={fixProfile}
                disabled={loading}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Fixing...' : 'Fix Profile as Founder'}
              </button>
              
              {result && (
                <div className={`p-4 rounded-lg ${
                  result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <h3 className={`font-semibold ${
                    result.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {result.success ? '✅ Profile Fixed!' : '❌ Error'}
                  </h3>
                  
                  {result.message && (
                    <p className={`mt-2 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                      {result.message}
                    </p>
                  )}
                  
                  {result.error && (
                    <p className="text-red-700">{result.error}</p>
                  )}
                  
                  {result.success && (
                    <p className="text-green-700 text-sm mt-2">
                      Page will refresh in 2 seconds...
                    </p>
                  )}
                  
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm text-gray-600">
                      View Details
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-600 mb-4">Please sign in to fix your profile.</p>
              <Link 
                href="/signin"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Sign In
              </Link>
            </div>
          )}
          
          <div className="mt-6 pt-4 border-t">
            <Link 
              href="/dashboard"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
