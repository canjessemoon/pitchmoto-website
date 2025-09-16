// This layout handles authenticated app routes (/app/*)
export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white">
      <main>
        {children}
      </main>
    </div>
  )
}
