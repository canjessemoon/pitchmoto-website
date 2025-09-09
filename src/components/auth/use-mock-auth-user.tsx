'use client'

import { useEffect, useState } from 'react'

interface UserProfile {
  user_id: string
  user_type: 'founder' | 'investor'
  first_name: string
  last_name: string
  email: string
  phone?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

interface MockUser {
  id: string
  email: string
  user_metadata?: any
}

interface AuthUser {
  user: MockUser | null
  profile: UserProfile | null
  isLoading: boolean
  error: string | null
}

export function useMockAuthUser(): AuthUser {
  const [user, setUser] = useState<MockUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMockUser()
  }, [])

  const loadMockUser = async () => {
    try {
      const mockAuth = localStorage.getItem('mock_auth')
      
      if (mockAuth) {
        const authData = JSON.parse(mockAuth)
        setUser(authData.user)
        setProfile(authData.profile)
      } else {
        setUser(null)
        setProfile(null)
      }
    } catch (err) {
      console.error('Load mock user error:', err)
      setError('Failed to load mock user')
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
