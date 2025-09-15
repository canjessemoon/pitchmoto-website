'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the OAuth callback
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/signin?error=callback_failed')
          return
        }

        if (data.session) {
          // Check if user has a profile
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', data.session.user.id)
            .single()

          if (!profile) {
            // No profile exists, redirect to complete onboarding
            router.push('/complete-profile')
          } else {
            // Profile exists, redirect based on user type
            if (profile.user_type === 'investor') {
              router.push('/app/startups') // Investor sees startup discovery
            } else if (profile.user_type === 'founder') {
              router.push('/dashboard') // Founder sees their dashboard
            } else {
              router.push('/dashboard') // Default fallback
            }
          }
        } else {
          // No session, redirect to sign in
          router.push('/signin')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        router.push('/signin?error=callback_failed')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Completing sign in...
        </h2>
        <p className="text-gray-600">
          Please wait while we finish setting up your account.
        </p>
      </div>
    </div>
  )
}
