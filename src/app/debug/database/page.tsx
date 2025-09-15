'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function DatabaseDebugPage() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkDatabase = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/check-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const result = await response.json()
      setStatus(result)
    } catch (error) {
      setStatus({
        error: 'Failed to check database',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Database Debug Panel</h1>
          <p className="text-gray-600 mb-6">
            This page helps diagnose database setup issues during development.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={checkDatabase}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Check Database Status'}
            </button>
            
            {status && (
              <div className={`p-4 rounded-lg ${
                status.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <h3 className={`font-semibold ${
                  status.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {status.success ? '✅ Database Status: OK' : '❌ Database Issue Detected'}
                </h3>
                
                {status.message && (
                  <p className={`mt-2 ${status.success ? 'text-green-700' : 'text-red-700'}`}>
                    {status.message}
                  </p>
                )}
                
                {status.error && (
                  <div className="mt-3">
                    <p className="font-medium text-red-800">Error: {status.error}</p>
                    {status.details && (
                      <p className="text-sm text-red-700 mt-1">Details: {status.details}</p>
                    )}
                    {status.solution && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="font-medium text-yellow-800">Solution:</p>
                        <p className="text-yellow-700">{status.solution}</p>
                        {status.script && (
                          <p className="text-sm text-yellow-600 mt-1">
                            Script location: {status.script}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-gray-600">
                    View Raw Response
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(status, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
          
          <div className="mt-8 border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Manual Setup Instructions</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <p>If the automatic check fails, follow these steps:</p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Go to your Supabase project dashboard</li>
                <li>Navigate to the SQL Editor</li>
                <li>Copy and paste the contents of <code>/database/init-user-profiles.sql</code></li>
                <li>Run the SQL script to create the user_profiles table and triggers</li>
                <li>Come back and test the signup flow</li>
              </ol>
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="font-medium text-blue-800">Quick SQL Script:</p>
                <pre className="text-xs mt-2 text-blue-700 overflow-auto">
{`CREATE TABLE IF NOT EXISTS public.user_profiles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    user_type TEXT CHECK (user_type IN ('founder', 'investor', 'admin')) NOT NULL DEFAULT 'founder',
    bio TEXT,
    location TEXT,
    linkedin_url TEXT,
    website TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own profile" ON public.user_profiles
    FOR ALL USING (auth.uid() = user_id);`}
                </pre>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex space-x-4">
            <Link 
              href="/signup/founder"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Test Founder Signup
            </Link>
            <Link 
              href="/signup/investor"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              Test Investor Signup
            </Link>
            <Link 
              href="/dashboard"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
