import { Navigation } from '@/components/ui/navigation'

// This layout handles public app routes (/app/*)
export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main>
        {children}
      </main>
    </div>
  )
}
