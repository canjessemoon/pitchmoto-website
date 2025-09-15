import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  
  // Extract all possible parameters
  const code = requestUrl.searchParams.get('code')  // OAuth PKCE flow
  const token = requestUrl.searchParams.get('token')  // Email verification (legacy)
  const token_hash = requestUrl.searchParams.get('token_hash')  // Email verification (hashed)
  const type = requestUrl.searchParams.get('type')  // signup, email_change, etc.
  const error = requestUrl.searchParams.get('error')
  const errorCode = requestUrl.searchParams.get('error_code')
  const errorDescription = requestUrl.searchParams.get('error_description')

  console.log('Auth callback params:', { 
    hasCode: !!code, 
    hasToken: !!token, 
    hasTokenHash: !!token_hash, 
    type, 
    error, 
    errorCode 
  })

  // Handle authentication errors first
  if (error) {
    let redirectUrl = '/signin'
    let errorMessage = 'Authentication failed'

    if (errorCode === 'otp_expired') {
      errorMessage = 'Your email verification link has expired. Please request a new one.'
    } else if (errorCode === 'access_denied') {
      errorMessage = 'Access denied. Please try again.'
    } else if (errorDescription) {
      errorMessage = decodeURIComponent(errorDescription.replace(/\+/g, ' '))
    }

    console.log('Auth error detected:', { error, errorCode, errorMessage })
    redirectUrl += `?error=${encodeURIComponent(errorMessage)}`
    return NextResponse.redirect(new URL(redirectUrl, requestUrl.origin))
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    // Path 1: Email verification with hashed token (recommended)
    if (token_hash && type) {
      console.log('Processing hashed email verification:', { type })
      
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        type: type as any,
        token_hash
      })
      
      if (verifyError) {
        console.error('Hashed email verification failed:', verifyError)
        return NextResponse.redirect(new URL('/signin?error=Failed to verify email', requestUrl.origin))
      }
      
      console.log('Hashed email verification successful')
      return NextResponse.redirect(new URL('/app', requestUrl.origin))
    }

    // Path 2: Email verification with plain token (legacy)
    if (token && type) {
      console.log('Processing legacy email verification:', { type, tokenPrefix: token.substring(0, 10) })
      
      // For link-based verification, we need to handle this as a session creation
      // The token in the URL is actually meant to be processed by Supabase's auth system
      try {
        // Get session from the current request - Supabase may have already processed it
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (session) {
          console.log('Session found after token verification')
          return NextResponse.redirect(new URL('/app', requestUrl.origin))
        }
        
        // If no session, the token might be expired or invalid
        console.log('No session found, token may be expired')
        return NextResponse.redirect(new URL('/signin?error=Email verification failed - please try signing in directly', requestUrl.origin))
        
      } catch (error) {
        console.error('Error handling legacy token verification:', error)
        return NextResponse.redirect(new URL('/signin?error=Failed to verify email', requestUrl.origin))
      }
    }

    // Path 3: OAuth PKCE code exchange (separate from email verification)
    if (code) {
      console.log('Processing OAuth PKCE code exchange')
      
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('OAuth code exchange failed:', exchangeError)
        return NextResponse.redirect(new URL('/signin?error=Failed to complete OAuth authentication', requestUrl.origin))
      }
      
      console.log('OAuth code exchange successful')
      return NextResponse.redirect(new URL('/app', requestUrl.origin))
    }

  } catch (error) {
    console.error('Unexpected error in auth callback:', error)
    return NextResponse.redirect(new URL('/signin?error=Authentication failed', requestUrl.origin))
  }

  // No valid parameters found
  console.log('No valid auth parameters found, redirecting to signin')
  return NextResponse.redirect(new URL('/signin?error=Invalid authentication request', requestUrl.origin))
}
