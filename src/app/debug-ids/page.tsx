'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DebugIdsPage() {
  const [startups, setStartups] = useState<any[]>([])
  const [pitches, setPitches] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      console.log('Current user:', currentUser)
      setUser(currentUser)

      if (!currentUser) {
        console.log('No authenticated user')
        return
      }

      // Get user's startups
      const { data: startupsData, error: startupsError } = await supabase
        .from('startups')
        .select('*')
        .eq('founder_id', currentUser.id)

      console.log('Startups query:', { startupsData, startupsError })
      
      if (startupsError) {
        console.error('Error fetching startups:', startupsError)
      } else {
        setStartups(startupsData || [])
      }

      // Check specifically for pitches with the ShopSphere startup ID first
      const { data: shopSpherePitches, error: shopSpherePitchesError } = await supabase
        .from('pitches')
        .select('*')
        .eq('startup_id', '7f30e44b-fb7e-48cb-9941-1c964cafc3a7')

      console.log('ShopSphere pitches:', { shopSpherePitches, shopSpherePitchesError })

      // Get all pitches for startups owned by this user
      const userStartupIds = startupsData?.map(s => s.id) || []
      console.log('User startup IDs:', userStartupIds)
      
      const { data: pitchesData, error: pitchesError } = await supabase
        .from('pitches')
        .select(`
          *,
          startup:startups(*)
        `)
        .in('startup_id', userStartupIds)

      console.log('Pitches query result:', { pitchesData, pitchesError })
      
      if (pitchesError) {
        console.error('Error fetching pitches:', pitchesError)
        console.error('Pitches error details:', JSON.stringify(pitchesError, null, 2))
      } else {
        setPitches(pitchesData || [])
      }

    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (!user) {
    return <div className="p-8">Please sign in to view your IDs</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug: Startup and Pitch IDs</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Current User</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p><strong>User ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Startups ({startups.length})</h2>
        {startups.length === 0 ? (
          <p>No startups found</p>
        ) : (
          <div className="space-y-4">
            {startups.map((startup) => (
              <div key={startup.id} className="bg-blue-50 p-4 rounded border">
                <p><strong>Name:</strong> {startup.name}</p>
                <p><strong>ID:</strong> <code className="bg-gray-200 px-2 py-1 rounded">{startup.id}</code></p>
                <p><strong>Founder ID:</strong> <code className="bg-gray-200 px-2 py-1 rounded">{startup.founder_id}</code></p>
                <p><strong>Tagline:</strong> {startup.tagline}</p>
                <p><strong>Created:</strong> {new Date(startup.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Pitches ({pitches.length})</h2>
        {pitches.length === 0 ? (
          <p>No pitches found</p>
        ) : (
          <div className="space-y-4">
            {pitches.map((pitch) => (
              <div key={pitch.id} className="bg-green-50 p-4 rounded border">
                <p><strong>Title:</strong> {pitch.title}</p>
                <p><strong>Pitch ID:</strong> <code className="bg-gray-200 px-2 py-1 rounded">{pitch.id}</code></p>
                <p><strong>Startup ID:</strong> <code className="bg-gray-200 px-2 py-1 rounded">{pitch.startup_id}</code></p>
                <p><strong>Startup Name:</strong> {pitch.startup?.name}</p>
                <p><strong>Startup Founder ID:</strong> <code className="bg-gray-200 px-2 py-1 rounded">{pitch.startup?.founder_id}</code></p>
                <p><strong>Created:</strong> {new Date(pitch.created_at).toLocaleString()}</p>
                {pitch.slide_url && <p><strong>Current Slide URL:</strong> {pitch.slide_url}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-yellow-50 rounded border border-yellow-200">
        <h3 className="font-semibold mb-2">Usage Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1">
          <li>Check that your User ID matches the Founder ID in both startups and pitches</li>
          <li>Note the Startup ID for "ShopSphere" startup</li>
          <li>Verify that your pitch's Startup ID matches the ShopSphere Startup ID</li>
          <li>When editing a pitch, the form should use the correct Startup ID for file uploads</li>
        </ol>
      </div>
    </div>
  )
}