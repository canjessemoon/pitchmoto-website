import { Message, Thread, User, Attachment } from '@/types/messages';

// Mock users for development
const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'John Founder',
    role: 'founder',
    avatarUrl: 'https://ui-avatars.com/api/?name=John+Founder'
  },
  {
    id: 'u2',
    name: 'Sarah Investor',
    role: 'investor',
    avatarUrl: 'https://ui-avatars.com/api/?name=Sarah+Investor'
  },
  {
    id: 'u3',
    name: 'Mike Angel',
    role: 'investor',
    avatarUrl: 'https://ui-avatars.com/api/?name=Mike+Angel'
  },
  {
    id: 'u4',
    name: 'Lisa VC',
    role: 'investor',
    avatarUrl: 'https://ui-avatars.com/api/?name=Lisa+VC'
  },
  {
    id: 'u5',
    name: 'David Capital',
    role: 'investor',
    avatarUrl: 'https://ui-avatars.com/api/?name=David+Capital'
  },
  {
    id: 'u6',
    name: 'Emma Seed',
    role: 'investor',
    avatarUrl: 'https://ui-avatars.com/api/?name=Emma+Seed'
  },
  {
    id: 'u7',
    name: 'Alex Venture',
    role: 'investor',
    avatarUrl: 'https://ui-avatars.com/api/?name=Alex+Venture'
  },
  {
    id: 'u8',
    name: 'Rachel Fund',
    role: 'investor',
    avatarUrl: 'https://ui-avatars.com/api/?name=Rachel+Fund'
  },
  {
    id: 'u9',
    name: 'Tom Growth',
    role: 'investor',
    avatarUrl: 'https://ui-avatars.com/api/?name=Tom+Growth'
  },
  {
    id: 'u10',
    name: 'Nina Partners',
    role: 'investor',
    avatarUrl: 'https://ui-avatars.com/api/?name=Nina+Partners'
  },
  {
    id: 'u11',
    name: 'Chris Innovation',
    role: 'investor',
    avatarUrl: 'https://ui-avatars.com/api/?name=Chris+Innovation'
  },
  {
    id: 'u12',
    name: 'Sofia Equity',
    role: 'investor',
    avatarUrl: 'https://ui-avatars.com/api/?name=Sofia+Equity'
  },
  {
    id: 'u13',
    name: 'Ryan Accelerator',
    role: 'investor',
    avatarUrl: 'https://ui-avatars.com/api/?name=Ryan+Accelerator'
  },
  {
    id: 'u14',
    name: 'Kelly Syndicate',
    role: 'investor',
    avatarUrl: 'https://ui-avatars.com/api/?name=Kelly+Syndicate'
  },
  {
    id: 'u15',
    name: 'Mark Strategy',
    role: 'investor',
    avatarUrl: 'https://ui-avatars.com/api/?name=Mark+Strategy'
  },
  {
    id: 'u16',
    name: 'Anna Portfolio',
    role: 'investor',
    avatarUrl: 'https://ui-avatars.com/api/?name=Anna+Portfolio'
  }
];

