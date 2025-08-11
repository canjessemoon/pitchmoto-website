import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  console.log('=== Stripe Subscription API Called ===')
  
  try {
    const body = await request.json()
    console.log('Request body:', body)
    
    const { paymentMethodId, email, name, planType = 'basic', phoneNumber, country } = body

    if (!paymentMethodId || !email) {
      console.log('Missing required fields:', { paymentMethodId: !!paymentMethodId, email: !!email })
      return NextResponse.json(
        { error: 'Payment method and email are required' },
        { status: 400 }
      )
    }

    // Create or retrieve customer
    let customer
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1,
    })

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0]
      console.log('Found existing customer:', customer.id)
      
      // Always attach the new payment method to the customer
      try {
        await stripe.paymentMethods.attach(paymentMethodId, {
          customer: customer.id,
        })
        console.log('Attached payment method to existing customer')
      } catch (attachError: any) {
        // If already attached, that's fine
        if (attachError.code !== 'resource_already_attached') {
          console.error('Failed to attach payment method:', attachError)
          throw attachError
        }
        console.log('Payment method already attached to customer')
      }
      
      // Update customer's default payment method and other info
      const updateData: any = {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      }

      // Update phone if provided
      if (phoneNumber) {
        updateData.phone = phoneNumber
      }

      // Update address (country) if provided
      if (country) {
        updateData.address = {
          country: country
        }
      }

      await stripe.customers.update(customer.id, updateData)
    } else {
      // Prepare customer data
      const customerData: any = {
        email,
        name,
        payment_method: paymentMethodId,
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      }

      // Add phone number if provided
      if (phoneNumber) {
        customerData.phone = phoneNumber
      }

      // Add address (country) if provided
      if (country) {
        customerData.address = {
          country: country
        }
      }

      customer = await stripe.customers.create(customerData)
      console.log('Created new customer:', customer.id)
    }

    // Get price ID based on plan type
    const priceId = planType === 'premium' 
      ? process.env.STRIPE_PREMIUM_PRICE_ID 
      : process.env.STRIPE_BASIC_PRICE_ID

    console.log('Plan type:', planType)
    console.log('Selected price ID:', priceId)
    console.log('Environment check:', {
      basicPriceId: process.env.STRIPE_BASIC_PRICE_ID,
      premiumPriceId: process.env.STRIPE_PREMIUM_PRICE_ID
    })

    if (!priceId || priceId.includes('your_') || !priceId.startsWith('price_')) {
      console.error('Invalid price ID configuration:', { planType, priceId })
      return NextResponse.json(
        { 
          error: `Price ID not configured for ${planType} plan. Please create products in Stripe Dashboard first.`,
          details: 'Go to Stripe Dashboard → Products → Add product to create subscription plans'
        },
        { status: 400 }
      )
    }

    console.log('Creating subscription with price ID:', priceId)

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      default_payment_method: paymentMethodId,
      expand: ['latest_invoice.payment_intent'],
    })

    console.log('Subscription created successfully:', subscription.id)

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      customerId: customer.id,
      clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
    })
  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create subscription',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
