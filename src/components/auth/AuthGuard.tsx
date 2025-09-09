'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface AuthGuardProps {
  children: React.ReactNode
  requiredUserType?: 'investor' | 'founder'
  redirectTo?: string
}

export function AuthGuard({ 
  children, 
  requiredUserType, 
  redirectTo = '/auth/signin' 
}: AuthGuardProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        router.push(redirectTo)
        return
      }

      // If no specific user type required, just check if authenticated
      if (!requiredUserType) {
        setIsAuthorized(true)
        setIsLoading(false)
        return
      }

      // Check user type if required
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('user_type')
        .eq('user_id', user.id)
        .single()

      if (profileError || !profile) {
        router.push('/profile') // Redirect to complete profile
        return
      }

      if (profile.user_type !== requiredUserType) {
        // Redirect based on actual user type
        if (profile.user_type === 'investor') {
          router.push('/app/investors/dashboard')
        } else {
          router.push('/app')
        }
        return
      }

      setIsAuthorized(true)
    } catch (err) {
      console.error('Auth guard error:', err)
      router.push(redirectTo)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E64E1B] mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null // Will redirect via useEffect
  }

  return <>{children}</>
}

// Hook for getting current user and profile data
export function useAuthUser() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUserData()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await loadUserData()
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
          setIsLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadUserData = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        setUser(null)
        setProfile(null)
        return
      }

      setUser(user)

      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!profileError && profileData) {
        setProfile(profileData)
      }
    } catch (err) {
      console.error('Load user data error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return { user, profile, isLoading, refetch: loadUserData }
}
