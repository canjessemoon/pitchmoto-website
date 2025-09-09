'use client'

import { useState } from 'react'
import { useCookieConsent } from '@/contexts/cookie-consent-context'
import { Cookie, Save } from 'lucide-react'

export function CookiePreferences() {
  const { consent, updateConsent } = useCookieConsent()
  const [tempConsent, setTempConsent] = useState(consent || {
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false
  })
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    updateConsent(tempConsent)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Cookie className="h-5 w-5 text-[#405B53]" />
        <h2 className="text-xl font-semibold text-[#405B53]">Cookie Preferences</h2>
      </div>

      <p className="text-gray-600 mb-6">
        Manage your cookie preferences. Changes will take effect immediately.
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
            Required for basic website functionality. Cannot be disabled.
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
            Help us improve our website with anonymized usage data.
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
            Remember your settings for a personalized experience.
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
            Currently not implemented. For future marketing features.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-[#405B53] text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Save className="h-4 w-4" />
          Save Preferences
        </button>
        {saved && (
          <span className="text-green-600 text-sm">✓ Preferences saved successfully</span>
        )}
      </div>
    </div>
  )
}
