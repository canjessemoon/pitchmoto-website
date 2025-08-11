import Stripe from 'stripe'
import { loadStripe } from '@stripe/stripe-js'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
  typescript: true,
})

// Client-side Stripe promise
export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

export const STRIPE_PLANS = {
  basic: {
    priceId: process.env.STRIPE_BASIC_PRICE_ID!,
    name: 'Basic Plan',
    price: 2900, // $29.00 in cents
    interval: 'month' as const,
    features: [
      'Access to all startup pitches',
      'Basic messaging with founders',
      'Standard support'
    ]
  },
  premium: {
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID!,
    name: 'Premium Plan',
    price: 9900, // $99.00 in cents
    interval: 'month' as const,
    features: [
      'Everything in Basic',
      'Priority access to new pitches',
      'Advanced analytics',
      'Direct contact information',
      'Priority support'
    ]
  }
} as const

export type PlanType = keyof typeof STRIPE_PLANS

export const createCheckoutSession = async (
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) => {
  return await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
  })
}

export const createCustomer = async (email: string, name?: string) => {
  return await stripe.customers.create({
    email,
    name,
  })
}

export const getSubscription = async (subscriptionId: string) => {
  return await stripe.subscriptions.retrieve(subscriptionId)
}

export const cancelSubscription = async (subscriptionId: string) => {
  return await stripe.subscriptions.cancel(subscriptionId)
}
