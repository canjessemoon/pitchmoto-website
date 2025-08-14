'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Reply, Edit2, Trash2, Send } from 'lucide-react'
import { auth } from '@/lib/auth'

interface Comment {
  id: string
  content: string
  created_at: string
  updated_at: string
  profiles: {
    id: string
    full_name: string
    avatar_url?: string
    role: string
  }
}

interface CommentSectionProps {
  pitchId: string
  className?: string
}

export function CommentSection({ pitchId, className = '' }: CommentSectionProps) {
  const [user, setUser] = useState<any>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get current user
  useEffect(() => {
    async function getCurrentUser() {
      const currentUser = await auth.getCurrentUser()
      setUser(currentUser)
    }
    getCurrentUser()
  }, [])

  // Fetch comments
  useEffect(() => {
    async function fetchComments() {
      try {
        const response = await fetch(`/api/comments?pitch_id=${pitchId}`)
        const data = await response.json()
        
        if (response.ok) {
          setComments(data.comments || [])
        } else {
          console.error('Failed to fetch comments:', data.error)
        }
      } catch (error) {
        console.error('Error fetching comments:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchComments()
  }, [pitchId])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      alert('Please log in to comment')
      return
    }

    if (!newComment.trim()) return

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pitch_id: pitchId,
          content: newComment.trim()
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setComments(prev => [...prev, data.comment])
        setNewComment('')
      } else {
        alert(data.error || 'Failed to post comment')
      }
    } catch (error) {
      console.error('Error posting comment:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return

    try {
      const response = await fetch('/api/comments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment_id: commentId,
          content: editContent.trim()
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setComments(prev => prev.map(comment => 
          comment.id === commentId ? data.comment : comment
        ))
        setEditingComment(null)
        setEditContent('')
      } else {
        alert(data.error || 'Failed to update comment')
      }
    } catch (error) {
      console.error('Error updating comment:', error)
      alert('Something went wrong. Please try again.')
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      const response = await fetch(`/api/comments?comment_id=${commentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setComments(prev => prev.filter(comment => comment.id !== commentId))
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete comment')
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
      alert('Something went wrong. Please try again.')
    }
  }

  const startEdit = (comment: Comment) => {
    setEditingComment(comment.id)
    setEditContent(comment.content)
  }

  const cancelEdit = () => {
    setEditingComment(null)
    setEditContent('')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-gray-500" />
        <h3 className="text-lg font-semibold text-gray-900">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="space-y-3">
          <div>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts or ask a question..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-[#405B53] focus:border-transparent"
              rows={3}
              maxLength={2000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {newComment.length}/2000
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#405B53] text-white rounded-lg hover:bg-[#334A42] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-3">Please log in to join the discussion</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#405B53] text-white rounded-lg hover:bg-[#334A42] transition-colors"
          >
            Log In to Comment
          </button>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border rounded-lg p-4 space-y-3">
              {/* Comment Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#405B53] rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {comment.profiles.full_name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {comment.profiles.full_name}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {comment.profiles.role}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(comment.created_at)}
                      {comment.created_at !== comment.updated_at && ' (edited)'}
                    </span>
                  </div>
                </div>

                {/* Comment Actions */}
                {user?.id === comment.profiles.id && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(comment)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Edit comment"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete comment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Comment Content */}
              {editingComment === comment.id ? (
                <div className="space-y-3">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-[#405B53] focus:border-transparent"
                    rows={3}
                    maxLength={2000}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleEditComment(comment.id)}
                      className="px-3 py-1 bg-[#405B53] text-white rounded hover:bg-[#334A42] transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
