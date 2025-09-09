'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type CookieConsent = {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  preferences: boolean
}

type CookieConsentContextType = {
  consent: CookieConsent | null
  showBanner: boolean
  updateConsent: (consent: CookieConsent) => void
  acceptAll: () => void
  rejectAll: () => void
  showPreferences: () => void
  hidePreferences: () => void
  showingPreferences: boolean
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined)

const COOKIE_CONSENT_KEY = 'pitchmoto_cookie_consent'
const COOKIE_CONSENT_VERSION = '1.0'

const defaultConsent: CookieConsent = {
  necessary: true, // Always true - required for basic functionality
  analytics: false,
  marketing: false,
  preferences: false
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<CookieConsent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [showingPreferences, setShowingPreferences] = useState(false)

  useEffect(() => {
    // Check for existing consent on mount
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY)
    
    if (savedConsent) {
      try {
        const parsed = JSON.parse(savedConsent)
        // Check if we have a valid consent with the current version
        if (parsed.version === COOKIE_CONSENT_VERSION && parsed.consent) {
          setConsent(parsed.consent)
          setShowBanner(false)
        } else {
          // Old version or invalid format, show banner
          setShowBanner(true)
        }
      } catch {
        // Invalid JSON, show banner
        setShowBanner(true)
      }
    } else {
      // No saved consent, show banner
      setShowBanner(true)
    }
  }, [])

  const updateConsent = (newConsent: CookieConsent) => {
    const consentWithNecessary = { ...newConsent, necessary: true }
    setConsent(consentWithNecessary)
    setShowBanner(false)
    setShowingPreferences(false)
    
    // Save to localStorage
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      consent: consentWithNecessary,
      version: COOKIE_CONSENT_VERSION,
      timestamp: new Date().toISOString()
    }))

    // Trigger custom event for analytics to respond to
    window.dispatchEvent(new CustomEvent('cookieConsentUpdate', { 
      detail: consentWithNecessary 
    }))
  }

  const acceptAll = () => {
    updateConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true
    })
  }

  const rejectAll = () => {
    updateConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false
    })
  }

  const showPreferences = () => {
    setShowingPreferences(true)
  }

  const hidePreferences = () => {
    setShowingPreferences(false)
  }

  return (
    <CookieConsentContext.Provider value={{
      consent,
      showBanner,
      updateConsent,
      acceptAll,
      rejectAll,
      showPreferences,
      hidePreferences,
      showingPreferences
    }}>
      {children}
    </CookieConsentContext.Provider>
  )
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext)
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider')
  }
  return context
}
