'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MessagingInterface from '@/components/messaging/messaging-interface';
import { useAuth } from '@/components/providers';

export default function MessagesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <main className="p-4">
        <p>Loading...</p>
      </main>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <main>
      <MessagingInterface />
    </main>
  );
}
