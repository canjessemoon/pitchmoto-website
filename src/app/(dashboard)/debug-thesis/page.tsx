'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthUser } from '@/components/auth/use-auth-user'

export default function DebugThesisPage() {
  const { user, isLoading: authLoading } = useAuthUser()
  const [thesisData, setThesisData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    console.log('Debug: useEffect triggered', { user: !!user, authLoading })
    setDebugInfo((prev: any) => ({
      ...prev,
      authLoading,
      hasUser: !!user,
      userId: user?.id,
      timestamp: new Date().toISOString()
    }))

    if (user && !authLoading) {
      loadThesis()
    } else if (!authLoading && !user) {
      setError('No authenticated user found')
      setIsLoading(false)
    }
  }, [user, authLoading])

  const loadThesis = async () => {
    try {
      console.log('Debug: Loading thesis for user:', user?.id)
      
      const { data: theses, error } = await supabase
        .from('investor_theses')
        .select('*')
        .eq('investor_id', user?.id)

      console.log('Debug: Raw query result:', { theses, error })

      if (error) {
        setError(error.message)
      } else {
        setThesisData(theses)
      }
    } catch (err: any) {
      console.error('Debug: Error:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      window.location.href = '/auth/signin'
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  // Show debug info even during loading
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Debug: Thesis Data</h1>
        <button 
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          🚪 Logout & Go to Login
        </button>
      </div>
      
      <div className="bg-yellow-100 p-4 rounded mb-4">
        <h3 className="font-bold">Debug Info:</h3>
        <pre className="text-sm">{JSON.stringify(debugInfo, null, 2)}</pre>
        <p className="mt-2">Auth Loading: {String(authLoading)}</p>
        <p>User Present: {String(!!user)}</p>
        <p>Is Loading: {String(isLoading)}</p>
      </div>

      {authLoading && (
        <div className="bg-blue-100 p-4 rounded mb-4">
          <p>🔄 Authentication loading...</p>
        </div>
      )}

      {!authLoading && !user && (
        <div className="bg-red-100 p-4 rounded mb-4">
          <p>❌ No authenticated user found. Please log in.</p>
        </div>
      )}

      {!authLoading && user && isLoading && (
        <div className="bg-blue-100 p-4 rounded mb-4">
          <p>🔄 Loading thesis data...</p>
        </div>
      )}

      {!authLoading && user && (
        <div className="bg-gray-100 p-4 rounded mb-4">
          <h3 className="font-bold">User Info:</h3>
          <pre>{JSON.stringify({ id: user?.id, email: user?.email }, null, 2)}</pre>
        </div>
      )}

      {error && (
        <div className="bg-red-100 p-4 rounded mb-4">
          <h3 className="font-bold text-red-700">Error:</h3>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {!isLoading && (
        <div className="bg-blue-100 p-4 rounded">
          <h3 className="font-bold">Thesis Data:</h3>
          <p className="mb-2">Found {thesisData?.length || 0} thesis records</p>
          
          {thesisData && thesisData.length > 0 ? (
            thesisData.map((thesis: any, index: number) => (
              <div key={thesis.id} className="bg-white p-4 rounded mt-2">
                <h4 className="font-semibold">Thesis {index + 1}:</h4>
                <pre className="text-sm mt-2 overflow-auto">
                  {JSON.stringify(thesis, null, 2)}
                </pre>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No thesis records found</p>
          )}
        </div>
      )}
    </div>
  )
}
