'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { auth, AuthUser } from '@/lib/auth'

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
    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setLoading(false)
    }, 5000) // 5 second timeout
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const currentUser = await auth.getCurrentUser()
        setUser(currentUser)
        setLoading(false)
        clearTimeout(timeout)
      } catch (error) {
        console.error('Error getting initial session:', error)
        // Clear any corrupted session data
        if (error instanceof Error && (
          error.message.includes('session') || 
          error.message.includes('refresh') ||
          error.message.includes('Invalid Refresh Token')
        )) {
          await auth.clearSession()
        }
        setUser(null)
        setLoading(false)
        clearTimeout(timeout)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (event === 'SIGNED_OUT') {
            setUser(null)
          } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            if (session?.user) {
              const currentUser = await auth.getCurrentUser()
              setUser(currentUser)
            } else {
              setUser(null)
            }
          }
        } catch (error) {
          console.error('Error handling auth state change:', error)
          setUser(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  const handleSignOut = async () => {
    try {
      console.log('Auth provider: Starting sign out...')
      console.log('Current user before signout:', user?.email)
      
      // Force clear session and local storage first
      setUser(null)
      
      // Clear any cached auth state
      localStorage.removeItem('supabase.auth.token')
      
      // Then try to sign out from Supabase
      const { error } = await auth.signOut()
      if (error) {
        console.error('Auth sign out error:', error)
        // Don't throw error, we already cleared local state
      } else {
        console.log('Auth provider: Sign out successful')
      }
      
      // Force page reload to clear any cached state
      setTimeout(() => {
        window.location.href = '/'
      }, 100)
      
    } catch (error) {
      console.error('Auth provider: Sign out failed:', error)
      // Even if there's an error, clear the user state and redirect
      setUser(null)
      window.location.href = '/'
    }
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
