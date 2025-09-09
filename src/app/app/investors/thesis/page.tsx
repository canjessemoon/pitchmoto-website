'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { InvestmentThesisWizard } from '@/components/matching'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle } from 'lucide-react'

interface ThesisFormData {
  min_funding_ask: number
  max_funding_ask: number
  preferred_industries: string[]
  preferred_stages: string[]
  preferred_locations: string[]
  min_equity_percentage: number
  max_equity_percentage: number
  industry_weight: number
  stage_weight: number
  funding_weight: number
  location_weight: number
  traction_weight: number
  team_weight: number
  keywords: string[]
  exclude_keywords: string[]
}

export default function InvestmentThesisPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isEdit = searchParams.get('edit') === 'true'
  
  const [user, setUser] = useState<any>(null)
  const [existingThesis, setExistingThesis] = useState<Partial<ThesisFormData> | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    checkAuthAndLoadThesis()
  }, [])

  const checkAuthAndLoadThesis = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        router.push('/auth/signin')
        return
      }

      setUser(user)

      // Check user type
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('user_type')
        .eq('user_id', user.id)
        .single()

      if (profileError || !profile || profile.user_type !== 'investor') {
        router.push('/app')
        return
      }

      // Load existing thesis if editing
      if (isEdit) {
        await loadExistingThesis()
      }
    } catch (err) {
      console.error('Auth check error:', err)
      setError('Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  const loadExistingThesis = async () => {
    try {
      const response = await fetch('/api/matching/thesis')
      const data = await response.json()
      
      if (response.ok && data.thesis) {
        setExistingThesis(data.thesis)
      } else if (response.status === 404) {
        // No existing thesis, that's okay for new creation
        setExistingThesis(undefined)
      } else {
        setError('Failed to load existing thesis')
      }
    } catch (err) {
      console.error('Load thesis error:', err)
      setError('Failed to load existing thesis')
    }
  }

  const handleComplete = async (thesisData: ThesisFormData) => {
    if (!user) return

    setIsSaving(true)
    setError(null)

    try {
      const method = existingThesis ? 'PUT' : 'POST'
      const response = await fetch('/api/matching/thesis', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(thesisData)
      })

      const result = await response.json()

      if (response.ok) {
        setShowSuccess(true)
        
        // Trigger match recomputation
        try {
          await fetch('/api/matching/matches', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recompute: true })
          })
        } catch (err) {
          console.error('Match recomputation error:', err)
          // Don't fail the whole process if this fails
        }

        // Redirect to dashboard after success
        setTimeout(() => {
          router.push('/app/investors/dashboard')
        }, 2000)
      } else {
        setError(result.error || 'Failed to save investment thesis')
      }
    } catch (err) {
      console.error('Save thesis error:', err)
      setError('Failed to save investment thesis')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    router.push('/app/investors/dashboard')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E64E1B] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/app/investors/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-green-600 mb-4">
            <CheckCircle className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
          <p className="text-gray-600 mb-4">
            Your investment thesis has been {existingThesis ? 'updated' : 'created'} successfully.
            We're now finding personalized startup matches for you.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="mr-4 flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {existingThesis ? 'Update Investment Thesis' : 'Create Investment Thesis'}
            </h1>
            <p className="text-gray-600 mt-1">
              {existingThesis 
                ? 'Modify your investment criteria to get better startup matches'
                : 'Set your investment criteria to discover relevant startups'
              }
            </p>
          </div>
        </div>

        {/* Wizard Component */}
        <div className="max-w-4xl mx-auto">
          <InvestmentThesisWizard
            onComplete={handleComplete}
            onCancel={handleCancel}
            existingThesis={existingThesis}
            isLoading={isSaving}
          />
        </div>

        {/* Help Section */}
        <div className="max-w-4xl mx-auto mt-12">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Tips for Better Matches</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <h4 className="font-medium mb-2">Be Specific</h4>
                <p>Choose 3-5 industries rather than selecting everything. This helps us find higher quality matches.</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Balance Your Weights</h4>
                <p>Ensure your scoring weights add up to 100% for optimal matching performance.</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Use Keywords Wisely</h4>
                <p>Add specific technology terms or business models you're interested in (e.g., "AI", "B2B SaaS").</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Exclude What You Don't Want</h4>
                <p>Use exclude keywords to filter out industries or approaches you're not interested in.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
