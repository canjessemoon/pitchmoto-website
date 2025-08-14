'use client'

import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

// Only load Stripe if we have a valid publishable key
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripePromise = stripePublishableKey && stripePublishableKey !== 'your_stripe_publishable_key' 
  ? loadStripe(stripePublishableKey)
  : null

interface StripeProviderProps {
  children: React.ReactNode
}

export default function StripeProvider({ children }: StripeProviderProps) {
  // If no valid Stripe key, just render children without Stripe context
  if (!stripePromise) {
    return <>{children}</>
  }

  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  )
}
