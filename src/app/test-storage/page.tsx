'use client'

import { useState } from 'react'
import FileUpload from '@/components/ui/FileUpload'
import { storageHelpers, fileValidation } from '@/lib/storage-helpers'
import { supabase } from '@/lib/supabase'

export default function StorageTestPage() {
  const [results, setResults] = useState<string[]>([])
  const [testStartupId, setTestStartupId] = useState<string | null>(null)

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const createTestStartup = async () => {
    addResult('🏗️ Creating test startup for file upload testing...')
    
    try {
      // Check authentication first
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        addResult(`❌ Not authenticated - please sign in first`)
        return null
      }

      // Create a test startup
      const response = await fetch('/api/startups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          founder_id: user.id,
          name: 'Test Startup for Storage',
          tagline: 'Testing file uploads',
          description: 'This is a temporary startup created for testing file upload functionality.',
          industry: 'Technology',
          stage: 'Pre-Seed',
          funding_goal: 100000,
          country: 'United States',
          tags: ['test', 'storage']
        })
      })

      if (!response.ok) {
        const error = await response.json()
        addResult(`❌ Failed to create test startup: ${error.error}`)
        return null
      }

      const result = await response.json()
      const startupId = result.startup.id
      setTestStartupId(startupId)
      addResult(`✅ Test startup created: ${startupId}`)
      return startupId
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      addResult(`❌ Error creating test startup: ${errorMessage}`)
      return null
    }
  }

  const testProfilePictureUpload = async (file: File) => {
    addResult(`Testing profile picture upload: ${file.name}`)
    const result = await storageHelpers.uploadProfilePicture(file, 'test-user-123')
    
    if (result.error) {
      addResult(`❌ Profile picture upload failed: ${result.error.message}`)
    } else {
      addResult(`✅ Profile picture uploaded successfully: ${result.data?.publicUrl}`)
    }
    
    return result
  }

  const testLogoUpload = async (file: File) => {
    addResult(`Testing logo upload: ${file.name}`)
    
    // Create or use existing test startup
    const startupId = testStartupId || await createTestStartup()
    if (!startupId) {
      addResult(`❌ Cannot test logo upload without valid startup`)
      return { data: null, error: { message: 'No valid startup for testing' } }
    }
    
    const result = await storageHelpers.uploadLogo(file, startupId)
    
    if (result.error) {
      addResult(`❌ Logo upload failed: ${result.error.message}`)
    } else {
      addResult(`✅ Logo uploaded successfully: ${result.data?.publicUrl}`)
    }
    
    return result
  }

  const testPitchDeckUpload = async (file: File) => {
    addResult(`Testing pitch deck upload: ${file.name}`)
    
    try {
      // Check authentication first
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        addResult(`❌ Not authenticated - please sign in first`)
        return { data: null, error: { message: 'Not authenticated' } }
      }
      addResult(`👤 Authenticated as: ${user.email}`)
      
      // Create or use existing test startup
      const startupId = testStartupId || await createTestStartup()
      if (!startupId) {
        addResult(`❌ Cannot test pitch deck upload without valid startup`)
        return { data: null, error: { message: 'No valid startup for testing' } }
      }
      
      // Add timeout wrapper
      const uploadPromise = storageHelpers.uploadPitchDeck(file, startupId)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Upload timeout after 30 seconds')), 30000)
      )
      
      addResult(`📤 Starting upload... (file size: ${(file.size / 1024 / 1024).toFixed(2)}MB)`)
      
      const result = await Promise.race([uploadPromise, timeoutPromise]) as any
      
      if (result.error) {
        addResult(`❌ Pitch deck upload failed: ${result.error.message}`)
      } else {
        addResult(`✅ Pitch deck uploaded successfully: ${result.data?.signedUrl}`)
      }
      
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      addResult(`❌ Upload error: ${errorMessage}`)
      return { data: null, error: { message: errorMessage } }
    }
  }

  const testVideoUpload = async (file: File) => {
    addResult(`Testing video upload: ${file.name}`)
    const result = await storageHelpers.uploadPitchVideo(file, 'test-startup-101')
    
    if (result.error) {
      addResult(`❌ Video upload failed: ${result.error.message}`)
    } else {
      addResult(`✅ Video uploaded successfully: ${result.data?.signedUrl}`)
    }
    
    return result
  }

  const verifyUploads = async () => {
    if (!testStartupId) {
      addResult('❌ No test startup ID available for verification')
      return
    }

    addResult('🔍 Verifying uploaded files...')

    try {
      // List files in logo bucket
      const logoResult = await storageHelpers.listFiles('logo', testStartupId)
      if (logoResult.error) {
        addResult(`❌ Error listing logo files: ${logoResult.error.message}`)
      } else {
        addResult(`📁 Logo files found: ${logoResult.data?.length || 0}`)
        logoResult.data?.forEach(file => {
          addResult(`  • ${file.name} (${file.metadata?.size} bytes)`)
        })
      }

      // List files in pitch-decks bucket
      const pitchDeckResult = await storageHelpers.listFiles('pitch-decks', testStartupId)
      if (pitchDeckResult.error) {
        addResult(`❌ Error listing pitch deck files: ${pitchDeckResult.error.message}`)
      } else {
        addResult(`📁 Pitch deck files found: ${pitchDeckResult.data?.length || 0}`)
        pitchDeckResult.data?.forEach(file => {
          addResult(`  • ${file.name} (${file.metadata?.size} bytes)`)
        })
      }

      // Test signed URL generation
      if (pitchDeckResult.data && pitchDeckResult.data.length > 0) {
        const fileName = `${testStartupId}/pitch-deck.pdf`
        const signedUrlResult = await storageHelpers.getSignedUrl('pitch-decks', fileName, 300)
        if (signedUrlResult.error) {
          addResult(`❌ Error getting signed URL: ${signedUrlResult.error.message}`)
        } else {
          addResult(`✅ Signed URL generated successfully`)
          addResult(`🔗 URL: ${signedUrlResult.data?.signedUrl?.substring(0, 80)}...`)
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      addResult(`❌ Verification error: ${errorMessage}`)
    }
  }

  const clearResults = () => {
    setResults([])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Supabase Storage Test
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Tests */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Profile Picture Upload Test</h2>
              <p className="text-sm text-gray-600 mb-4">
                Test uploading profile pictures (public bucket)
              </p>
              <FileUpload
                onUpload={testProfilePictureUpload}
                accept="image/jpeg,image/png,image/webp"
                maxSize={5 * 1024 * 1024}
                uploadText="Upload Profile Picture"
                validate={fileValidation.validateImage}
              />
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Logo Upload Test</h2>
              <p className="text-sm text-gray-600 mb-4">
                Test uploading startup logos (public bucket)
              </p>
              <FileUpload
                onUpload={testLogoUpload}
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                maxSize={2 * 1024 * 1024}
                uploadText="Upload Startup Logo"
                validate={fileValidation.validateImage}
              />
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Pitch Deck Upload Test</h2>
              <p className="text-sm text-gray-600 mb-4">
                Test uploading PDF pitch decks (private bucket)
              </p>
              <FileUpload
                onUpload={testPitchDeckUpload}
                accept="application/pdf"
                maxSize={50 * 1024 * 1024}
                uploadText="Upload Pitch Deck PDF"
                validate={fileValidation.validatePDF}
              />
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Video Upload Test</h2>
              <p className="text-sm text-gray-600 mb-4">
                Test uploading pitch videos (private bucket)
              </p>
              <FileUpload
                onUpload={testVideoUpload}
                accept="video/mp4,video/webm,video/quicktime"
                maxSize={500 * 1024 * 1024}
                uploadText="Upload Pitch Video"
                validate={fileValidation.validateVideo}
              />
            </div>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Test Setup</h2>
                <div className="space-x-2">
                  <button
                    onClick={createTestStartup}
                    disabled={!!testStartupId}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {testStartupId ? 'Test Startup Ready' : 'Create Test Startup'}
                  </button>
                  <button
                    onClick={verifyUploads}
                    disabled={!testStartupId}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                  >
                    Verify Uploads
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-100 p-3 rounded text-sm">
                <p><strong>Current Test Startup ID:</strong> {testStartupId || 'None created yet'}</p>
                <p className="text-gray-600 mt-1">
                  {testStartupId 
                    ? '✅ Ready for file upload testing' 
                    : '⚠️ Create a test startup first to enable file uploads'
                  }
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Test Results</h2>
                <button
                  onClick={clearResults}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Clear
                </button>
              </div>
              
              <div className="bg-gray-100 p-4 rounded font-mono text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
                {results.length > 0 ? results.join('\n') : 'No tests run yet. Try uploading a file!'}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
              <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Before Testing:</h3>
              <ol className="text-sm text-yellow-700 space-y-1">
                <li>1. Create the storage buckets in Supabase dashboard first</li>
                <li>2. Set up the storage policies</li>
                <li>3. Make sure you're signed in (some uploads require auth)</li>
                <li>4. Check console for detailed error messages</li>
              </ol>
            </div>

            <div className="bg-green-50 border border-green-200 p-4 rounded">
              <h3 className="font-semibold text-green-800 mb-2">📋 Storage Setup Status:</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>✅ Storage helpers implemented</li>
                <li>✅ File validation ready</li>
                <li>✅ Upload components built</li>
                <li>✅ Buckets created via SQL script</li>
                <li>✅ Storage policies configured</li>
                <li>✅ Infrastructure ready for testing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
