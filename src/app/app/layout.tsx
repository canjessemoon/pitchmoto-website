import { redirect } from 'next/navigation'

// This layout will handle the /app routes
export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // For now, redirect /app to /dashboard 
  // Later we can implement proper /app routing if needed
  redirect('/dashboard')
}
