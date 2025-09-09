'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'
import { useCookieConsent } from '@/contexts/cookie-consent-context'

// Function to sanitize URLs and remove PII
function sanitizeUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    
    // Remove query parameters that might contain PII
    const allowedParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
    const searchParams = new URLSearchParams()
    
    for (const [key, value] of urlObj.searchParams.entries()) {
      if (allowedParams.includes(key.toLowerCase())) {
        searchParams.set(key, value)
      }
    }
    
    // Reconstruct URL without PII
    return `${urlObj.origin}${urlObj.pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`
  } catch {
    // If URL parsing fails, return a safe fallback
    return window.location.origin + window.location.pathname
  }
}

// Function to sanitize page titles
function sanitizeTitle(title: string): string {
  // Remove any potential email addresses or sensitive data from titles
  return title.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[email]')
              .replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[card]')
              .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[ssn]')
}

export function GoogleAnalytics() {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  const { consent } = useCookieConsent()
  const [shouldLoadGA, setShouldLoadGA] = useState(false)

  useEffect(() => {
    // Check if analytics consent is given
    if (consent?.analytics) {
      setShouldLoadGA(true)
    } else {
      setShouldLoadGA(false)
      // If GA was previously loaded but user revoked consent, disable it
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'update', {
          analytics_storage: 'denied'
        })
      }
    }
  }, [consent])

  useEffect(() => {
    // Listen for cookie consent updates
    const handleConsentUpdate = (event: CustomEvent) => {
      const newConsent = event.detail
      if (newConsent.analytics && typeof window !== 'undefined' && window.gtag) {
        // Enable analytics if consent is given
        window.gtag('consent', 'update', {
          analytics_storage: 'granted'
        })
      }
    }

    window.addEventListener('cookieConsentUpdate', handleConsentUpdate as EventListener)
    return () => {
      window.removeEventListener('cookieConsentUpdate', handleConsentUpdate as EventListener)
    }
  }, [])

  if (!GA_MEASUREMENT_ID || !shouldLoadGA) {
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          
          // Set initial consent state
          gtag('consent', 'default', {
            analytics_storage: 'granted',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            functionality_storage: 'granted',
            security_storage: 'granted'
          });
          
          // Configure GA4 with privacy settings
          gtag('config', '${GA_MEASUREMENT_ID}', {
            // Sanitized page data
            page_title: document.title.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g, '[email]'),
            page_location: window.location.origin + window.location.pathname,
            
            // Privacy settings
            anonymize_ip: true,
            allow_google_signals: false,
            allow_ad_personalization_signals: false,
            
            // Custom parameters for better privacy
            custom_map: {
              custom_parameter_1: 'user_type'
            }
          });
        `}
      </Script>
    </>
  )
}

// Helper function to sanitize event labels
function sanitizeEventLabel(label?: string): string | undefined {
  if (!label) return undefined
  
  // Remove PII from event labels
  return label.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[email]')
              .replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[card]')
              .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[ssn]')
              .replace(/\b\d{10,}\b/g, '[number]') // Generic long numbers
}

// Helper function to track events (PII-safe)
export function trackEvent(action: string, category: string, label?: string, value?: number) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: sanitizeEventLabel(label),
      value: value,
      // Ensure no PII in custom parameters
      send_page_view: false // Prevent duplicate page views
    })
  }
}

// Helper function to track page views (for client-side navigation)
export function trackPageView(path: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
      page_path: sanitizeUrl(window.location.origin + path),
      page_title: sanitizeTitle(document.title)
    })
  }
}

// TypeScript declaration for gtag
declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}
