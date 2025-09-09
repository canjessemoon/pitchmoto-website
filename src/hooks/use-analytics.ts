'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { trackPageView } from '@/components/analytics/google-analytics'

// Custom hook to track page views on route changes
export function useAnalytics() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname) {
      trackPageView(pathname)
    }
  }, [pathname])
}

// Custom hook for tracking specific events
export function useTrackEvent() {
  const trackEvent = (action: string, category: string, label?: string, value?: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      })
    }
  }

  // Pre-defined tracking functions for common PitchMoto events (PII-safe)
  const trackSignup = (userType: 'founder' | 'investor') => {
    trackEvent('signup', 'authentication', userType) // userType is not PII
  }

  const trackPitchView = (pitchId: string) => {
    // Only send hashed/anonymized pitch ID, never actual user data
    const sanitizedId = pitchId.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, 'pitch_id')
    trackEvent('pitch_view', 'engagement', sanitizedId)
  }

  const trackUpvote = (pitchId: string) => {
    // Only send hashed/anonymized pitch ID
    const sanitizedId = pitchId.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, 'pitch_id')
    trackEvent('upvote', 'engagement', sanitizedId)
  }

  const trackPitchSubmission = () => {
    trackEvent('pitch_submit', 'conversion', 'founder_action')
  }

  const trackSubscription = (plan: string) => {
    // Plan names are not PII (e.g., 'basic', 'premium')
    trackEvent('subscription', 'conversion', plan)
  }

  const trackContactSupport = () => {
    trackEvent('contact_support', 'support', 'faq_page')
  }

  return {
    trackEvent,
    trackSignup,
    trackPitchView,
    trackUpvote,
    trackPitchSubmission,
    trackSubscription,
    trackContactSupport,
  }
}
