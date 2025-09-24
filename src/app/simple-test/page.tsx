'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SimpleTestPage() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testBasicConnection = async () => {
    setLoading(true)
    setResult('Testing basic Supabase connection...')
    
    try {
      console.log('🔍 Testing basic Supabase connection...')
      console.log('Supabase client:', supabase)
      
      // Test 1: Check if we have a session first (faster)
      setResult('Step 1: Checking for existing session...')
      const { data: session } = await supabase.auth.getSession()
      
      if (!session?.session) {
        setResult('❌ No active session found! You need to log in first.')
        console.log('❌ No session found')
        return
      }
      
      setResult('Step 2: Found session, testing auth...')
      console.log('✅ Session found, testing getUser()...')
      
      // Add timeout to auth call
      const authPromise = supabase.auth.getUser()
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth timeout after 5 seconds')), 5000)
      )
      
      const { data, error } = await Promise.race([authPromise, timeoutPromise]) as any
      
      if (error) {
        setResult(`❌ Auth error: ${error.message}`)
        console.error('❌ Auth error:', error)
      } else {
        setResult(`✅ Auth success! User: ${data?.user?.email || 'No user'}`)
        console.log('✅ Auth success:', data)
      }
      
    } catch (error: any) {
      console.error('❌ Connection error:', error)
      setResult(`❌ Connection error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🔧 Simple Connection Test
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <button
            onClick={testBasicConnection}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-50 hover:bg-blue-700"
          >
            {loading ? 'Testing...' : 'Test Basic Connection'}
          </button>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Result:</h3>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {result || 'No test run yet'}
            </pre>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Environment Check</h2>
          <div className="space-y-2 text-sm">
            <div>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET'}</div>
            <div>Key: {process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ? 'SET' : 'NOT SET'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}