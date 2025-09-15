import { supabase } from '@/lib/supabase'
import { Message, Thread, User } from '@/types/messages'

export interface MessageService {
  // Thread management
  getThreads(userId: string): Promise<Thread[]>
  getThread(threadId: string): Promise<Thread | null>
  createThread(participantIds: string[]): Promise<Thread>
  
  // Message management
  getMessages(threadId: string): Promise<Message[]>
  sendMessage(threadId: string, senderId: string, content: string, messageType?: 'text' | 'file' | 'image'): Promise<Message>
  markAsRead(messageId: string, userId: string): Promise<void>
  
  // User management
  getUsers(): Promise<User[]>
  getUser(userId: string): Promise<User | null>
  
  // Real-time subscriptions
  subscribeToThread(threadId: string, callback: (message: Message) => void): () => void
  subscribeToThreads(userId: string, callback: (threads: Thread[]) => void): () => void
}

class SupabaseMessageService implements MessageService {
  
  async getThreads(userId: string): Promise<Thread[]> {
    const { data, error } = await supabase
      .from('threads')
      .select(`
        *,
        last_message:messages!threads_last_message_id_fkey(*)
      `)
      .contains('participants', [userId])
      .order('last_activity', { ascending: false })

    if (error) {
      console.error('Error fetching threads:', error)
      throw error
    }

    return data || []
  }

  async getThread(threadId: string): Promise<Thread | null> {
    const { data, error } = await supabase
      .from('threads')
      .select(`
        *,
        last_message:messages!threads_last_message_id_fkey(*)
      `)
      .eq('id', threadId)
      .single()

    if (error) {
      console.error('Error fetching thread:', error)
      return null
    }

    return data
  }

  async createThread(participantIds: string[]): Promise<Thread> {
    // Check if thread already exists with these participants
    const { data: existingThread } = await supabase
      .from('threads')
      .select('*')
      .eq('participants', participantIds)
      .single()

    if (existingThread) {
      return existingThread
    }

    // Create new thread
    const { data, error } = await supabase
      .from('threads')
      .insert({
        participants: participantIds,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating thread:', error)
      throw error
    }

    return data
  }

  async getMessages(threadId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url),
        recipient:profiles!messages_recipient_id_fkey(id, full_name, avatar_url)
      `)
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching messages:', error)
      throw error
    }

    return data || []
  }

  async sendMessage(
    threadId: string, 
    senderId: string, 
    content: string, 
    messageType: 'text' | 'file' | 'image' = 'text'
  ): Promise<Message> {
    // Get thread to find recipient
    const thread = await this.getThread(threadId)
    if (!thread) {
      throw new Error('Thread not found')
    }

    const recipientId = thread.participants.find((id: string) => id !== senderId)
    if (!recipientId) {
      throw new Error('Recipient not found')
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        thread_id: threadId,
        sender_id: senderId,
        recipient_id: recipientId,
        content,
        message_type: messageType,
      })
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url),
        recipient:profiles!messages_recipient_id_fkey(id, full_name, avatar_url)
      `)
      .single()

    if (error) {
      console.error('Error sending message:', error)
      throw error
    }

    return data
  }

  async markAsRead(messageId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('id', messageId)
      .eq('recipient_id', userId)

    if (error) {
      console.error('Error marking message as read:', error)
      throw error
    }
  }

  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('user_id, full_name, user_type')
      .not('user_type', 'is', null)

    if (error) {
      console.error('Error fetching users:', error)
      throw error
    }

    return (data || []).map(profile => ({
      id: profile.user_id,
      name: profile.full_name || 'Unknown User',
      role: profile.user_type as 'founder' | 'investor',
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'User')}`
    }))
  }

  async getUser(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('user_id, full_name, user_type')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching user:', error)
      return null
    }

    return {
      id: data.user_id,
      name: data.full_name || 'Unknown User',
      role: data.user_type as 'founder' | 'investor',
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.full_name || 'User')}`
    }
  }

  subscribeToThread(threadId: string, callback: (message: Message) => void): () => void {
    const subscription = supabase
      .channel(`thread_${threadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `thread_id=eq.${threadId}`,
        },
        async (payload) => {
          // Fetch the complete message with sender/recipient info
          const { data } = await supabase
            .from('messages')
            .select(`
              *,
              sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url),
              recipient:profiles!messages_recipient_id_fkey(id, full_name, avatar_url)
            `)
            .eq('id', payload.new.id)
            .single()

          if (data) {
            callback(data)
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  subscribeToThreads(userId: string, callback: (threads: Thread[]) => void): () => void {
    const subscription = supabase
      .channel(`user_threads_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'threads',
        },
        async () => {
          // Refetch all threads when any thread changes
          const threads = await this.getThreads(userId)
          callback(threads)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }
}

// Export singleton instance
export const messageService = new SupabaseMessageService()
export default messageService
