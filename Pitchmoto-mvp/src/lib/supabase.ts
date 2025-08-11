// This is a mock version of the Supabase client for development without a backend
import { Database } from '@/types/database'

// Mock storage data
const mockFiles: Record<string, { data: Uint8Array; type: string }> = {};

// Mock client that simulates basic functionality
// Mock Supabase client for frontend development
import { Database } from '@/types/database'

interface MockUser {
  id: string;
  email: string;
  role: 'founder' | 'investor';
}

const mockUser: MockUser = {
  id: 'u1',
  email: 'demo@example.com',
  role: 'investor'
};

// Mock database tables
const mockDb = {
  profiles: [
    {
      id: 'u1',
      email: 'demo@example.com',
      role: 'investor',
      name: 'Demo User',
      avatar_url: 'https://ui-avatars.com/api/?name=Demo+User',
      created_at: '2025-07-29T00:00:00Z',
      updated_at: '2025-07-29T00:00:00Z'
    }
  ]
};

// Mock Supabase client
export const supabase = {
  auth: {
    getSession: () => Promise.resolve({ 
      data: { 
        session: {
          user: {
            id: 'u1',
            email: 'demo@example.com'
          }
        } 
      }, 
      error: null 
    }),
    onAuthStateChange: (callback: Function) => {
      callback('SIGNED_IN', { 
        user: {
          id: 'u1',
          email: 'demo@example.com'
        }
      });
      return { 
        data: { 
          subscription: { 
            unsubscribe: () => {} 
          } 
        } 
      };
    },
    signInWithPassword: () => Promise.resolve({
      data: { 
        user: {
          id: 'u1',
          email: 'demo@example.com'
        }
      },
      error: null
    }),
    signUp: () => Promise.resolve({
      data: { 
        user: {
          id: 'u1',
          email: 'demo@example.com'
        }
      },
      error: null
    }),
    signOut: () => Promise.resolve({ error: null })
  },
  from: function(table: string) {
    return {
      select: function(columns: string = '*') {
        return {
          eq: function(column: string, value: any) {
            return {
              single: async function() {
                if (table === 'profiles') {
                  const profile = mockDb.profiles.find(p => p[column as keyof typeof mockDb.profiles[0]] === value);
                  return {
                    data: profile || null,
                    error: profile ? null : new Error('Profile not found')
                  };
                }
                return { data: null, error: new Error('Table not found') };
              }
            };
          }
        };
      }
    };
  }
};
export const createServerClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}
