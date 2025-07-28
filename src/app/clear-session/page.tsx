'use client'

import { useState } from 'react'
import { auth } from '@/lib/auth'

export default function ClearSessionPage() {
  const [clearing, setClearing] = useState(false)
  const [cleared, setCleared] = useState(false)

  const handleClearSession = async () => {
    setClearing(true)
    try {
      await auth.clearSession()
      setCleared(true)
    } catch (error) {
      console.error('Error clearing session:', error)
      // Force reload if clear session fails
      window.location.reload()
    }
    setClearing(false)
  }

  if (cleared) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Session Cleared</h1>
          <p className="text-gray-600 mb-4">
            Your session has been cleared successfully. You can now try signing in again.
          </p>
          <a
            href="/signin"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Go to Sign In
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.862-.833-2.632 0L4.182 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Auth Session Issue</h1>
          <p className="text-gray-600 mb-4">
            If you're experiencing authentication issues, this tool can help clear your session data.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">Common Issues:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• "Auth session missing" errors</li>
              <li>• Stuck on loading screens</li>
              <li>• Invalid refresh token errors</li>
              <li>• Can't sign in or out properly</li>
            </ul>
          </div>

          <button
            onClick={handleClearSession}
            disabled={clearing}
            className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
          >
            {clearing ? 'Clearing Session...' : 'Clear Session Data'}
          </button>

          <div className="text-center">
            <a
              href="/"
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
