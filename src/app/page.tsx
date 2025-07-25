import { LandingPage } from '@/components/marketing/landing-page'

export default function Home() {
  // For now, show landing page for unauthenticated users
  // Later we'll implement proper auth checking
  return <LandingPage />
}
