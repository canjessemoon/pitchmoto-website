import { useCallback, useEffect, useState } from 'react';
import { Message, Thread, User, Attachment } from '@/types/messages';
import { MessageService } from '@/lib/mock-message-service';

// Helper function to format timestamp
const formatMessageTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 24) {
    // Show time for messages within 24 hours
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  } else if (diffInHours < 168) { // 7 days
    // Show day and time for messages within a week
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  } else {
    // Show full date for older messages
    return date.toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }
};

// Delete confirmation dialog component
const DeleteConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-eve                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwnMessage={message.senderId === currentUser.id}
                />e">
      <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl border pointer-events-auto" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4">Delete Conversation?</h3>
        <p className="text-gray-600 mb-6">
          This will delete the entire conversation and cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Message bubble component
const MessageBubble = ({ 
  message, 
  isOwnMessage 
}: { 
  message: Message; 
  isOwnMessage: boolean;
}) => {
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[70%]`}>
        <div
          className={`rounded-lg px-4 py-2 whitespace-pre-wrap break-words ${
            isOwnMessage ? 'bg-blue-600 text-white' : 'bg-gray-100'
          }`}
        >
          {message.content}
          {message.edited && (
            <span className="text-xs ml-2 opacity-75">(edited)</span>
          )}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className={`flex items-center gap-2 p-2 rounded ${
                    isOwnMessage ? 'bg-blue-700' : 'bg-gray-200'
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l8.57-8.57A4 4 0 1118 8.84l-8.59 8.57a2 2 0 01-2.83-2.83l8.49-8.48" />
                  </svg>
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-sm hover:underline ${isOwnMessage ? 'text-white' : 'text-gray-900'}`}
                  >
                    {attachment.name}
                  </a>
                  <span className={`text-xs opacity-75 ${isOwnMessage ? 'text-white' : 'text-gray-600'}`}>
                    ({Math.round(attachment.size / 1024)}KB)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <span className={`text-xs mt-1 opacity-60 ${isOwnMessage ? 'text-gray-500' : 'text-gray-500'}`}>
          {formatMessageTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
};

// Thread list item component
const ThreadListItem = ({ 
  thread, 
  onClick,
  selectedThreadId,
  onMarkUnread,
  onMarkRead,
  onDelete
}: { 
  thread: Thread; 
  onClick: () => void;
  selectedThreadId?: string;
  onMarkUnread: (threadId: string, e: React.MouseEvent) => void;
  onMarkRead: (threadId: string, e: React.MouseEvent) => void;
  onDelete: (threadId: string) => void;
}) => {
  const [otherUser, setOtherUser] = useState<User>();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Add click outside handler and position tracking
  useEffect(() => {
    if (isMenuOpen) {
      const updateMenuPosition = () => {
        const button = document.querySelector('.message-menu button');
        if (button) {
          const rect = button.getBoundingClientRect();
          document.documentElement.style.setProperty('--menu-button-top', `${rect.top}px`);
          document.documentElement.style.setProperty('--menu-button-right', `${rect.right}px`);
        }
      };
      
      const handleClickOutside = (e: MouseEvent) => {
        if (!(e.target as Element).closest('.message-menu')) {
          setIsMenuOpen(false);
        }
      };

      updateMenuPosition();
      document.addEventListener('click', handleClickOutside);
      window.addEventListener('scroll', updateMenuPosition);
      window.addEventListener('resize', updateMenuPosition);

      return () => {
        document.removeEventListener('click', handleClickOutside);
        window.removeEventListener('scroll', updateMenuPosition);
        window.removeEventListener('resize', updateMenuPosition);
      };
    }
  }, [isMenuOpen]);

  useEffect(() => {
    const loadUser = async () => {
      // Get the other participant's ID (not the current user)
      const otherUserId = thread.participantIds.find(id => id !== 'u1'); // Hardcoded current user for demo
      if (otherUserId) {
        const user = await MessageService.getUser(otherUserId);
        setOtherUser(user);
      }
    };
    loadUser();
  }, [thread]);

  if (!otherUser) return null;

  return (
    <>
      <div
        onClick={onClick}
        className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
          selectedThreadId === thread.id ? 'bg-gray-50' : ''
        } relative group`}
    >
      <div className="flex items-center">
        {otherUser.avatarUrl && (
          <img
            src={otherUser.avatarUrl}
            alt={otherUser.name}
            className="w-10 h-10 rounded-full mr-3"
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className={`${thread.unreadCount > 0 ? 'font-semibold' : 'font-medium'}`}>
            {otherUser.name}
          </h3>
          <p className={`text-sm truncate ${
            thread.unreadCount > 0 
              ? 'text-gray-900 font-medium' 
              : 'text-gray-500 font-normal'
          }`}>
            {thread.lastMessage?.content}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {thread.unreadCount > 0 && (
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          )}
          <div className="relative message-menu">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(true);
              }}
              className="p-1 hover:bg-gray-100 rounded-full message-menu"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-gray-500"
              >
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </button>
            {isMenuOpen && (
              <div 
                className="fixed py-2 w-48 bg-white rounded-lg shadow-lg border z-50"
                style={{
                  top: 'calc(var(--menu-button-top) + 24px)',
                  right: 'calc(100vw - var(--menu-button-right))',
                }}
                onClick={e => e.stopPropagation()}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkUnread(thread.id, e);
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 disabled:text-gray-400 disabled:hover:bg-white"
                  disabled={thread.unreadCount > 0}
                >
                  Mark as unread
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkRead(thread.id, e);
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 disabled:text-gray-400 disabled:hover:bg-white"
                  disabled={thread.unreadCount === 0}
                >
                  Mark as read
                </button>
                <hr className="my-2 border-gray-200" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    setShowDeleteConfirm(true);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  Delete conversation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    <DeleteConfirmDialog
      isOpen={showDeleteConfirm}
      onClose={() => setShowDeleteConfirm(false)}
      onConfirm={() => {
        onDelete(thread.id);
        setShowDeleteConfirm(false);
      }}
    />
    </>
  );
};

// Main messaging component
export default function MessagingInterface() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Load threads
  useEffect(() => {
    const loadThreads = async () => {
      const userThreads = await MessageService.getThreads('u1'); // Hardcoded current user for demo
      setThreads(userThreads);
    };
    loadThreads();
  }, []);

  // Load messages when thread is selected and mark as read
  useEffect(() => {
    const loadMessages = async () => {
      if (selectedThread) {
        const threadMessages = await MessageService.getMessages(selectedThread.id);
        setMessages(threadMessages);
        // Mark thread as read when selected
        await MessageService.markThreadAsRead(selectedThread.id);
        // Update threads list to reflect new unread state
        const updatedThreads = await MessageService.getThreads('u1');
        setThreads(updatedThreads);
      }
    };
    loadMessages();
  }, [selectedThread]);

  // Handle marking thread as unread
  const handleMarkUnread = async (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent thread selection
    await MessageService.markThreadAsUnread(threadId);
    const updatedThreads = await MessageService.getThreads('u1');
    setThreads(updatedThreads);
  };

  const handleMarkRead = async (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await MessageService.markThreadAsRead(threadId);
    const updatedThreads = await MessageService.getThreads('u1');
    setThreads(updatedThreads);
  };

  const handleDeleteThread = async (threadId: string) => {
    await MessageService.deleteThread(threadId);
    const updatedThreads = await MessageService.getThreads('u1');
    setThreads(updatedThreads);
    if (selectedThread?.id === threadId) {
      setSelectedThread(undefined);
      setMessages([]);
    }
  };

  // File select handler
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'image/png',
        'image/jpeg',
        'image/gif'
      ];

      const files = Array.from(e.target.files).filter(file => {
        if (!allowedTypes.includes(file.type)) {
          console.warn(`File type ${file.type} not allowed for ${file.name}`);
          return false;
        }
        return true;
      });

      if (files.length > 0) {
        setSelectedFiles(prev => [...prev, ...files]);
      }
      e.target.value = ''; // Reset input
    }
  }, []);

  // Send message handler
  const handleSendMessage = useCallback(async () => {
    if (!selectedThread || (!newMessage.trim() && selectedFiles.length === 0)) return;

    setIsUploading(true);
    try {
      let uploadedAttachments: Attachment[] = [];
      if (selectedFiles.length > 0) {
        uploadedAttachments = await Promise.all(
          selectedFiles.map(file => MessageService.uploadAttachment(file))
        );
      }

      const message = await MessageService.sendMessage({
        senderId: 'u1', // Hardcoded current user for demo
        receiverId: selectedThread.participantIds.find(id => id !== 'u1')!,
        content: newMessage.trim(),
        attachments: uploadedAttachments
      });

      setMessages(prev => [...prev, message]);
      setNewMessage('');
      setSelectedFiles([]);
    } catch (error) {
      console.error('Failed to send message:', error);
      // You might want to show an error toast here
    } finally {
      setIsUploading(false);
    }
  }, [selectedThread, newMessage, selectedFiles]);

  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const filteredThreads = threads.filter(thread => {
    if (filter === 'unread') return thread.unreadCount > 0;
    if (filter === 'read') return thread.unreadCount === 0;
    return true;
  });

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Thread list */}
      <div className="w-1/3 border-r border-black flex flex-col h-full">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold mb-3">Messages</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === 'unread'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === 'read'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Read
            </button>
          </div>
        </div>
        <div className="overflow-y-auto flex-1">
          {filteredThreads.map(thread => (
            <ThreadListItem
              key={thread.id}
              thread={thread}
              selectedThreadId={selectedThread?.id}
              onClick={() => setSelectedThread(thread)}
              onMarkUnread={handleMarkUnread}
              onMarkRead={handleMarkRead}
              onDelete={handleDeleteThread}
            />
          ))}
        </div>
      </div>

      {/* Message area */}
      <div className="flex-1 flex flex-col">
        {selectedThread ? (
          <>
            {/* Message list */}
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map(message => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwnMessage={message.senderId === 'u1'} // Hardcoded current user for demo
                />
              ))}
            </div>

            {/* Message input */}
            <div className="border-t p-4">
              <div className="flex gap-3 items-stretch">
                <textarea
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyPress={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type your message... (Press Shift + Enter for new line)"
                  rows={4}
                  className="flex-1 border rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <label className="flex items-center justify-center px-3 border rounded-lg cursor-pointer hover:bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500" title="Accepted files: PDF, Word, Excel, PowerPoint, Images">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.gif"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="text-gray-500"
                  >
                    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                </label>
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-600 text-white px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={isUploading}
                >
                  {isUploading ? 'Sending...' : 'Send'}
                </button>
              </div>
              {selectedFiles.length > 0 && (
                <div className="mt-2 space-y-2 px-4">
                  <div className="text-sm text-gray-500">Selected files:</div>
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        className="text-gray-400"
                      >
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l8.57-8.57A4 4 0 1118 8.84l-8.59 8.57a2 2 0 01-2.83-2.83l8.49-8.48" />
                      </svg>
                      <span className="text-gray-600">{file.name}</span>
                      <span className="text-gray-400">({Math.round(file.size / 1024)}KB)</span>
                      <button
                        onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                        className="text-red-500 hover:text-red-600"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="16" 
                          height="16" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            {threads.length > 0 
              ? "Select a conversation to start messaging."
              : "No messages yet. Your future conversations will appear here."
            }
          </div>
        )}
      </div>
    </div>
  );
}
