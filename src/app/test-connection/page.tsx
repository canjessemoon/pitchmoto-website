'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { authHelpers } from '@/lib/auth-helpers'

export default function TestConnectionPage() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing')
  const [user, setUser] = useState<any>(null)
  const [testEmail, setTestEmail] = useState('')
  const [testPassword, setTestPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      // Test basic Supabase connection
      const { data, error } = await supabase.auth.getSession()
      
      if (error && error.message !== 'No session') {
        console.error('Connection error:', error)
        setConnectionStatus('error')
        return
      }

      setConnectionStatus('connected')
      setUser(data.session?.user || null)
    } catch (error) {
      console.error('Connection test failed:', error)
      setConnectionStatus('error')
    }
  }

  const testSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await authHelpers.signUpWithEmail(
        testEmail,
        testPassword,
        'Test User'
      )

      if (error) {
        alert(`Sign up error: ${error.message}`)
      } else if (data.user) {
        alert('Sign up successful! Check your email for confirmation.')
        setUser(data.user)
      }
    } catch (error) {
      console.error('Test sign up error:', error)
      alert('Sign up test failed')
    } finally {
      setLoading(false)
    }
  }

  const testSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await authHelpers.signInWithEmail(
        testEmail,
        testPassword
      )

      if (error) {
        alert(`Sign in error: ${error.message}`)
      } else if (data.user) {
        alert('Sign in successful!')
        setUser(data.user)
      }
    } catch (error) {
      console.error('Test sign in error:', error)
      alert('Sign in test failed')
    } finally {
      setLoading(false)
    }
  }

  const testSignOut = async () => {
    try {
      await authHelpers.signOut()
      setUser(null)
      alert('Signed out successfully')
    } catch (error) {
      console.error('Sign out error:', error)
      alert('Sign out failed')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Supabase Connection Test
        </h1>

        {/* Connection Status */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <div className="flex items-center space-x-2">
            {connectionStatus === 'testing' && (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">Testing connection...</span>
              </>
            )}
            {connectionStatus === 'connected' && (
              <>
                <div className="h-4 w-4 bg-green-500 rounded-full"></div>
                <span className="text-green-600">Connected to Supabase ✅</span>
              </>
            )}
            {connectionStatus === 'error' && (
              <>
                <div className="h-4 w-4 bg-red-500 rounded-full"></div>
                <span className="text-red-600">Connection failed ❌</span>
              </>
            )}
          </div>
          <button
            onClick={testConnection}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test Again
          </button>
        </div>

        {/* User Status */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Current User</h2>
          {user ? (
            <div className="space-y-2">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</p>
              <button
                onClick={testSignOut}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <p className="text-gray-600">No user signed in</p>
          )}
        </div>

        {/* Auth Test */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test Authentication</h2>
          <p className="text-gray-600 mb-4">
            Use a test email to verify auth is working
          </p>
          <form onSubmit={testSignUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Test Email
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Test Password
              </label>
              <input
                type="password"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                placeholder="minimum 8 characters"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                minLength={8}
                required
              />
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test Sign Up'}
              </button>
              <button
                type="button"
                onClick={testSignIn}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test Sign In'}
              </button>
            </div>
          </form>
        </div>

        {/* Environment Check */}
        <div className="bg-white p-6 rounded-lg shadow mt-6">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Supabase URL:</strong> {' '}
              {process.env.NEXT_PUBLIC_SUPABASE_URL ? 
                <span className="text-green-600">✅ Set</span> : 
                <span className="text-red-600">❌ Missing</span>
              }
            </p>
            <p>
              <strong>Supabase Anon Key:</strong> {' '}
              {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
                <span className="text-green-600">✅ Set</span> : 
                <span className="text-red-600">❌ Missing</span>
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
