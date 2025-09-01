'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authHelpers, profileHelpers } from '@/lib/auth-helpers'
import { signUpSchema, type SignUpData } from '@/lib/validations'

export default function InvestorSignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<SignUpData & { 
    confirmPassword: string
    investorType: 'angel' | 'vc' | 'institutional' | 'other'
    company?: string
    linkedinUrl?: string
  }>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    userType: 'investor',
    investorType: 'angel',
    company: '',
    linkedinUrl: ''
  })
  const [errors, setErrors] = useState<Partial<SignUpData & { confirmPassword: string }>>({})
  const [loading, setLoading] = useState(false)

  const handleOAuthSignIn = async (provider: 'google' | 'linkedin') => {
    try {
      let result
      if (provider === 'google') {
        result = await authHelpers.signInWithGoogle()
      } else {
        result = await authHelpers.signInWithLinkedIn()
      }
      
      if (result.error) {
        console.error('OAuth sign in error:', result.error)
        alert('Sign up failed. Please try again.')
      }
      // Note: OAuth will redirect to callback page automatically
    } catch (error) {
      console.error('OAuth sign in error:', error)
      alert('An unexpected error occurred. Please try again.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      // Check if passwords match
      if (formData.password !== formData.confirmPassword) {
        setErrors({ confirmPassword: 'Passwords do not match' })
        setLoading(false)
        return
      }

      // Validate basic form data
      const validatedData = signUpSchema.parse({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        userType: formData.userType
      })

      // Sign up user with timeout protection
      const signupPromise = authHelpers.signUpWithEmail(
        validatedData.email,
        validatedData.password,
        validatedData.fullName,
        'investor'
      )
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Signup timeout')), 30000) // Increased to 30 seconds
      )
      
      const { data, error } = await Promise.race([signupPromise, timeoutPromise]) as any

      if (error) {
        setErrors({ email: error.message })
        setLoading(false)
        return
      }

      if (data.user) {
        // Skip profile creation here - let the database trigger handle it
        // This prevents the hanging issue
        alert('Investor account created successfully! Please check your email to verify your account.')
        router.push('/signin')
      }
    } catch (error: any) {
      if (error.message === 'Signup timeout') {
        // Even if it times out, the signup might have worked
        alert('Account creation is taking longer than expected. Please check your email for a verification link, or try signing in.')
        router.push('/signin')
      } else if (error.errors) {
        const fieldErrors: Partial<SignUpData> = {}
        error.errors.forEach((err: any) => {
          fieldErrors[err.path[0] as keyof SignUpData] = err.message
        })
        setErrors(fieldErrors)
      } else {
        setErrors({ email: 'An unexpected error occurred' })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name as keyof SignUpData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link href="/" className="flex justify-center">
            <span className="text-3xl font-bold">
              <span className="text-blue-600">Pitch</span>
              <span className="text-indigo-500">Moto</span>
            </span>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Join as an Investor
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Discover and invest in the next big startup
          </p>
          <p className="mt-1 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/signin" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>
        
        {/* OAuth Buttons */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => handleOAuthSignIn('linkedin')}
            className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-5 h-5 mr-2" fill="#0077B5" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            Continue with LinkedIn (Recommended)
          </button>
          
          <button
            type="button"
            onClick={() => handleOAuthSignIn('google')}
            className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 text-gray-500">Or continue with email</span>
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                value={formData.fullName}
                onChange={handleChange}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.fullName ? 'border-red-500' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="Enter your full name"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="Create a password (min 8 characters)"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="investorType" className="block text-sm font-medium text-gray-700">
                Investor Type
              </label>
              <select
                id="investorType"
                name="investorType"
                required
                value={formData.investorType}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="angel">Angel Investor</option>
                <option value="vc">Venture Capital</option>
                <option value="institutional">Institutional Investor</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                Company/Fund (Optional)
              </label>
              <input
                id="company"
                name="company"
                type="text"
                value={formData.company}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="e.g., Sequoia Capital, Personal Investments"
              />
            </div>
            
            <div>
              <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700">
                LinkedIn Profile (Optional)
              </label>
              <input
                id="linkedinUrl"
                name="linkedinUrl"
                type="url"
                value={formData.linkedinUrl}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="https://linkedin.com/in/your-profile"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Investor Account'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500">
                Privacy Policy
              </a>
            </p>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Are you a founder?{' '}
            <Link href="/signup/founder" className="font-medium text-[#E64E1B] hover:text-[#d93e0f]">
              Sign up as a founder instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
