'use client'

import Link from 'next/link'
import { useAuth } from '@/components/providers'

export function NavBar() {
  const { user, signOut } = useAuth()

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              PitchMoto
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-gray-600">
                  Welcome, {user.profile?.full_name || user.email || 'User'}
                </span>
                <Link
                  href="/dashboard"
                  className="text-blue-600 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-blue-600 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="text-[#405B53] hover:text-[#8C948B] px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
