'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { auth } from '@/lib/auth'

interface UpvoteButtonProps {
  pitchId: string
  initialUpvoteCount: number
  initialIsUpvoted?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function UpvoteButton({ 
  pitchId, 
  initialUpvoteCount, 
  initialIsUpvoted = false,
  size = 'md',
  className = ''
}: UpvoteButtonProps) {
  const [user, setUser] = useState<any>(null)
  const [upvoteCount, setUpvoteCount] = useState(initialUpvoteCount)
  const [isUpvoted, setIsUpvoted] = useState(initialIsUpvoted)
  const [isLoading, setIsLoading] = useState(false)

  // Get current user and check their role
  useEffect(() => {
    async function getCurrentUser() {
      const currentUser = await auth.getCurrentUser()
      setUser(currentUser)
    }
    getCurrentUser()
  }, [])

  // Check if user has upvoted this pitch
  useEffect(() => {
    async function checkUpvoteStatus() {
      if (!user || user.profile?.role !== 'investor') return

      try {
        const { data } = await supabase
          .from('upvotes')
          .select('id')
          .eq('user_id', user.id)
          .eq('pitch_id', pitchId)
          .single()

        setIsUpvoted(!!data)
      } catch (error) {
        // No upvote found, which is fine
      }
    }

    checkUpvoteStatus()
  }, [user, pitchId])

  const handleUpvote = async () => {
    if (!user) {
      // Redirect to login or show login modal
      alert('Please log in to upvote pitches')
      return
    }

    if (user.profile?.role !== 'investor') {
      alert('Only investors can upvote pitches')
      return
    }

    if (isLoading) return

    setIsLoading(true)

    try {
      if (isUpvoted) {
        // Remove upvote
        const response = await fetch(`/api/upvotes?pitch_id=${pitchId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          setIsUpvoted(false)
          setUpvoteCount(prev => Math.max(0, prev - 1))
        } else {
          const error = await response.json()
          alert(error.error || 'Failed to remove upvote')
        }
      } else {
        // Add upvote
        const response = await fetch('/api/upvotes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ pitch_id: pitchId }),
        })

        if (response.ok) {
          setIsUpvoted(true)
          setUpvoteCount(prev => prev + 1)
        } else {
          const error = await response.json()
          alert(error.error || 'Failed to upvote')
        }
      }
    } catch (error) {
      console.error('Error toggling upvote:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const sizeClasses = {
    sm: 'h-8 px-2 text-sm',
    md: 'h-10 px-3 text-base',
    lg: 'h-12 px-4 text-lg'
  }

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  }

  const canUpvote = user && user.profile?.role === 'investor'

  return (
    <button
      onClick={handleUpvote}
      disabled={!canUpvote || isLoading}
      className={`
        inline-flex items-center gap-2 rounded-full border transition-all duration-200
        ${sizeClasses[size]}
        ${isUpvoted 
          ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
        }
        ${!canUpvote ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${isLoading ? 'opacity-75 cursor-wait' : ''}
        ${className}
      `}
      title={
        !user 
          ? 'Please log in to upvote' 
          : user.profile?.role !== 'investor' 
            ? 'Only investors can upvote' 
            : isUpvoted 
              ? 'Remove upvote' 
              : 'Upvote this pitch'
      }
    >
      <Heart 
        size={iconSizes[size]} 
        className={`
          transition-colors duration-200
          ${isUpvoted ? 'fill-red-600 text-red-600' : 'text-gray-400'}
        `}
      />
      <span className="font-medium">
        {upvoteCount}
      </span>
    </button>
  )
}
