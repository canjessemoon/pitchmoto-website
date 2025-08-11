'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthUser, getCurrentUser, signOut } from '@/lib/auth'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {}
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session using mock auth
    const getInitialSession = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.log('No current user found')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Custom event listener for same-tab auth changes
    const handleAuthChange = (e: CustomEvent) => {
      if (e.detail?.user) {
        setUser(e.detail.user)
      } else {
        setUser(null)
      }
    }

    // Mock auth state change listener
    // In a real app, this would listen to Supabase auth changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        if (e.newValue) {
          const userData = JSON.parse(e.newValue)
          setUser({
            id: userData.id,
            email: userData.email,
            profile: userData
          })
        } else {
          setUser(null)
        }
      }
    }

    // Listen for changes in localStorage (mock auth state)
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange)
      window.addEventListener('authChange', handleAuthChange as EventListener)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange)
        window.removeEventListener('authChange', handleAuthChange as EventListener)
      }
    }
  }, [])

  const handleSignOut = async () => {
    await signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        signOut: handleSignOut 
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}
