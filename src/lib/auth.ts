import { supabase } from './supabase'
import { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export interface AuthUser {
  id: string
  email: string
  profile?: Profile
}

export const auth = {
  // Sign up with email and password
  signUp: async (email: string, password: string, fullName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })
    return { data, error }
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    
    // Also clear any stale data from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('supabase.auth.token')
      localStorage.removeItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1] + '-auth-token')
    }
    
    return { error }
  },

  // Clear session and localStorage
  clearSession: async () => {
    await supabase.auth.signOut()
    
    if (typeof window !== 'undefined') {
      // Clear all supabase-related localStorage items
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.includes('supabase') || key.includes('sb-')) {
          localStorage.removeItem(key)
        }
      })
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<AuthUser | null> => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      // Handle invalid refresh token error
      if (error) {
        console.warn('Auth error:', error.message)
        
        // If it's a refresh token error, clear the session
        if (error.message.includes('refresh_token') || error.message.includes('Invalid Refresh Token')) {
          console.log('Clearing invalid session...')
          await supabase.auth.signOut()
          return null
        }
        
        throw error
      }
      
      if (!user) return null

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Error fetching profile:', profileError)
        // Return user without profile if profile fetch fails
        return {
          id: user.id,
          email: user.email!,
          profile: undefined
        }
      }

      return {
        id: user.id,
        email: user.email!,
        profile: profile || undefined
      }
    } catch (error) {
      console.error('Error getting current user:', error)
      
      // Handle specific auth errors
      if (error instanceof Error && error.message.includes('refresh_token')) {
        console.log('Clearing invalid session due to refresh token error...')
        await supabase.auth.signOut()
      }
      
      return null
    }
  },

  // Get user session
  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },

  // Listen to auth changes
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  },

  // Update user profile
  updateProfile: async (userId: string, updates: Partial<Profile>) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    return { data, error }
  },

  // Check if user has specific role
  hasRole: async (userId: string, role: 'founder' | 'investor' | 'admin') => {
    const { data } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', userId)
      .single()
    
    return data?.user_type === role
  }
}

// Auth context helpers
export const useAuthRequired = () => {
  // This will be implemented with React context
  // For now, return a placeholder
  return { user: null, loading: true }
}
