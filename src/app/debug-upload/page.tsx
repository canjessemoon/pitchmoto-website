'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { storageHelpers } from '@/lib/storage-helpers'

interface DiagnosticResult {
  test: string
  status: 'pending' | 'success' | 'error'
  details: any
  timestamp: string
}

export default function DebugUploadPage() {
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const addResult = (test: string, status: 'success' | 'error', details: any) => {
    setResults(prev => [...prev, {
      test,
      status,
      details,
      timestamp: new Date().toISOString()
    }])
  }

  const runDiagnostics = async () => {
    setIsRunning(true)
    setResults([])

    try {
      // Test 1: Authentication Check with session check first
      console.log('🔍 Starting Authentication Check...')
      try {
        // First check for session (faster)
        const { data: sessionData } = await supabase.auth.getSession()
        
        if (!sessionData?.session) {
          addResult('Authentication', 'error', { error: 'No active session found' })
          setIsRunning(false)
          return
        }
        
        // Then get user details
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) throw error
        
        addResult('Authentication', 'success', {
          userId: user?.id,
          email: user?.email,
          role: user?.user_metadata?.user_type,
          aud: user?.aud
        })
      } catch (error: any) {
        console.error('❌ Authentication failed:', error)
        addResult('Authentication', 'error', { error: error.message })
        setIsRunning(false)
        return // Stop if auth fails
      }

      // Test 2: Token Details
      console.log('🔍 Starting Token Analysis...')
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.access_token) {
          // Decode JWT manually (unsafe but for debugging)
          const tokenParts = session.access_token.split('.')
          const payload = JSON.parse(atob(tokenParts[1]))
          addResult('Token Analysis', 'success', {
            tokenPreview: session.access_token.substring(0, 20) + '...',
            decodedPayload: payload,
            expiresAt: new Date(payload.exp * 1000).toISOString()
          })
        } else {
          throw new Error('No access token found')
        }
      } catch (error: any) {
        console.error('❌ Token Analysis failed:', error)
        addResult('Token Analysis', 'error', { error: error.message })
      }

      // Test 3: Storage Bucket Access
      console.log('🔍 Testing Bucket Access...')
      try {
        const { data: files, error } = await supabase.storage
          .from('pitch-decks')
          .list('', { limit: 1 })
        
        if (error) throw error
        addResult('Bucket Access', 'success', {
          bucketAccessible: true,
          filesFound: files?.length || 0
        })
      } catch (error: any) {
        console.error('❌ Bucket Access failed:', error)
        addResult('Bucket Access', 'error', { error: error.message })
      }

      // Test 4: RLS Policy Check via Query  
      console.log('🔍 Checking RLS Policies...')
      try {
        const { data: policies, error } = await supabase
          .from('pg_policies')
          .select('*')
          .eq('schemaname', 'storage')
          .eq('tablename', 'objects')
        
        if (error) throw error
        addResult('RLS Policies', 'success', {
          policiesFound: policies?.length || 0,
          policies: policies
        })
      } catch (error: any) {
        console.error('❌ RLS Policies failed:', error)
        addResult('RLS Policies', 'error', { error: error.message })
      }

      // Test 5: Bucket Configuration
      console.log('🔍 Checking Bucket Configuration...')
      try {
        const { data: buckets, error } = await supabase
          .from('storage.buckets')
          .select('*')
          .eq('id', 'pitch-decks')
        
        if (error) throw error
        addResult('Bucket Config', 'success', {
          bucket: buckets?.[0] || null,
          allowedMimeTypes: buckets?.[0]?.allowed_mime_types
        })
      } catch (error: any) {
        console.error('❌ Bucket Config failed:', error)
        addResult('Bucket Config', 'error', { error: error.message })
      }

      // Test 6: Direct Storage API Test with timeout
      console.log('🔍 Testing Direct Upload...')
      try {
        const testFile = new Blob(['test content'], { type: 'text/plain' })
        
        // Add timeout to prevent hanging
        const uploadPromise = supabase.storage
          .from('pitch-decks')
          .upload(`debug-test-${Date.now()}.txt`, testFile, {
            cacheControl: '3600',
            upsert: true
          })
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Upload timeout after 10 seconds')), 10000)
        )
        
        const { data, error } = await Promise.race([uploadPromise, timeoutPromise]) as any
        
        if (error) throw error
        addResult('Direct Upload Test', 'success', {
          uploadPath: data?.path,
          fullPath: data?.fullPath
        })
      } catch (error: any) {
        console.error('❌ Direct Upload failed:', error)
        addResult('Direct Upload Test', 'error', { 
          error: error.message,
          errorType: error.name,
          timeout: error.message.includes('timeout')
        })
      }

      console.log('✅ All diagnostics completed!')

    } catch (error: any) {
      console.error('❌ Diagnostics Error:', error)
      addResult('Diagnostics Error', 'error', { 
        error: error.message,
        stack: error.stack 
      })
    } finally {
      setIsRunning(false)
    }
  }

  const testDirectSupabaseUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first')
      return
    }

    setResults(prev => [...prev, {
      test: 'Direct Supabase Upload',
      status: 'pending',
      details: { 
        fileName: selectedFile.name, 
        fileSize: selectedFile.size, 
        fileType: selectedFile.type,
        note: 'Bypassing storage-helpers function'
      },
      timestamp: new Date().toISOString()
    }])

    try {
      const fileName = `test-direct-${Date.now()}-${selectedFile.name}`
      
      // Convert File to Blob with explicit type
      const fileBlob = new Blob([selectedFile], { type: selectedFile.type || 'application/pdf' })
      
      const uploadPromise = supabase.storage
        .from('pitch-decks')
        .upload(fileName, fileBlob, {
          cacheControl: '3600',
          upsert: true,
          contentType: selectedFile.type || 'application/pdf'
        })
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Direct upload timeout after 15 seconds')), 15000)
      )
      
      const { data, error } = await Promise.race([uploadPromise, timeoutPromise]) as any
      
      if (error) throw error
      
      addResult('Direct Supabase Upload', 'success', {
        uploadPath: data?.path,
        fullPath: data?.fullPath,
        fileName: fileName
      })
    } catch (error: any) {
      addResult('Direct Supabase Upload', 'error', { 
        error: error.message,
        errorType: error.name,
        timeout: error.message.includes('timeout'),
        stack: error.stack
      })
    }
  }

  const testActualUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first')
      return
    }

    setResults(prev => [...prev, {
      test: 'Actual File Upload',
      status: 'pending',
      details: { fileName: selectedFile.name, fileSize: selectedFile.size, fileType: selectedFile.type },
      timestamp: new Date().toISOString()
    }])

    try {
      // Add timeout to prevent hanging
      const uploadPromise = storageHelpers.uploadPitchDeck(selectedFile, 'test-startup-id')
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Upload timeout after 15 seconds')), 15000)
      )
      
      const result = await Promise.race([uploadPromise, timeoutPromise])
      addResult('Actual File Upload', 'success', result)
    } catch (error: any) {
      addResult('Actual File Upload', 'error', { 
        error: error.message,
        errorType: error.name,
        timeout: error.message.includes('timeout'),
        stack: error.stack
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🔧 Upload Troubleshooting Dashboard
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Diagnostic Controls</h2>
          
          <div className="flex gap-4 mb-6">
            <button
              onClick={runDiagnostics}
              disabled={isRunning}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-50 hover:bg-blue-700"
            >
              {isRunning ? 'Running Diagnostics...' : 'Run Full Diagnostics'}
            </button>
            
            <button
              onClick={() => setResults([])}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              Clear Results
            </button>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Test Actual Upload</h3>
            <div className="flex gap-4 items-center mb-4">
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                accept=".pdf,.jpg,.jpeg,.png,.webp,.gif"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <button
                onClick={testActualUpload}
                disabled={!selectedFile}
                className="bg-green-600 text-white px-6 py-2 rounded-lg disabled:opacity-50 hover:bg-green-700"
              >
                Test Upload
              </button>
            </div>
            
            <button
              onClick={testDirectSupabaseUpload}
              disabled={!selectedFile}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg disabled:opacity-50 hover:bg-purple-700"
            >
              Test Direct Supabase Upload (bypass helper)
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Diagnostic Results</h2>
          
          {results.length === 0 && (
            <p className="text-gray-500 italic">No diagnostics run yet. Click "Run Full Diagnostics" to start.</p>
          )}

          {results.map((result, index) => (
            <div key={index} className="border rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">{result.test}</h3>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    result.status === 'success' ? 'bg-green-100 text-green-800' :
                    result.status === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {result.status === 'success' ? '✅ Success' :
                     result.status === 'error' ? '❌ Error' : '⏳ Pending'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}