import { Database } from '@/types/database';

// Mock test users for signin
const mockUsers = [
  {
    id: 'u1',
    email: 'founder@test.com',
    password: 'password123',
    user_type: 'founder' as const,
    full_name: 'John Founder',
    avatar_url: 'https://ui-avatars.com/api/?name=John+Founder',
    created_at: '2025-07-29T00:00:00Z',
    updated_at: '2025-07-29T00:00:00Z'
  },
  {
    id: 'u2', 
    email: 'investor@test.com',
    password: 'password123',
    user_type: 'investor' as const,
    full_name: 'Sarah Investor',
    avatar_url: 'https://ui-avatars.com/api/?name=Sarah+Investor',
    created_at: '2025-07-29T00:00:00Z',
    updated_at: '2025-07-29T00:00:00Z'
  },
  {
    id: 'u3',
    email: 'demo@pitchmoto.com',
    password: 'demo123',
    user_type: 'investor' as const,
    full_name: 'Demo User',
    avatar_url: 'https://ui-avatars.com/api/?name=Demo+User',
    created_at: '2025-07-29T00:00:00Z',
    updated_at: '2025-07-29T00:00:00Z'
  }
];

// Default mock profile for fallback
const mockProfile = mockUsers[0];

// Mock auth helpers
export async function signUp(email: string, password: string, fullName?: string) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Create mock user
  const newUser = {
    id: `user_${Date.now()}`,
    email,
    name: fullName || 'New User',
    role: 'founder',
    avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'New User')}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Store in localStorage (simulating database)
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(newUser));
    // Dispatch custom event for same-tab auth state changes
    window.dispatchEvent(new CustomEvent('authChange', { 
      detail: { user: { id: newUser.id, email: newUser.email, profile: newUser } } 
    }));
  }

  return Promise.resolve({ 
    data: { user: newUser }, 
    error: null as { message: string } | null 
  });
}

export async function signIn(email: string, password: string) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Find user in mock users array
  const foundUser = mockUsers.find(user => user.email === email && user.password === password);
  
  if (!foundUser) {
    return Promise.resolve({ 
      data: { user: null }, 
      error: { message: 'Invalid email or password' } as { message: string }
    });
  }

  // Create user object without password
  const { password: _, ...user } = foundUser;

  // Store in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
    // Dispatch custom event for same-tab auth state changes
    window.dispatchEvent(new CustomEvent('authChange', { 
      detail: { user: { id: user.id, email: user.email, profile: user } } 
    }));
  }

  return Promise.resolve({ 
    data: { user }, 
    error: null as { message: string } | null 
  });
}

export async function signOut() {
  // Clear user from localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
    // Dispatch custom event for sign out
    window.dispatchEvent(new CustomEvent('authChange', { 
      detail: { user: null } 
    }));
  }
  return Promise.resolve({ error: null });
}

export async function getCurrentUser() {
  // Check if there's a user profile in local storage
  const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  if (userStr) {
    const profile = JSON.parse(userStr);
    return {
      id: profile.id,
      email: profile.email,
      profile
    };
  }
  // Return null if no user is logged in
  return null;
}

export async function updateProfile(userId: string, updates: Record<string, unknown>) {
  // Mock update profile - updates the user in localStorage
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const updatedUser = { ...user, ...updates };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Dispatch custom event to trigger auth state update
      window.dispatchEvent(new CustomEvent('authChange', { 
        detail: { user: { id: updatedUser.id, email: updatedUser.email, profile: updatedUser } } 
      }));
      
      return Promise.resolve({ 
        data: updatedUser, 
        error: null 
      });
    }
  }
  
  return Promise.resolve({ 
    data: { ...mockProfile, ...updates }, 
    error: null 
  });
}

// Type definitions to match Supabase
type Profile = Database['public']['Tables']['profiles']['Row'];

export type { Profile };
