// This layout handles investor-specific routes (/app/investors/*)
// Navigation is handled by individual pages to access user data
export default function InvestorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        {children}
      </main>
    </div>
  )
}