// Mock messages
const mockMessages: Message[] = [
  // Thread 1 - Sarah Investor
  {
    id: 'm1',
    senderId: 'u1',
    receiverId: 'u2',
    content: 'Hi Sarah, thank you for your interest in our startup!',
    createdAt: '2025-07-28T10:00:00Z'
  },
  {
    id: 'm2',
    senderId: 'u2',
    receiverId: 'u1',
    content: 'Hi John, I loved your pitch! Could you tell me more about your market size?',
    createdAt: '2025-07-28T10:05:00Z'
  },
  // Thread 2 - Mike Angel
  {
    id: 'm3',
    senderId: 'u3',
    receiverId: 'u1',
    content: 'Your product demo was impressive. When are you planning to launch?',
    createdAt: '2025-07-29T14:00:00Z'
  },
  // Thread 3 - Lisa VC
  {
    id: 'm4',
    senderId: 'u1',
    receiverId: 'u4',
    content: 'Hi Lisa, I saw you were interested in our AI capabilities. Happy to discuss further!',
    createdAt: '2025-07-30T09:00:00Z'
  },
  {
    id: 'm5',
    senderId: 'u4',
    receiverId: 'u1',
    content: 'Yes, particularly interested in your ML models. Do you have any validation data?',
    createdAt: '2025-07-30T09:15:00Z'
  },
  // Thread 4 - David Capital
  {
    id: 'm6',
    senderId: 'u5',
    receiverId: 'u1',
    content: 'Great pitch deck. Would love to set up a meeting next week.',
    createdAt: '2025-07-31T11:00:00Z'
  },
  // Thread 5 - Emma Seed
  {
    id: 'm7',
    senderId: 'u6',
    receiverId: 'u1',
    content: 'Your revenue projections look solid. Can we discuss your customer acquisition strategy?',
    createdAt: '2025-08-01T15:00:00Z'
  },
  // Thread 6 - Alex Venture
  {
    id: 'm8',
    senderId: 'u7',
    receiverId: 'u1',
    content: 'Interested in your Series A round. What\'s your current valuation?',
    createdAt: '2025-08-01T16:30:00Z'
  },
  {
    id: 'm9',
    senderId: 'u1',
    receiverId: 'u7',
    content: 'Thanks for reaching out Alex! We\'re looking at a $10M valuation. Happy to share our deck.',
    createdAt: '2025-08-01T17:00:00Z'
  },
  // Thread 7 - Rachel Fund
  {
    id: 'm10',
    senderId: 'u8',
    receiverId: 'u1',
    content: 'Your sustainability focus aligns with our fund\'s mission. Let\'s connect!',
    createdAt: '2025-08-01T18:15:00Z'
  },
  // Thread 8 - Tom Growth
  {
    id: 'm11',
    senderId: 'u1',
    receiverId: 'u9',
    content: 'Hi Tom, saw your interest in our growth metrics. We\'ve achieved 300% YoY growth!',
    createdAt: '2025-08-01T19:00:00Z'
  },
  {
    id: 'm12',
    senderId: 'u9',
    receiverId: 'u1',
    content: 'That\'s impressive! What\'s driving your customer retention rate?',
    createdAt: '2025-08-01T19:30:00Z'
  },
  // Thread 9 - Nina Partners
  {
    id: 'm13',
    senderId: 'u10',
    receiverId: 'u1',
    content: 'Love the team background. When can we schedule a due diligence call?',
    createdAt: '2025-08-01T20:00:00Z'
  },
  // Thread 10 - Chris Innovation
  {
    id: 'm14',
    senderId: 'u11',
    receiverId: 'u1',
    content: 'Your tech stack is solid. Are you considering any strategic partnerships?',
    createdAt: '2025-08-01T21:00:00Z'
  },
  {
    id: 'm15',
    senderId: 'u1',
    receiverId: 'u11',
    content: 'Absolutely! We\'re open to partnerships that can accelerate our market penetration.',
    createdAt: '2025-08-01T21:15:00Z'
  },
  // Thread 11 - Sofia Equity
  {
    id: 'm16',
    senderId: 'u12',
    receiverId: 'u1',
    content: 'Compelling pitch! What\'s your timeline for achieving profitability?',
    createdAt: '2025-08-01T22:00:00Z'
  },
  // Thread 12 - Ryan Accelerator
  {
    id: 'm17',
    senderId: 'u1',
    receiverId: 'u13',
    content: 'Hi Ryan, thank you for considering us for your accelerator program!',
    createdAt: '2025-08-02T08:00:00Z'
  },
  {
    id: 'm18',
    senderId: 'u13',
    receiverId: 'u1',
    content: 'Great to connect John! Your startup fits perfectly with our B2B focus. Let\'s talk next steps.',
    createdAt: '2025-08-02T08:30:00Z'
  },
  // Thread 13 - Kelly Syndicate
  {
    id: 'm19',
    senderId: 'u14',
    receiverId: 'u1',
    content: 'Your market timing seems perfect. Are you familiar with our syndicate model?',
    createdAt: '2025-08-02T09:00:00Z'
  },
  // Thread 14 - Mark Strategy
  {
    id: 'm20',
    senderId: 'u15',
    receiverId: 'u1',
    content: 'Impressive go-to-market strategy. How do you plan to scale internationally?',
    createdAt: '2025-08-02T10:00:00Z'
  },
  {
    id: 'm21',
    senderId: 'u1',
    receiverId: 'u15',
    content: 'Thanks Mark! We\'re planning to expand to Europe first, then Asia. Would love your insights.',
    createdAt: '2025-08-02T10:30:00Z'
  },
  // Thread 15 - Anna Portfolio
  {
    id: 'm22',
    senderId: 'u16',
    receiverId: 'u1',
    content: 'Your product roadmap is ambitious but achievable. When can we see a live demo?',
    createdAt: '2025-08-02T11:00:00Z'
  }
];

