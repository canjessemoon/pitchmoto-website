'use client'

import { useAuth } from '@/components/providers'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Startup {
  id: string
  name: string
  tagline: string
}

export default function EditPitchPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const pitchId = params.id as string

  const [pitchData, setPitchData] = useState({
    title: '',
    content: '',
    pitch_type: 'slide',
    funding_ask: '',
    startup_id: ''
  })
  const [startups, setStartups] = useState<Startup[]>([])
  const [loadingPitch, setLoadingPitch] = useState(true)
  const [loadingStartups, setLoadingStartups] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && pitchId) {
      fetchPitchData()
      fetchStartups()
    }
  }, [user, pitchId])

  const fetchPitchData = async () => {
    try {
      setLoadingPitch(true)
      // For now, simulate loading the pitch data
      // TODO: Implement actual API call to get specific pitch
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // For now, redirect back to pitches page with a message
      alert('Edit functionality is being implemented. For now, please use the create pitch flow.')
      router.push('/pitches')
      
    } catch (error) {
      console.error('Error fetching pitch:', error)
      setError('Failed to load pitch data')
    } finally {
      setLoadingPitch(false)
    }
  }

  const fetchStartups = async () => {
    try {
      setLoadingStartups(true)
      const response = await fetch(`/api/startups/my-startups?founder_id=${user?.id}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch startups')
      }

      const data = await response.json()
      setStartups(data.startups || [])
    } catch (error) {
      console.error('Error fetching startups:', error)
    } finally {
      setLoadingStartups(false)
    }
  }

  if (loading || loadingPitch) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading pitch data...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-blue-600">
                PitchMoto
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/pitches"
                className="text-gray-500 hover:text-gray-700"
              >
                ← Back to Pitches
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Edit Pitch
            </h1>
            <p className="text-gray-600 mb-8">
              Edit functionality is currently being implemented.
            </p>
            <div className="space-x-4">
              <Link
                href="/pitches"
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
              >
                Back to Pitches
              </Link>
              <Link
                href="/create-pitch"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-500"
              >
                Create New Pitch
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
