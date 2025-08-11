'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

export default function SignUpPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get the role from URL params (default to 'founder')
  const roleParam = searchParams.get('role')
  const initialRole = (roleParam === 'investor' || roleParam === 'founder') ? roleParam : 'founder'
  
  const [userType, setUserType] = useState<'founder' | 'investor'>(initialRole)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (userType === 'founder') {
        // Redirect to founder signup process
        router.push('/foundersignup')
      } else {
        // Redirect to investor signup process (to be created)
        router.push('/investorsignup')
      }
    } catch (error) {
      console.error('Navigation error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target
    setUserType(value as 'founder' | 'investor')
  }

  return (
    <div className="bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto space-y-6">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Let's get started
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/signin" className="font-medium text-blue-600 hover:text-blue-500">
              sign in to your existing account
            </Link>
          </p>
        </div>
        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="userType" className="block text-sm font-medium text-gray-700">
                I am...
              </label>
              <select
                id="userType"
                name="userType"
                required
                value={userType}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="founder">a Founder / Entrepreneur</option>
                <option value="investor">an Investor</option>
              </select>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Please wait...' : 'Continue'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              By continuing, you agree to our{' '}
              <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                Privacy Policy
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
