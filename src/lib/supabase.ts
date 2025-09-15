import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
// Use new publishable key for client-side operations
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient<Database>(supabaseUrl, supabasePublishableKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})

// For server-side operations that need elevated privileges
export const createServerClient = () => {
  // Log environment variables for debugging
  console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set')
  console.log('SUPABASE_PUBLISHABLE_KEY:', process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ? 'Set' : 'Not set')
  
  // Return null during build time if environment variables are not available
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !supabasePublishableKey) {
    console.error('Supabase environment variables not set')
    return null as any
  }
  
  return createClient<Database>(supabaseUrl, supabasePublishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  })
}

// For server-side operations that need admin privileges (bypasses RLS)
export const createAdminClient = () => {
  const secretKey = process.env.SUPABASE_SECRET_KEY
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !secretKey) {
    console.error('Supabase admin environment variables not set')
    return null as any
  }
  
  return createClient<Database>(supabaseUrl, secretKey, {
    auth: { persistSession: false }
  })
}
