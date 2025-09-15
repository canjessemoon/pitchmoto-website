import { supabase } from './supabase'

export const authHelpers = {
  // Email/Password Auth
  signInWithEmail: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  signUpWithEmail: async (email: string, password: string, fullName?: string, userType: 'founder' | 'investor' = 'founder') => {
    try {
      // Use traditional signup - this creates the user with password
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            user_type: userType
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      // If signup successful and user created, create profile immediately
      // This ensures profile exists even if database trigger fails
      if (data.user && !error) {
        try {
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              user_id: data.user.id,
              email: data.user.email,
              full_name: fullName,
              user_type: userType
            })
            .single()
          
          if (profileError) {
            console.warn('Profile creation failed (trigger should handle this):', profileError)
            // Don't fail the signup if profile creation fails - trigger should handle it
          } else {
            console.log('Profile created successfully during signup')
          }
        } catch (profileErr) {
          console.warn('Profile creation error (trigger should handle this):', profileErr)
          // Don't fail the signup if profile creation fails
        }
      }
      
      return { data, error }
    } catch (err) {
      console.error('Signup error:', err)
      return { data: null, error: err }
    }
  },

  // OAuth Providers
  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    })
    return { data, error }
  },

  signInWithLinkedIn: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: {
        redirectTo: `${window.location.origin}/callback`
      }
    })
    return { data, error }
  },

  // Session Management
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  getCurrentSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Auth State Listener
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  },

  // Password Reset
  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
    return { data, error }
  },

  // Resend Email Confirmation
  resendConfirmation: async (email: string) => {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { data, error }
  },

  // Update Password
  updatePassword: async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    })
    return { data, error }
  }
}

// Profile Management
export const profileHelpers = {
  // Get user profile
  getProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    return { data, error }
  },

  // Update user profile
  updateProfile: async (userId: string, updates: {
    full_name?: string
    user_type?: 'founder' | 'investor' | 'admin'
    bio?: string
    location?: string
    linkedin_url?: string
    website?: string
  }) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()
    
    return { data, error }
  },

  // Create profile (called automatically by trigger, but can be used manually)
  createProfile: async (userId: string, email: string, fullName?: string, userType: 'founder' | 'investor' = 'founder') => {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        email,
        full_name: fullName,
        user_type: userType
      })
      .select()
      .single()
    
    return { data, error }
  }
}
