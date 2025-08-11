export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  readAt?: string;
  attachments?: Attachment[];
  edited?: boolean;
}

export interface Thread {
  id: string;
  participantIds: string[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
  role: 'founder' | 'investor';
}
