'use client'

import Link from 'next/link'
import { useAuth } from '@/components/providers'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export function Navigation() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const handleGoToApp = () => {
    if (user) {
      router.push('/dashboard')
    } else {
      router.push('/signin')
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6 md:space-x-10">
          {/* Logo */}
          <div className="flex justify-start lg:w-0 lg:flex-1">
            <Link href="/" className="text-2xl font-bold">
              <span className="text-[#405B53]">Pitch</span>
              <span className="text-[#E64E1B]">Moto</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/how-it-works"
              className="text-gray-600 hover:text-[#405B53] transition-colors"
            >
              How it Works
            </Link>
            <Link
              href="/faqs"
              className="text-gray-600 hover:text-[#405B53] transition-colors"
            >
              FAQs
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center justify-end md:flex-1 lg:w-0">
            {loading ? (
              // Show buttons even while loading, with a small loading indicator
              <div className="flex items-center space-x-4">
                <div className="w-4 h-4 border-2 border-[#405B53] border-t-transparent rounded-full animate-spin"></div>
                <Link
                  href="/signin"
                  className="text-gray-600 hover:text-[#405B53] transition-colors"
                >
                  Sign In
                </Link>
                <button
                  onClick={handleGoToApp}
                  className="bg-[#E64E1B] text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium"
                >
                  Go to App
                </button>
              </div>
            ) : user ? (
              // Authenticated user menu
              <div className="flex items-center space-x-4">
                <Link
                  href="/profile"
                  className="text-gray-600 hover:text-[#405B53] transition-colors"
                >
                  Profile
                </Link>
                <Link
                  href="/app"
                  className="bg-[#E64E1B] text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-gray-600 hover:text-[#405B53] transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              // Non-authenticated user menu
              <div className="flex items-center space-x-4">
                <Link
                  href="/signin"
                  className="text-gray-600 hover:text-[#405B53] transition-colors"
                >
                  Sign In
                </Link>
                <button
                  onClick={handleGoToApp}
                  className="bg-[#E64E1B] text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium"
                >
                  Go to App
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
