'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function RequestCodePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [codeSent, setCodeSent] = useState(false)

  const handleSendCode = async () => {
    if (!email) {
      setError('Email is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('Requesting OTP code for email:', email)
      
      // Send OTP code for existing user
      const { data, error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false // User should already exist from signup
        }
      })

      if (otpError) {
        console.error('Failed to send OTP:', otpError)
        setError(`Failed to send code: ${otpError.message}`)
        return
      }

      console.log('OTP code sent successfully')
      setCodeSent(true)
      setError('')

    } catch (error) {
      console.error('Unexpected error:', error)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !code) {
      setError('Please enter the verification code')
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('Verifying OTP code:', { email, codeLength: code.length })
      
      // Verify the OTP code
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email'
      })

      if (verifyError) {
        console.error('OTP verification failed:', verifyError)
        setError(`Verification failed: ${verifyError.message}`)
        return
      }

      console.log('OTP verification successful', data)
      setSuccess(true)
      
      // Wait a moment then redirect
      setTimeout(() => {
        router.push('/app')
      }, 1500)

    } catch (error) {
      console.error('Unexpected error:', error)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Email Verified!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Redirecting you to the app...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {codeSent ? 'Enter the 6-digit code from your email' : 'Request a verification code'}
          </p>
          {email && (
            <p className="mt-1 text-center text-xs text-gray-500">
              Email: {email}
            </p>
          )}
        </div>
        
        {!codeSent ? (
          // Step 1: Request OTP code
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Your account was created successfully. 
                <br />
                Click below to receive a 6-digit verification code.
              </p>
              <button
                onClick={handleSendCode}
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#405B53] hover:bg-[#334A42] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#405B53] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
              </button>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}
          </div>
        ) : (
          // Step 2: Enter OTP code
          <form className="mt-8 space-y-6" onSubmit={handleVerifyCode}>
            <div>
              <label htmlFor="code" className="sr-only">
                Verification Code
              </label>
              <input
                id="code"
                name="code"
                type="text"
                maxLength={6}
                pattern="[0-9]{6}"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#405B53] focus:border-[#405B53] focus:z-10 sm:text-sm text-center text-2xl tracking-widest"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#405B53] hover:bg-[#334A42] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#405B53] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleSendCode}
                disabled={loading}
                className="text-sm text-[#405B53] hover:text-[#334A42] underline"
              >
                Resend code
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
