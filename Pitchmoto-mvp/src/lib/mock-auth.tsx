import { createContext, useContext, ReactNode, useState } from 'react';

// Mock user type
interface User {
  id: string;
  email: string;
  role: 'founder' | 'investor';
  name: string;
}

// Mock auth context type
interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data
const mockUser: User = {
  id: 'u1',
  email: 'demo@example.com',
  role: 'investor',
  name: 'Demo User',
};

// Provider component
export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [user] = useState<User | null>(mockUser); // Always logged in as mock user

  const signIn = async () => {
    // Mock sign in - does nothing since we're always logged in
    return Promise.resolve();
  };

  const signOut = async () => {
    // Mock sign out - does nothing since we're always logged in
    return Promise.resolve();
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a MockAuthProvider');
  }
  return context;
}
