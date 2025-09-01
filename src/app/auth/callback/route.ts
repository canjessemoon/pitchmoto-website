import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorCode = requestUrl.searchParams.get('error_code')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Handle authentication errors (like expired verification links)
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

    redirectUrl += `?error=${encodeURIComponent(errorMessage)}`
    return NextResponse.redirect(new URL(redirectUrl, requestUrl.origin))
  }

  // Handle OAuth callback with code exchange
  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    try {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Error exchanging code for session:', exchangeError)
        return NextResponse.redirect(new URL('/signin?error=Failed to complete authentication', requestUrl.origin))
      }
      
      // Successful authentication - redirect to app
      return NextResponse.redirect(new URL('/app', requestUrl.origin))
    } catch (error) {
      console.error('Error in auth callback:', error)
      return NextResponse.redirect(new URL('/signin?error=Authentication failed', requestUrl.origin))
    }
  }

  // No code or error - redirect to signin
  return NextResponse.redirect(new URL('/signin', requestUrl.origin))
}
