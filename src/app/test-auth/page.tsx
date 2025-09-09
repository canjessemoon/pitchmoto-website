'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useState } from 'react'

export default function TestAuthPage() {
  const router = useRouter()
  const [loadingStates, setLoadingStates] = useState({
    testing: false,
    creating: false,
    signingIn: false,
    checking: false,
    signingOut: false
  })
  const [result, setResult] = useState<string>('')

  const setLoading = (action: keyof typeof loadingStates, value: boolean) => {
    setLoadingStates(prev => ({ ...prev, [action]: value }))
  }

  const testConnection = async () => {
    setLoading('testing', true)
    setResult('Testing Supabase connection...')
    try {
      // Test basic connection first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        setResult(`❌ Session error: ${sessionError.message}`)
        return
      }
      
      // Test database connection with a simple query that bypasses RLS
      const { data, error } = await supabase.rpc('ping')
      
      if (error && error.code === '42883') {
        // ping function doesn't exist, try a simpler test
        const { error: simpleError } = await supabase.from('user_profiles').select('count', { count: 'exact', head: true })
        if (simpleError) {
          setResult(`❌ Database error: ${simpleError.message}`)
        } else {
          setResult('✅ Supabase connection successful! (Database tables accessible)')
        }
      } else if (error) {
        setResult(`❌ Database error: ${error.message}`)
      } else {
        setResult('✅ Supabase connection successful!')
      }
    } catch (err: any) {
      setResult(`❌ Connection error: ${err.message}`)
    } finally {
      setLoading('testing', false)
    }
  }

  const createTestUser = async () => {
    setLoading('creating', true)
    setResult('Creating test user...')
    try {
      // First check if user already exists
      const { data: existingUser } = await supabase.auth.getUser()
      if (existingUser.user?.email === 'testinvestor@example.com') {
        setResult('Test user already signed in!')
        setLoading('creating', false)
        return
      }

      // Sign up user
      setResult('Creating auth user...')
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: 'testinvestor@example.com',
        password: 'testpassword123',
        options: {
          data: {
            user_type: 'investor',
            first_name: 'Test',
            last_name: 'Investor'
          }
        }
      })

      if (authError) {
        console.error('Auth error:', authError)
        setResult(`❌ Auth error: ${authError.message}`)
        return
      }

      if (!authData.user) {
        setResult('❌ No user returned from signup')
        return
      }

      setResult('Creating user profile...')
      
      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: authData.user.id,
          user_type: 'investor',
          first_name: 'Test',
          last_name: 'Investor',
          email: 'test@investor.com'
        })

      if (profileError) {
        console.error('Profile error:', profileError)
        setResult(`❌ Profile error: ${profileError.message}. User created but profile failed.`)
        return
      }

      setResult('✅ Test user created successfully! You can now sign in.')
    } catch (err: any) {
      console.error('Test user creation error:', err)
      setResult(`❌ Error: ${err.message}`)
    } finally {
      setLoading('creating', false)
    }
  }

  const signInTestUser = async () => {
    setLoading('signingIn', true)
    setResult('Signing in...')
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'testinvestor@example.com',
        password: 'testpassword123'
      })

      if (error) {
        console.error('Sign in error:', error)
        setResult(`❌ Sign in error: ${error.message}`)
        return
      }

      if (data.user) {
        setResult('✅ Signed in successfully! Redirecting...')
        setTimeout(() => {
          router.push('/app/investors/dashboard')
        }, 1500)
      }
    } catch (err: any) {
      console.error('Sign in error:', err)
      setResult(`❌ Error: ${err.message}`)
    } finally {
      setLoading('signingIn', false)
    }
  }

  const checkAuthStatus = async () => {
    setLoading('checking', true)
    setResult('Checking auth status...')
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        setResult(`❌ Auth error: ${error.message}`)
        return
      }

      if (user) {
        setResult(`✅ Current user: ${user.email} (ID: ${user.id})`)
        
        // Check profile
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (profileError) {
          setResult(prev => prev + `\n❌ Profile error: ${profileError.message}`)
        } else {
          setResult(prev => prev + `\n✅ Profile found: ${profile.first_name} ${profile.last_name} (${profile.user_type})`)
        }
      } else {
        setResult('ℹ️ No user signed in')
      }
    } catch (err: any) {
      setResult(`❌ Error: ${err.message}`)
    } finally {
      setLoading('checking', false)
    }
  }

  const signOut = async () => {
    setLoading('signingOut', true)
    setResult('Signing out...')
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        setResult(`❌ Sign out error: ${error.message}`)
      } else {
        setResult('✅ Signed out successfully!')
      }
    } catch (err: any) {
      setResult(`❌ Error: ${err.message}`)
    } finally {
      setLoading('signingOut', false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Authentication Test & Debug
        </h1>
        
        <div className="space-y-4 mb-6">
          <button
            onClick={testConnection}
            disabled={loadingStates.testing}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            {loadingStates.testing ? 'Testing...' : '🔌 Test Supabase Connection'}
          </button>

          <button
            onClick={createTestUser}
            disabled={loadingStates.creating}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loadingStates.creating ? 'Creating...' : '➕ Create Test User'}
          </button>
          
          <button
            onClick={signInTestUser}
            disabled={loadingStates.signingIn}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loadingStates.signingIn ? 'Signing in...' : '🔑 Sign In Test User'}
          </button>
          
          <button
            onClick={checkAuthStatus}
            disabled={loadingStates.checking}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loadingStates.checking ? 'Checking...' : '👤 Check Auth Status'}
          </button>

          <button
            onClick={signOut}
            disabled={loadingStates.signingOut}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {loadingStates.signingOut ? 'Signing out...' : '🚪 Sign Out'}
          </button>
          
          <button
            onClick={() => router.push('/app/investors/dashboard')}
            className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            🎯 Go to Dashboard
          </button>

          {/* Schema Setup Helper */}
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-2 text-center">Database Schema:</p>
            <button
              onClick={() => {
                setResult(`📋 Copy this SQL and run it in your Supabase SQL Editor:

Go to your Supabase Dashboard → SQL Editor → New Query
Copy and paste the contents of 'fix-database-schema.sql' 
Then click RUN to create the required tables.

The file 'fix-database-schema.sql' has been created in your project root.

After running the SQL, try the "Test Supabase Connection" button again!`)
              }}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 mb-2"
            >
              📋 Show Database Setup Instructions
            </button>
            
            <button
              onClick={() => {
                setResult(`🔧 Add this simple ping function to your database:

-- Run this in Supabase SQL Editor to create a simple test function:
CREATE OR REPLACE FUNCTION ping() RETURNS text AS $$
BEGIN
  RETURN 'pong';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION ping() TO anon, authenticated;

This will help test database connectivity without RLS issues.`)
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              🔧 Create Database Ping Function
            </button>
          </div>

          {/* Mock Auth Button */}
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-2 text-center">For testing without Supabase:</p>
            <button
              onClick={() => {
                // Set mock auth in localStorage for testing
                localStorage.setItem('mock_auth', JSON.stringify({
                  user: {
                    id: 'mock-user-id',
                    email: 'testinvestor@example.com',
                    user_metadata: { user_type: 'investor' }
                  },
                  profile: {
                    user_id: 'mock-user-id',
                    user_type: 'investor',
                    first_name: 'Test',
                    last_name: 'Investor',
                    email: 'testinvestor@example.com'
                  }
                }))
                setResult('✅ Mock authentication set! You can now access the dashboard.')
              }}
              className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              🧪 Set Mock Authentication
            </button>
            
            <button
              onClick={() => router.push('/mock-dashboard')}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              📊 View Mock Dashboard
            </button>
          </div>
        </div>

        {/* Result Display */}
        {result && (
          <div className="bg-gray-100 border rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Result:</h3>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">{result}</pre>
          </div>
        )}
        
        <div className="mt-6 text-sm text-gray-600 bg-blue-50 p-4 rounded">
          <p><strong>Test User Credentials:</strong></p>
          <p>Email: testinvestor@example.com</p>
          <p>Password: testpassword123</p>
          <p>Type: investor</p>
          <p className="mt-2 text-xs">Use the buttons above to test each step of the authentication process.</p>
        </div>
      </div>
    </div>
  )
}
