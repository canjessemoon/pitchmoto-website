import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('Create subscription request received:', body)
    
    // TODO: Implement real Stripe integration
    // For now, return a mock success response to allow testing of other features
    
    const { email, name, planType, paymentMethodId } = body
    
    // Validate required fields
    if (!email || !name || !planType) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: email, name, or planType'
      }, { status: 400 })
    }
    
    // Mock successful subscription creation
    const mockSubscription = {
      id: `sub_mock_${Date.now()}`,
      customer: `cus_mock_${Date.now()}`,
      status: 'active',
      current_period_start: Math.floor(Date.now() / 1000),
      current_period_end: Math.floor((Date.now() + 7 * 24 * 60 * 60 * 1000) / 1000), // 7 days from now
      plan: {
        id: planType === 'basic' ? 'plan_basic' : 'plan_premium',
        amount: planType === 'basic' ? 0 : 2999, // $0 for basic, $29.99 for premium
        currency: 'usd',
        interval: 'month'
      }
    }
    
    console.log('Returning mock subscription:', mockSubscription)
    
    return NextResponse.json({
      success: true,
      subscription: mockSubscription,
      message: `Mock subscription created for ${email} with plan ${planType}. Stripe integration not yet implemented.`
    })
    
  } catch (error) {
    console.error('Error in create-subscription endpoint:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed. Use POST to create subscriptions.'
  }, { status: 405 })
}
