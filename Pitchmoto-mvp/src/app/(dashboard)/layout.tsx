export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* Main content */}
      <div className="container mx-auto px-4">
        {children}
      </div>
    </div>
  );
}
