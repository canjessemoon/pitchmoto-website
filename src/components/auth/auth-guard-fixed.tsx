'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthGuardProps {
  children: React.ReactNode
  requiredUserType?: 'founder' | 'investor'
  redirectTo?: string
}

export function AuthGuard({ 
  children, 
  requiredUserType, 
  redirectTo = '/auth/signin' 
}: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null)
  const [userType, setUserType] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.error('Auth error:', authError)
        setError('Authentication failed')
        router.push(redirectTo)
        return
      }

      if (!user) {
        console.log('No user found, redirecting to signin')
        router.push(redirectTo)
        return
      }

      setUser(user)

      // If we need to check user type, fetch it from the profile
      if (requiredUserType) {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('user_type, first_name, last_name')
          .eq('user_id', user.id)
          .single()

        if (profileError) {
          console.error('Profile error:', profileError)
          
          // If profile doesn't exist, try to create it from user metadata
          if (profileError.code === 'PGRST116') {
            console.log('Profile not found, creating from user metadata...')
            const userType = user.user_metadata?.user_type || 'founder'
            
            const { error: insertError } = await supabase
              .from('user_profiles')
              .insert({
                user_id: user.id,
                email: user.email || '',
                first_name: user.user_metadata?.first_name || '',
                last_name: user.user_metadata?.last_name || '',
                user_type: userType
              })
            
            if (insertError) {
              console.error('Failed to create profile:', insertError)
              // Redirect to complete profile if we can't create it automatically
              router.push('/auth/complete-profile')
              return
            }
            
            setUserType(userType)
          } else {
            // Other profile errors, redirect to complete profile
            router.push('/auth/complete-profile')
            return
          }
        } else if (profile) {
          setUserType(profile.user_type)
          
          // Check if profile is incomplete
          if (!profile.first_name || !profile.last_name) {
            console.log('Profile incomplete, redirecting to complete profile')
            router.push('/auth/complete-profile')
            return
          }
        }

        // Check if user type matches requirement
        const finalUserType = profile?.user_type || user.user_metadata?.user_type
        if (finalUserType !== requiredUserType) {
          console.log(`User type ${finalUserType} doesn't match required ${requiredUserType}`)
          setError(`Access denied. This page is for ${requiredUserType}s only.`)
          // Redirect based on user type
          if (finalUserType === 'founder') {
            router.push('/app/founders/dashboard')
          } else if (finalUserType === 'investor') {
            router.push('/app/investors/dashboard')
          } else {
            router.push('/auth/complete-profile')
          }
          return
        }
      }

      setIsLoading(false)
    } catch (err) {
      console.error('Auth check error:', err)
      setError('Failed to verify authentication')
      setIsLoading(false)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E64E1B] mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying authentication...</p>
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
            onClick={() => router.push(redirectTo)}
            className="px-4 py-2 bg-[#E64E1B] text-white rounded-lg hover:bg-[#d63e15]"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  // If we get here, authentication passed
  return <>{children}</>
}