// Mock threads
const mockThreads: Thread[] = [
  {
    id: 't1',
    participantIds: ['u1', 'u2'],
    lastMessage: mockMessages[1],
    unreadCount: 1,
    updatedAt: '2025-07-28T10:05:00Z'
  },
  {
    id: 't2',
    participantIds: ['u1', 'u3'],
    lastMessage: mockMessages[2],
    unreadCount: 1,
    updatedAt: '2025-07-29T14:00:00Z'
  },
  {
    id: 't3',
    participantIds: ['u1', 'u4'],
    lastMessage: mockMessages[4],
    unreadCount: 0,
    updatedAt: '2025-07-30T09:15:00Z'
  },
  {
    id: 't4',
    participantIds: ['u1', 'u5'],
    lastMessage: mockMessages[5],
    unreadCount: 1,
    updatedAt: '2025-07-31T11:00:00Z'
  },
  {
    id: 't5',
    participantIds: ['u1', 'u6'],
    lastMessage: mockMessages[6],
    unreadCount: 1,
    updatedAt: '2025-08-01T15:00:00Z'
  },
  {
    id: 't6',
    participantIds: ['u1', 'u7'],
    lastMessage: mockMessages[8],
    unreadCount: 0,
    updatedAt: '2025-08-01T17:00:00Z'
  },
  {
    id: 't7',
    participantIds: ['u1', 'u8'],
    lastMessage: mockMessages[9],
    unreadCount: 1,
    updatedAt: '2025-08-01T18:15:00Z'
  },
  {
    id: 't8',
    participantIds: ['u1', 'u9'],
    lastMessage: mockMessages[11],
    unreadCount: 1,
    updatedAt: '2025-08-01T19:30:00Z'
  },
  {
    id: 't9',
    participantIds: ['u1', 'u10'],
    lastMessage: mockMessages[12],
    unreadCount: 1,
    updatedAt: '2025-08-01T20:00:00Z'
  },
  {
    id: 't10',
    participantIds: ['u1', 'u11'],
    lastMessage: mockMessages[14],
    unreadCount: 0,
    updatedAt: '2025-08-01T21:15:00Z'
  },
  {
    id: 't11',
    participantIds: ['u1', 'u12'],
    lastMessage: mockMessages[15],
    unreadCount: 1,
    updatedAt: '2025-08-01T22:00:00Z'
  },
  {
    id: 't12',
    participantIds: ['u1', 'u13'],
    lastMessage: mockMessages[17],
    unreadCount: 1,
    updatedAt: '2025-08-02T08:30:00Z'
  },
  {
    id: 't13',
    participantIds: ['u1', 'u14'],
    lastMessage: mockMessages[18],
    unreadCount: 1,
    updatedAt: '2025-08-02T09:00:00Z'
  },
  {
    id: 't14',
    participantIds: ['u1', 'u15'],
    lastMessage: mockMessages[20],
    unreadCount: 0,
    updatedAt: '2025-08-02T10:30:00Z'
  },
  {
    id: 't15',
    participantIds: ['u1', 'u16'],
    lastMessage: mockMessages[21],
    unreadCount: 1,
    updatedAt: '2025-08-02T11:00:00Z'
  }
];

