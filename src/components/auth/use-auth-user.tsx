'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface UserProfile {
  user_id: string
  user_type: 'founder' | 'investor'
  email: string
  full_name?: string
  bio?: string
  location?: string
  linkedin_url?: string
  website?: string
  created_at: string
  updated_at: string
}

interface AuthUser {
  user: User | null
  profile: UserProfile | null
  isLoading: boolean
  error: string | null
}

export function useAuthUser(): AuthUser {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            setUser(session.user)
            await loadProfile(session.user.id)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
          setIsLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadUser = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        setError(authError.message)
        setIsLoading(false)
        return
      }

      if (user) {
        setUser(user)
        await loadProfile(user.id)
      } else {
        setIsLoading(false)
      }
    } catch (err) {
      console.error('Load user error:', err)
      setError('Failed to load user')
      setIsLoading(false)
    }
  }

  const loadProfile = async (userId: string) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (profileError) {
        console.error('Profile error:', profileError)
        console.error('Profile error details:', JSON.stringify(profileError, null, 2))
        console.error('Profile error code:', profileError.code)
        console.error('Profile error message:', profileError.message)
        
        // If profile doesn't exist (PGRST116), that's okay - user hasn't created one yet
        if (profileError.code === 'PGRST116') {
          console.log('No profile found for user, will create one on update')
          setProfile(null)
        } else {
          console.error('Profile error:', profileError)
          setError(`Failed to load user profile: ${profileError.message || 'Unknown error'}`)
        }
      } else {
        setProfile(profile)
      }
    } catch (err) {
      console.error('Load profile error:', err)
      setError('Failed to load user profile')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    user,
    profile,
    isLoading,
    error
  }
}
