import { supabase } from './supabase'

export const storageHelpers = {
  // Upload profile picture
  uploadProfilePicture: async (file: File, userId: string) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/profile-picture.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from('profile-picture')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      })
    
    if (error) return { data: null, error }
    
    const { data: { publicUrl } } = supabase.storage
      .from('profile-picture')
      .getPublicUrl(fileName)
    
    return { data: { path: data.path, publicUrl }, error: null }
  },

  // Upload startup logo
  uploadLogo: async (file: File, startupId: string) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${startupId}/logo.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from('logo')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      })
    
    if (error) return { data: null, error }
    
    const { data: { publicUrl } } = supabase.storage
      .from('logo')
      .getPublicUrl(fileName)
    
    return { data: { path: data.path, publicUrl }, error: null }
  },

  // Upload pitch deck (PDF)
  uploadPitchDeck: async (file: File, startupId: string) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${startupId}/pitch-deck.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from('pitch-decks')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      })
    
    if (error) return { data: null, error }
    
    // Get signed URL for private access
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('pitch-decks')
      .createSignedUrl(fileName, 3600) // 1 hour expiry
    
    if (urlError) return { data: null, error: urlError }
    
    return { data: { path: data.path, signedUrl: signedUrlData.signedUrl }, error: null }
  },

  // Upload pitch video
  uploadPitchVideo: async (file: File, startupId: string) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${startupId}/pitch-video.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from('pitch-videos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      })
    
    if (error) return { data: null, error }
    
    // Get signed URL for private access
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('pitch-videos')
      .createSignedUrl(fileName, 3600) // 1 hour expiry
    
    if (urlError) return { data: null, error: urlError }
    
    return { data: { path: data.path, signedUrl: signedUrlData.signedUrl }, error: null }
  },

  // Get signed URL for private files
  getSignedUrl: async (bucket: string, path: string, expiresIn: number = 3600) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn)
    
    return { data, error }
  },

  // Delete file
  deleteFile: async (bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([path])
    
    return { data, error }
  },

  // List files in folder
  listFiles: async (bucket: string, folder?: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder, {
        limit: 100,
        offset: 0
      })
    
    return { data, error }
  }
}

// File validation helpers
export const fileValidation = {
  validateImage: (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
    const maxSize = 5 * 1024 * 1024 // 5MB
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Please upload a valid image (JPEG, PNG, WebP, or SVG)' }
    }
    
    if (file.size > maxSize) {
      return { valid: false, error: 'Image must be less than 5MB' }
    }
    
    return { valid: true, error: null }
  },

  validatePDF: (file: File) => {
    const allowedTypes = ['application/pdf']
    const maxSize = 50 * 1024 * 1024 // 50MB
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Please upload a PDF file' }
    }
    
    if (file.size > maxSize) {
      return { valid: false, error: 'PDF must be less than 50MB' }
    }
    
    return { valid: true, error: null }
  },

  validateVideo: (file: File) => {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime']
    const maxSize = 500 * 1024 * 1024 // 500MB
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Please upload a valid video (MP4, WebM, or MOV)' }
    }
    
    if (file.size > maxSize) {
      return { valid: false, error: 'Video must be less than 500MB' }
    }
    
    return { valid: true, error: null }
  }
}
