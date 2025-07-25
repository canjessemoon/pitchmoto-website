'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SimpleAuthTestPage() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testBasicConnection = async () => {
    setLoading(true)
    setResult('Testing basic connection...')
    
    try {
      // Test 1: Basic REST API
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`
        }
      })
      
      if (response.ok) {
        setResult(prev => prev + '\n✅ Basic API connection works')
      } else {
        setResult(prev => prev + '\n❌ Basic API failed: ' + response.status)
      }
    } catch (error) {
      setResult(prev => prev + '\n❌ Basic API error: ' + error)
    }
    
    setLoading(false)
  }

  const testDirectAuth = async () => {
    setLoading(true)
    setResult(prev => prev + '\n\nTesting direct auth...')
    
    try {
      // Test 2: Direct Supabase auth
      const { data, error } = await supabase.auth.signUp({
        email: `test${Date.now()}@gmail.com`,
        password: 'testpassword123'
      })
      
      if (error) {
        setResult(prev => prev + '\n❌ Auth error: ' + error.message)
      } else {
        setResult(prev => prev + '\n✅ Auth signup works!')
        setResult(prev => prev + '\n📧 User ID: ' + data.user?.id)
      }
    } catch (error) {
      setResult(prev => prev + '\n❌ Auth exception: ' + error)
    }
    
    setLoading(false)
  }

  const testAuthEndpoint = async () => {
    setLoading(true)
    setResult(prev => prev + '\n\nTesting auth endpoint directly...')
    
    try {
      // Test 3: Direct fetch to auth endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: `test${Date.now()}@gmail.com`,
          password: 'testpassword123'
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setResult(prev => prev + '\n✅ Direct auth endpoint works!')
      } else {
        setResult(prev => prev + '\n❌ Direct auth failed: ' + JSON.stringify(data, null, 2))
      }
    } catch (error) {
      setResult(prev => prev + '\n❌ Direct auth exception: ' + error)
    }
    
    setLoading(false)
  }

  const clearResults = () => {
    setResult('')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Simple Auth Debug Test
        </h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Environment Check</h2>
          <div className="space-y-2 text-sm font-mono">
            <div>Supabase URL: <span className="text-blue-600">{process.env.NEXT_PUBLIC_SUPABASE_URL}</span></div>
            <div>API Key: <span className="text-blue-600">{process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 20)}...</span></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Debug Tests</h2>
          <div className="space-x-4 mb-4">
            <button
              onClick={testBasicConnection}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Test Basic Connection
            </button>
            <button
              onClick={testDirectAuth}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              Test Direct Auth
            </button>
            <button
              onClick={testAuthEndpoint}
              disabled={loading}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
            >
              Test Auth Endpoint
            </button>
            <button
              onClick={clearResults}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Clear
            </button>
          </div>
          
          {loading && (
            <div className="flex items-center space-x-2 mb-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Running test...</span>
            </div>
          )}
          
          <div className="bg-gray-100 p-4 rounded font-mono text-sm whitespace-pre-wrap min-h-[200px]">
            {result || 'Click a test button to start debugging...'}
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
          <h3 className="font-semibold text-yellow-800 mb-2">Instructions:</h3>
          <ol className="text-sm text-yellow-700 space-y-1">
            <li>1. Run "Test Basic Connection" first - this checks if your Supabase project is reachable</li>
            <li>2. If that works, run "Test Direct Auth" - this tests signup without our helper functions</li>
            <li>3. If that fails, run "Test Auth Endpoint" - this tests the raw auth API</li>
            <li>4. Check the results to see exactly where it's failing</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