// Mock data service
export const MessageService = {
  // Delete message
  deleteMessage: async (messageId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const messageIndex = mockMessages.findIndex(m => m.id === messageId);
    if (messageIndex !== -1) {
      mockMessages.splice(messageIndex, 1);
    }
  },

  // Edit message
  editMessage: async (messageId: string, newContent: string): Promise<Message> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const message = mockMessages.find(m => m.id === messageId);
    if (!message) {
      throw new Error('Message not found');
    }
    message.content = newContent;
    message.edited = true;
    return message;
  },

  // Upload attachment
  uploadAttachment: async (file: File): Promise<Attachment> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate upload time
    return {
      id: `a${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      url: URL.createObjectURL(file), // In a real app, this would be a server URL
      type: file.type,
      size: file.size
    };
  },

  // Get messages for a thread
  markThreadAsRead: async (threadId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const thread = mockThreads.find(t => t.id === threadId);
    if (thread) {
      thread.unreadCount = 0;
    }
  },

  // Mark thread as unread
  markThreadAsUnread: async (threadId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const thread = mockThreads.find(t => t.id === threadId);
    if (thread) {
      thread.unreadCount = 1;
    }
  },

  // Delete thread and its messages
  deleteThread: async (threadId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const thread = mockThreads.find(t => t.id === threadId);
    if (thread) {
      // Remove all messages for this thread first
      const threadMessages = mockMessages.filter(m => 
        (m.senderId === thread.participantIds[0] &&
         m.receiverId === thread.participantIds[1]) ||
        (m.senderId === thread.participantIds[1] &&
         m.receiverId === thread.participantIds[0])
      );
      
      // Remove the messages
      threadMessages.forEach(msg => {
        const msgIndex = mockMessages.findIndex(m => m.id === msg.id);
        if (msgIndex !== -1) {
          mockMessages.splice(msgIndex, 1);
        }
      });

      // Then remove the thread
      const threadIndex = mockThreads.findIndex(t => t.id === threadId);
      if (threadIndex !== -1) {
        mockThreads.splice(threadIndex, 1);
      }
      threadMessages.forEach(msg => {
        const msgIndex = mockMessages.findIndex(m => m.id === msg.id);
        if (msgIndex !== -1) {
          mockMessages.splice(msgIndex, 1);
        }
      });
    }
  },

  // Get threads for a user
  getThreads: async (userId: string): Promise<Thread[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockThreads.filter(thread => thread.participantIds.includes(userId));
  },

  // Get messages for a thread
  getMessages: async (threadId: string): Promise<Message[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Find the thread to get participant IDs
    const thread = mockThreads.find(t => t.id === threadId);
    if (!thread) return [];
    
    // Only return messages between the thread participants
    return mockMessages.filter(msg => 
      thread.participantIds.includes(msg.senderId) && 
      thread.participantIds.includes(msg.receiverId)
    );
  },

  // Get user details
  getUser: async (userId: string): Promise<User | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockUsers.find(user => user.id === userId);
  },

  // Send a message
  sendMessage: async (message: Omit<Message, 'id' | 'createdAt'>): Promise<Message> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Generate a timestamp-based ID for the new message
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const newMessage: Message = {
      ...message,
      id: `m${timestamp}-${random}`,
      createdAt: new Date().toISOString()
    };
    mockMessages.push(newMessage);

    // Find or create thread
    const participants = [message.senderId, message.receiverId].sort();
    let thread = mockThreads.find(t => 
      t.participantIds.length === participants.length && 
      t.participantIds.every((id, i) => id === participants[i])
    );

    if (thread) {
      // Update existing thread
      thread.lastMessage = newMessage;
      thread.updatedAt = newMessage.createdAt;
      if (thread.participantIds[0] === message.receiverId) {
        thread.unreadCount += 1;
      }
    } else {
      // Create new thread
      thread = {
        id: `t${timestamp}-${random}`,
        participantIds: participants,
        lastMessage: newMessage,
        unreadCount: 1,
        updatedAt: newMessage.createdAt
      };
      mockThreads.push(thread);
    }

    return newMessage;
  }
};
