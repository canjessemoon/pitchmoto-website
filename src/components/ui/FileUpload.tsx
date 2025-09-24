'use client'

import React, { useState, useRef } from 'react'
import { Upload, X, File, Image } from 'lucide-react'

interface FileUploadProps {
  onUpload: (file: File) => Promise<{ data: any; error: any }>
  accept: string
  maxSize: number
  uploadText: string
  className?: string
  validate?: (file: File) => { valid: boolean; error: string | null }
}

export default function FileUpload({ 
  onUpload, 
  accept, 
  maxSize, 
  uploadText, 
  className = '',
  validate 
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url?: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)

    // Validate file if validation function provided
    if (validate) {
      const validation = validate(file)
      if (!validation.valid) {
        setError(validation.error)
        return
      }
    }

    // Check file size
    if (file.size > maxSize) {
      setError(`File must be less than ${Math.round(maxSize / 1024 / 1024)}MB`)
      return
    }

    setUploading(true)

    try {
      const { data, error } = await onUpload(file)

      if (error) {
        setError(error.message || 'Upload failed')
      } else {
        setUploadedFile({ 
          name: file.name, 
          url: data?.publicUrl || data?.signedUrl || data?.path // Support new path-only format
        })
        setError(null)
      }
    } catch (err) {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setUploadedFile(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const isImage = accept.includes('image')

  return (
    <div className={`space-y-4 ${className}`}>
      {!uploadedFile ? (
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full flex flex-col items-center justify-center px-6 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            ) : isImage ? (
              <Image className="h-12 w-12 text-gray-400 mb-4" />
            ) : (
              <Upload className="h-12 w-12 text-gray-400 mb-4" />
            )}
            
            <span className="text-sm font-medium text-gray-900 mb-2">
              {uploading ? 'Uploading...' : uploadText}
            </span>
            
            <span className="text-xs text-gray-500">
              Max size: {Math.round(maxSize / 1024 / 1024)}MB
            </span>
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <File className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-900">{uploadedFile.name}</p>
              <p className="text-xs text-green-600">Upload successful</p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={handleRemove}
            className="p-1 hover:bg-green-100 rounded-full transition-colors"
          >
            <X className="h-4 w-4 text-green-600" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  )
}
