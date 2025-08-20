'use client'

import { useState, useImperativeHandle, forwardRef } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

interface PaymentFormProps {
  onPaymentSuccess: (paymentMethodId: string) => void
  onError: (error: string) => void
  loading?: boolean
  className?: string
}

export interface PaymentFormRef {
  createPaymentMethod: () => Promise<string | null>
}

const PaymentForm = forwardRef<PaymentFormRef, PaymentFormProps>(({ 
  onPaymentSuccess, 
  onError, 
  loading = false,
  className = ""
}, ref) => {
  // Always call hooks at the top level
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)

  const createPaymentMethod = async (): Promise<string | null> => {
    if (!stripe || !elements) {
      // For development without real Stripe keys, return a mock payment method ID
      console.log('Development mode: Using mock payment method (Stripe not available)')
      const mockPaymentMethodId = 'pm_mock_payment_method_' + Date.now()
      onPaymentSuccess(mockPaymentMethodId)
      return mockPaymentMethodId
    }

    const card = elements.getElement(CardElement)
    if (!card) {
      onError('Card information is required.')
      return null
    }

    setIsProcessing(true)

    try {
      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card,
      })

      if (error) {
        onError(error.message || 'An error occurred processing your payment.')
        return null
      }

      if (paymentMethod) {
        onPaymentSuccess(paymentMethod.id)
        return paymentMethod.id
      }
      
      return null
    } catch (err) {
      onError('An unexpected error occurred. Please try again.')
      return null
    } finally {
      setIsProcessing(false)
    }
  }

  useImperativeHandle(ref, () => ({
    createPaymentMethod
  }))

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#374151',
        fontFamily: 'Inter, system-ui, sans-serif',
        '::placeholder': {
          color: '#9CA3AF',
        },
      },
      invalid: {
        color: '#EF4444',
      },
    },
    hidePostalCode: false,
  }

  // If Stripe is not available, show a placeholder
  if (!stripe) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Information *
          </label>
          <div className="border border-gray-300 rounded-md p-3 bg-gray-50">
            <div className="text-gray-500 text-center py-4">
              💳 Payment form (Stripe not configured for development)
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            In development mode without Stripe keys. Payment will be mocked.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Information *
        </label>
        <div className="border border-gray-300 rounded-md p-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
          <CardElement options={cardElementOptions} />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Your payment information is encrypted and secure.
        </p>
      </div>
    </div>
  )
})

PaymentForm.displayName = 'PaymentForm'

export default PaymentForm
