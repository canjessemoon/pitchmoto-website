'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AuthGuardProps {
  children: React.ReactNode
  requiredUserType?: 'founder' | 'investor'
  redirectTo?: string
}

export function MockAuthGuard({ 
  children, 
  requiredUserType, 
  redirectTo = '/auth/signin' 
}: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkMockAuth()
  }, [])

  const checkMockAuth = async () => {
    try {
      // Check for mock auth in localStorage
      const mockAuth = localStorage.getItem('mock_auth')
      
      if (!mockAuth) {
        console.log('No mock auth found, redirecting to test page')
        router.push('/test-auth')
        return
      }

      const authData = JSON.parse(mockAuth)
      
      if (requiredUserType && authData.profile?.user_type !== requiredUserType) {
        console.log(`User type mismatch: ${authData.profile?.user_type} !== ${requiredUserType}`)
        router.push('/test-auth')
        return
      }

      setIsLoading(false)
    } catch (err) {
      console.error('Mock auth check error:', err)
      setError('Authentication check failed')
      setIsLoading(false)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E64E1B] mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking mock authentication...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/test-auth')}
            className="px-4 py-2 bg-[#E64E1B] text-white rounded-lg hover:bg-[#d63e15]"
          >
            Go to Test Auth
          </button>
        </div>
      </div>
    )
  }

  // If we get here, authentication passed
  return <>{children}</>
}
