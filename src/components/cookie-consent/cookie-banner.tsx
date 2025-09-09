'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCookieConsent } from '@/contexts/cookie-consent-context'
import { X, Settings, Cookie } from 'lucide-react'

export function CookieBanner() {
  const { 
    showBanner, 
    acceptAll, 
    rejectAll, 
    showPreferences, 
    showingPreferences, 
    hidePreferences, 
    updateConsent, 
    consent 
  } = useCookieConsent()

  const [tempConsent, setTempConsent] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false
  })

  if (!showBanner && !showingPreferences) return null

  const handleSavePreferences = () => {
    updateConsent(tempConsent)
  }

  if (showingPreferences) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Cookie className="h-5 w-5 text-[#405B53]" />
                <h2 className="text-xl font-bold text-[#405B53]">Cookie Preferences</h2>
              </div>
              <button
                onClick={hidePreferences}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              We use cookies to enhance your experience on PitchMoto. You can choose which types of cookies to accept below. 
              Learn more in our <Link href="/privacy" className="text-[#E64E1B] hover:underline">Privacy Policy</Link>.
            </p>

            <div className="space-y-4">
              {/* Necessary Cookies */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-[#405B53]">Necessary Cookies</h3>
                  <div className="bg-gray-200 rounded-full p-1">
                    <div className="w-4 h-4 bg-[#405B53] rounded-full"></div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Essential for the website to function properly. These cannot be disabled as they are necessary for basic website functionality, security, and accessibility.
                </p>
              </div>

              {/* Analytics Cookies */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-[#405B53]">Analytics Cookies</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tempConsent.analytics}
                      onChange={(e) => setTempConsent(prev => ({ ...prev, analytics: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#405B53]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#405B53]"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-600">
                  Help us understand how visitors interact with our website by collecting and reporting information anonymously. We use Google Analytics 4 with privacy-enhanced settings.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Data retention: 14 months • IP addresses anonymized • No cross-device tracking
                </p>
              </div>

              {/* Preferences Cookies */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-[#405B53]">Preference Cookies</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tempConsent.preferences}
                      onChange={(e) => setTempConsent(prev => ({ ...prev, preferences: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#405B53]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#405B53]"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-600">
                  Remember your settings and preferences to provide a more personalized experience on future visits.
                </p>
              </div>

              {/* Marketing Cookies */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-[#405B53]">Marketing Cookies</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tempConsent.marketing}
                      onChange={(e) => setTempConsent(prev => ({ ...prev, marketing: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#405B53]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#405B53]"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-600">
                  Used to deliver relevant advertisements and track the effectiveness of our marketing campaigns. Currently not implemented.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={handleSavePreferences}
                className="flex-1 bg-[#405B53] text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Save Preferences
              </button>
              <button
                onClick={hidePreferences}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Cookie className="h-6 w-6 text-[#405B53] mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-[#405B53] mb-1">We value your privacy</h3>
              <p className="text-sm text-gray-600">
                We use cookies to enhance your experience, analyze site usage, and assist in our marketing efforts. 
                By clicking "Accept All", you consent to our use of cookies. You can manage your preferences or learn more in our{' '}
                <Link href="/privacy" className="text-[#E64E1B] hover:underline">Privacy Policy</Link> and{' '}
                <Link href="/terms" className="text-[#E64E1B] hover:underline">Terms of Service</Link>.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 lg:flex-shrink-0">
            <button
              onClick={showPreferences}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <Settings className="h-4 w-4" />
              Customize
            </button>
            <button
              onClick={rejectAll}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Reject All
            </button>
            <button
              onClick={acceptAll}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
