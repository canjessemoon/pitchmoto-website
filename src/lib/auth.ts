import { supabase } from './supabase'

export interface UserProfile {
  user_id: string
  email: string
  full_name?: string
  user_type: 'founder' | 'investor' | 'admin'
  bio?: string
  location?: string
  linkedin_url?: string
  website?: string
  profile_picture_url?: string
  created_at: string
  updated_at: string
}

export interface AuthUser {
  id: string
  email: string
  profile?: UserProfile
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
      
      // Also clear sessionStorage
      const sessionKeys = Object.keys(sessionStorage)
      sessionKeys.forEach(key => {
        if (key.includes('supabase') || key.includes('sb-')) {
          sessionStorage.removeItem(key)
        }
      })
      
      // Force reload to clear any cached auth state
      window.location.reload()
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<AuthUser | null> => {
    try {
      // First try to get the session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.warn('Session error:', sessionError.message)
        return null
      }
      
      if (!session || !session.user) {
        return null
      }

      // Get user from session
      const user = session.user

      // Get user profile with timeout
      const profilePromise = supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      )

      const { data: profile, error: profileError } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]) as any

      if (profileError) {
        console.error('Error fetching profile:', { 
          error: profileError, 
          code: profileError?.code, 
          message: profileError?.message,
          userId: user.id 
        })
        
        // If profile doesn't exist (PGRST116), try to create it
        if (profileError.code === 'PGRST116') {
          console.log('Profile not found, attempting to create one...')
          try {
            const userMetadata = user.user_metadata || {}
            const { data: newProfile, error: createError } = await supabase
              .from('user_profiles')
              .insert({
                user_id: user.id,
                email: user.email,
                full_name: userMetadata.full_name || userMetadata.name || null,
                user_type: userMetadata.user_type || 'founder' // Default to founder if not specified
              })
              .select()
              .single()
            
            if (createError) {
              console.error('Failed to create profile:', createError)
              return {
                id: user.id,
                email: user.email!,
                profile: undefined
              }
            }
            
            console.log('Profile created successfully:', newProfile)
            return {
              id: user.id,
              email: user.email!,
              profile: newProfile
            }
          } catch (createErr) {
            console.error('Exception creating profile:', createErr)
          }
        }
        
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
      
      // Handle specific auth errors by clearing the session
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase()
        if (errorMessage.includes('refresh_token') || 
            errorMessage.includes('invalid') || 
            errorMessage.includes('expired') ||
            errorMessage.includes('session')) {
          console.log('Clearing invalid session due to auth error...')
          await supabase.auth.signOut()
        }
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
  updateProfile: async (userId: string, updates: Partial<UserProfile>) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()
    
    return { data, error }
  },

  // Check if user has specific role
  hasRole: async (userId: string, role: 'founder' | 'investor' | 'admin') => {
    const { data } = await supabase
      .from('user_profiles')
      .select('user_type')
      .eq('user_id', userId)
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
