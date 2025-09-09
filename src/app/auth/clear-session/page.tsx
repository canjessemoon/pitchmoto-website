'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ClearSessionPage() {
  const router = useRouter()

  useEffect(() => {
    const clearSession = async () => {
      try {
        // Clear the session
        await supabase.auth.signOut()
        
        // Clear any local storage
        if (typeof window !== 'undefined') {
          localStorage.clear()
          sessionStorage.clear()
        }
        
        console.log('Session cleared successfully')
        
        // Redirect to sign in after a short delay
        setTimeout(() => {
          router.push('/auth/signin?message=Session cleared. Please sign in again.')
        }, 1000)
        
      } catch (error) {
        console.error('Error clearing session:', error)
        router.push('/auth/signin')
      }
    }
    
    clearSession()
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E64E1B] mx-auto"></div>
        <p className="mt-4 text-gray-600">Clearing session...</p>
        <p className="mt-2 text-sm text-gray-500">You will be redirected to sign in shortly.</p>
      </div>
    </div>
  )
}
