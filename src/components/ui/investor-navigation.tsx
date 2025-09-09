'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  Users, 
  Settings, 
  Target, 
  LogOut, 
  Menu, 
  X,
  Home,
  TrendingUp
} from 'lucide-react'

interface InvestorNavigationProps {
  user?: any
  userProfile?: any
}

export function InvestorNavigation({ user, userProfile }: InvestorNavigationProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigation = [
    {
      name: 'Dashboard',
      href: '/app/investors/dashboard',
      icon: Home,
      active: pathname === '/app/investors/dashboard'
    },
    {
      name: 'Investment Thesis',
      href: '/app/investors/thesis',
      icon: Target,
      active: pathname === '/app/investors/thesis'
    },
    {
      name: 'Analytics',
      href: '/app/investors/analytics',
      icon: BarChart3,
      active: pathname === '/app/investors/analytics'
    }
  ]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="bg-[#405B53] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link href="/app/investors/dashboard" className="flex items-center space-x-2">
              <div className="text-2xl font-bold">
                <span className="text-white">Pitch</span>
                <span className="text-[#E64E1B]">Moto</span>
              </div>
              <span className="text-[#8C948B] text-sm font-medium">Investor</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    item.active
                      ? 'bg-[#E64E1B] text-white'
                      : 'text-[#8C948B] hover:text-white hover:bg-[#8C948B]/20'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-sm">
              <div className="text-white font-medium">
                {userProfile?.full_name || user?.email?.split('@')[0] || 'Investor'}
              </div>
              <div className="text-[#8C948B] text-xs">Investor Account</div>
            </div>
            
            <Link href="/profile">
              <Button
                variant="ghost"
                size="sm"
                className="text-[#8C948B] hover:text-white hover:bg-[#8C948B]/20"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-[#8C948B] hover:text-white hover:bg-red-600/20"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[#8C948B]/20 py-4">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      item.active
                        ? 'bg-[#E64E1B] text-white'
                        : 'text-[#8C948B] hover:text-white hover:bg-[#8C948B]/20'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
              
              <div className="border-t border-[#8C948B]/20 pt-4 mt-4">
                <div className="px-3 py-2">
                  <div className="text-white font-medium text-sm">
                    {userProfile?.full_name || user?.email?.split('@')[0] || 'Investor'}
                  </div>
                  <div className="text-[#8C948B] text-xs">Investor Account</div>
                </div>
                
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-[#8C948B] hover:text-white hover:bg-[#8C948B]/20"
                >
                  <Settings className="w-5 h-5" />
                  <span>Profile Settings</span>
                </Link>
                
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    handleSignOut()
                  }}
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-[#8C948B] hover:text-white hover:bg-red-600/20 w-full"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

// Breadcrumb component for page navigation
interface BreadcrumbProps {
  items: { name: string; href?: string }[]
}

export function InvestorBreadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      <Link 
        href="/app/investors/dashboard" 
        className="hover:text-[#405B53] transition-colors"
      >
        Dashboard
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <span className="text-gray-400">/</span>
          {item.href ? (
            <Link 
              href={item.href}
              className="hover:text-[#405B53] transition-colors"
            >
              {item.name}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">{item.name}</span>
          )}
        </div>
      ))}
    </nav>
  )
}
