'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { InvestmentThesisWizard } from '@/components/matching'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { useAuthUser } from '@/components/auth/use-auth-user'

interface ThesisFormData {
  min_funding_ask: number
  max_funding_ask: number
  preferred_industries: string[]
  preferred_stages: string[]
  countries: string[]
  no_location_pref: boolean
  remote_ok: boolean
  industry_weight: number
  stage_weight: number
  funding_weight: number
  location_weight: number
  traction_weight: number
  team_weight: number
  keywords: string[]
  exclude_keywords: string[]
}

function ThesisPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isEdit = searchParams.get('edit') === 'true'
  const { user, profile, isLoading: authLoading } = useAuthUser()
  
  const [existingThesis, setExistingThesis] = useState<Partial<ThesisFormData> | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (user && !authLoading && profile?.user_type === 'investor') {
      loadExistingThesis()
    } else if (!authLoading && profile?.user_type !== 'investor') {
      router.push('/dashboard')
    }
  }, [user, authLoading, profile, router])

  const loadExistingThesis = async () => {
    if (!isEdit) {
      setIsLoading(false)
      return
    }

    try {
      const { data: thesis, error } = await supabase
        .from('investor_theses')
        .select('*')
        .eq('investor_id', user?.id)
        .eq('is_active', true)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }

      if (thesis) {
        setExistingThesis(thesis)
      } else {
        setExistingThesis(undefined)
      }
    } catch (err: any) {
      console.error('Load thesis error:', err)
      setError('Failed to load existing thesis')
    } finally {
      setIsLoading(false)
    }
  }

  const handleComplete = async (thesisData: ThesisFormData) => {
    if (!user) {
      setError('User not authenticated')
      return
    }

    console.log('Starting thesis save...', { userId: user.id, userEmail: user.email })
    
    // Check if we have a valid session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    console.log('Current session:', { session: !!session, sessionError, userId: session?.user?.id })
    
    if (!session) {
      setError('No active session found. Please log in again.')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      if (existingThesis) {
        // Update existing thesis
        console.log('Updating existing thesis...')
        const { error } = await supabase
          .from('investor_theses')
          .update({
            ...thesisData,
            updated_at: new Date().toISOString()
          })
          .eq('investor_id', user.id)
          .eq('is_active', true)

        if (error) {
          console.error('Update error:', error)
          throw error
        }
        console.log('Thesis updated successfully')
      } else {
        // Create new thesis
        console.log('Creating new thesis directly...')
        const { data, error } = await supabase
          .from('investor_theses')
          .insert({
            investor_id: user.id,
            ...thesisData,
            is_active: true
          })
          .select()

        if (error) {
          console.error('Insert error:', error)
          throw error
        }
        console.log('Thesis created successfully:', data)
      }

      setShowSuccess(true)

      // Redirect to matches page after success
      setTimeout(() => {
        router.push('/matches')
      }, 2000)
    } catch (err: any) {
      console.error('Save thesis error:', err)
      setError(err.message || 'Failed to save investment thesis')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    router.push('/dashboard')
  }

  if (authLoading || isLoading) {
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
          <Button onClick={() => router.push('/dashboard')}>
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
            Redirecting to your matches...
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

export default function InvestmentThesisPage() {
  return (
    <AuthGuard requiredUserType="investor">
      <ThesisPageContent />
    </AuthGuard>
  )
}
