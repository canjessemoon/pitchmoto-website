import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Function to create supabase admin client
function createSupabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL')
    return null
  }
  
  // Try multiple possible service key environment variables
  const serviceKey = process.env.SUPABASE_SECRET_KEY || 
                    process.env.SUPABASE_SERVICE_ROLE_KEY || 
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!serviceKey) {
    console.error('Missing Supabase service key - checked SUPABASE_SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY, and NEXT_PUBLIC_SUPABASE_ANON_KEY')
    return null
  }
  
  console.log('Using service key:', serviceKey.substring(0, 20) + '...')
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = createSupabaseAdmin()
    
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }
    
    const { searchParams } = new URL(request.url)
    const bucket = searchParams.get('bucket')
    const filePath = searchParams.get('path')
    const expiresIn = parseInt(searchParams.get('expires') || '3600') // Default 1 hour
    
    if (!bucket || !filePath) {
      return NextResponse.json(
        { error: 'Missing bucket or path parameter' },
        { status: 400 }
      )
    }
    
    console.log('🔗 Generating fresh signed URL:', { bucket, filePath, expiresIn })
    
    // Extract just the path if a full URL was passed
    let cleanPath = filePath
    if (filePath.includes('supabase.co')) {
      // Extract path from full signed URL
      // URL format: https://xxx.supabase.co/storage/v1/object/sign/bucket-name/actual-path?token=...
      const match = filePath.match(/\/storage\/v1\/object\/sign\/[^/]+\/(.+?)(?:\?|$)/)
      if (match && match[1]) {
        cleanPath = match[1]
        console.log('Extracted clean path from URL:', cleanPath)
      } else {
        console.error('Failed to extract path from URL:', filePath)
        return NextResponse.json(
          { error: 'Invalid file path format' },
          { status: 400 }
        )
      }
    }
    
    // Generate a fresh signed URL
    const { data: signedUrlData, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(cleanPath, expiresIn)
    
    if (error) {
      console.error('❌ Signed URL error:', error)
      return NextResponse.json(
        { error: 'Failed to generate signed URL: ' + error.message },
        { status: 500 }
      )
    }
    
    console.log('✅ Fresh signed URL generated successfully')
    
    return NextResponse.json({
      success: true,
      signedUrl: signedUrlData.signedUrl
    })
    
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}