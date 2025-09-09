'use client'

import Link from 'next/link'
import { useTrackEvent } from '@/hooks/use-analytics'

interface ContactSupportButtonProps {
  className?: string
  children?: React.ReactNode
}

export function ContactSupportButton({ 
  className = "bg-[#405B53] text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors",
  children = "Contact Support"
}: ContactSupportButtonProps) {
  const { trackContactSupport } = useTrackEvent()

  const handleClick = () => {
    trackContactSupport()
  }

  return (
    <Link
      href="mailto:support@pitchmoto.com"
      className={className}
      onClick={handleClick}
    >
      {children}
    </Link>
  )
}
