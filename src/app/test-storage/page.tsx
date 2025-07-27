'use client'

import { useState } from 'react'
import FileUpload from '@/components/ui/FileUpload'
import { storageHelpers, fileValidation } from '@/lib/storage-helpers'

export default function StorageTestPage() {
  const [results, setResults] = useState<string[]>([])

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
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
    const result = await storageHelpers.uploadLogo(file, 'test-startup-456')
    
    if (result.error) {
      addResult(`❌ Logo upload failed: ${result.error.message}`)
    } else {
      addResult(`✅ Logo uploaded successfully: ${result.data?.publicUrl}`)
    }
    
    return result
  }

  const testPitchDeckUpload = async (file: File) => {
    addResult(`Testing pitch deck upload: ${file.name}`)
    const result = await storageHelpers.uploadPitchDeck(file, 'test-startup-789')
    
    if (result.error) {
      addResult(`❌ Pitch deck upload failed: ${result.error.message}`)
    } else {
      addResult(`✅ Pitch deck uploaded successfully: ${result.data?.signedUrl}`)
    }
    
    return result
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

            <div className="bg-blue-50 border border-blue-200 p-4 rounded">
              <h3 className="font-semibold text-blue-800 mb-2">📋 Storage Setup Status:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>✅ Storage helpers implemented</li>
                <li>✅ File validation ready</li>
                <li>✅ Upload components built</li>
                <li>🔄 Buckets need to be created in dashboard</li>
                <li>🔄 Storage policies need to be set</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
