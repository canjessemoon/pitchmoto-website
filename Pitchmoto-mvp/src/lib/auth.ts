import { supabase } from './supabase'
import { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export interface AuthUser {
  id: string
  email: string
  profile?: Profile
}

// Import mock auth helpers
import {
  signUp as mockSignUp,
  signIn as mockSignIn,
  signOut as mockSignOut,
  getCurrentUser as mockGetCurrentUser,
  updateProfile as mockUpdateProfile,
  type Profile as MockProfile
} from './mock-auth-helpers'

// Re-export the mock functions
export const signUp = mockSignUp;
export const signIn = mockSignIn;
export const signOut = mockSignOut;
export const getCurrentUser = mockGetCurrentUser;
export const updateProfile = mockUpdateProfile;

// Function to fully sign out and clear storage
export async function clearAuth() {
  await signOut();
  if (typeof window !== 'undefined') {
    localStorage.clear();
  }
}

export type { Profile };

// Auth context helpers
export const useAuthRequired = () => {
  // This will be implemented with React context
  // For now, return a placeholder
  return { user: null, loading: true }
}
