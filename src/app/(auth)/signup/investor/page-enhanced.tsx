'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authHelpers, profileHelpers } from '@/lib/auth-helpers'
import StripeProvider from '@/components/providers/stripe-provider'
import PaymentForm, { PaymentFormRef } from '@/components/ui/payment-form'
import Modal from '@/components/ui/modal'
import TermsOfServiceContent from '@/components/legal/terms-of-service'
import PrivacyPolicyContent from '@/components/legal/privacy-policy'

interface InvestorSignupData {
  // Step 1: Personal & Professional Information
  firstName: string
  lastName: string
  phoneNumber: string
  address: string
  address2: string
  city: string
  state: string
  postalCode: string
  country: string
  investorType: string
  companyName: string
  jobTitle: string
  
  // Step 2: Investment Preferences
  investmentStages: string[]
  industryPreferences: string[]
  minInvestment: string
  maxInvestment: string
  
  // Step 3: Account Creation
  email: string
  password: string
  accountType: string
  planType: string
  agreesToTerms: boolean
  
  // Billing Information (auto-populated from Step 1, but editable)
  billingFirstName: string
  billingLastName: string
  billingAddress: string
  billingAddress2: string
  billingCity: string
  billingState: string
  billingPostalCode: string
  billingCountry: string
  
  // Step management
  currentStep: number
}

export default function InvestorSignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [paymentMethodId, setPaymentMethodId] = useState('')
  const paymentFormRef = useRef<PaymentFormRef>(null)
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState<'terms' | 'privacy'>('terms')
  
  const [formData, setFormData] = useState<InvestorSignupData>({
    // Step 1: Personal & Professional Information
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    investorType: '',
    companyName: '',
    jobTitle: '',
    
    // Step 2: Investment Preferences
    investmentStages: [],
    industryPreferences: [],
    minInvestment: '',
    maxInvestment: '',
    
    // Step 3: Account Creation
    email: '',
    password: '',
    accountType: '',
    planType: 'Individual', // Default to Individual plan
    agreesToTerms: false,
    
    // Billing Information (will be auto-populated from Step 1)
    billingFirstName: '',
    billingLastName: '',
    billingAddress: '',
    billingAddress2: '',
    billingCity: '',
    billingState: '',
    billingPostalCode: '',
    billingCountry: '',
    
    // Step management
    currentStep: 1
  })

  const totalSteps = 3

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const formatted = formatPhoneNumber(value)
    setFormData(prev => ({ ...prev, phoneNumber: formatted }))
  }

  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '')
    
    // Limit to 11 digits (1 + 10 digit US number)
    const limitedNumbers = numbers.slice(0, 11)
    
    // Format as +1 (123) 456-7890
    if (limitedNumbers.length === 0) return ''
    if (limitedNumbers.length <= 1) return `+${limitedNumbers}`
    if (limitedNumbers.length <= 4) return `+${limitedNumbers[0]} (${limitedNumbers.slice(1)}`
    if (limitedNumbers.length <= 7) return `+${limitedNumbers[0]} (${limitedNumbers.slice(1, 4)}) ${limitedNumbers.slice(4)}`
    return `+${limitedNumbers[0]} (${limitedNumbers.slice(1, 4)}) ${limitedNumbers.slice(4, 7)}-${limitedNumbers.slice(7)}`
  }

  const handleMultiSelectChange = (name: keyof InvestorSignupData, value: string) => {
    setFormData(prev => {
      const currentValues = prev[name] as string[]
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value]
      return { ...prev, [name]: newValues }
    })
  }

  const handleStep1Continue = () => {
    // Basic validation for Step 1 (combined personal + professional info)
    if (!formData.firstName || !formData.lastName || !formData.jobTitle || 
        !formData.companyName || !formData.address || !formData.city || 
        !formData.state || !formData.postalCode || !formData.country || !formData.phoneNumber || !formData.investorType) {
      alert('Please fill in all required fields')
      return
    }
    setFormData(prev => ({ ...prev, currentStep: 2 }))
  }

  const handleStep2Continue = () => {
    // Validation for Step 2 - check investment range consistency
    if (formData.minInvestment && formData.maxInvestment) {
      const minValue = getInvestmentValue(formData.minInvestment)
      const maxValue = getInvestmentValue(formData.maxInvestment)
      
      if (maxValue < minValue) {
        alert('Maximum investment cannot be smaller than minimum investment')
        return
      }
    }
    
    // Auto-populate billing information from Step 1 data
    setFormData(prev => ({ 
      ...prev, 
      currentStep: 3,
      billingFirstName: prev.firstName,
      billingLastName: prev.lastName,
      billingAddress: prev.address,
      billingAddress2: prev.address2,
      billingCity: prev.city,
      billingState: prev.state,
      billingPostalCode: prev.postalCode,
      billingCountry: prev.country
    }))
  }

  // Payment handlers
  const handlePaymentSuccess = async (paymentMethodId: string) => {
    setPaymentMethodId(paymentMethodId)
    setPaymentError('')
  }

  const handlePaymentError = (error: string) => {
    setPaymentError(error)
  }

  // Helper function to convert investment ranges to comparable numeric values
  const getInvestmentValue = (range: string): number => {
    switch (range) {
      case '1K-10K': return 10000
      case '10K-50K': return 50000
      case '50K-100K': return 100000
      case '100K-500K': return 500000
      case '500K-1M': return 1000000
      case '1M+': return 1000000
      case '1M-5M': return 5000000
      case '5M+': return 5000000
      default: return 0
    }
  }

  const handleCreateAccount = async () => {
    // Basic validation for Step 3
    if (!formData.email || !formData.password) {
      alert('Please fill in both email and password')
      return
    }

    if (formData.password.length < 8) {
      alert('Password must be at least 8 characters long')
      return
    }

    if (!formData.accountType) {
      alert('Please select an account type')
      return
    }

    // For paid accounts, require plan selection
    if (formData.accountType === 'paid' && !formData.planType) {
      alert('Please select a plan for your paid account')
      return
    }

    // For paid accounts, require billing information
    if (formData.accountType === 'paid') {
      if (!formData.billingFirstName || !formData.billingLastName || !formData.billingAddress || 
          !formData.billingCity || !formData.billingState || !formData.billingPostalCode || !formData.billingCountry) {
        alert('Please fill in all required billing information')
        return
      }
    }
    
    if (!formData.agreesToTerms) {
      alert('Please agree to the Terms of Service and Privacy Policy')
      return
    }

    setLoading(true)
    setPaymentLoading(true)

    try {
      let finalPaymentMethodId: string | null = paymentMethodId

      // Handle Stripe subscription for paid accounts
      if (formData.accountType === 'paid') {
        // Create payment method from the payment form
        if (paymentFormRef.current) {
          finalPaymentMethodId = await paymentFormRef.current.createPaymentMethod()
          if (!finalPaymentMethodId) {
            // Error already handled by the payment form
            return
          }
        } else {
          setPaymentError('Payment form not available. Please refresh and try again.')
          return
        }

        console.log('Creating subscription with:', {
          paymentMethodId: finalPaymentMethodId,
          email: formData.email,
          name: `${formData.firstName} ${formData.lastName}`,
          planType: formData.planType === 'Individual' ? 'basic' : 'premium'
        })

        const response = await fetch('/api/stripe/create-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentMethodId: finalPaymentMethodId,
            email: formData.email,
            name: `${formData.firstName} ${formData.lastName}`,
            phoneNumber: formData.phoneNumber,
            country: formData.country,
            planType: formData.planType === 'Individual' ? 'basic' : 'premium', // Maps Individual to basic, Team to premium
          }),
        })

        console.log('Response status:', response.status)
        console.log('Response headers:', Object.fromEntries(response.headers.entries()))
        
        let paymentResult: any = {}
        try {
          const responseText = await response.text()
          console.log('Raw response text:', responseText)
          
          if (responseText) {
            paymentResult = JSON.parse(responseText)
          } else {
            console.error('Empty response from server')
            throw new Error('Server returned an empty response')
          }
        } catch (parseError) {
          console.error('Failed to parse response:', parseError)
          console.error('Response was:', await response.text().catch(() => 'Could not read response'))
          throw new Error('Server returned invalid response format')
        }
        
        console.log('Payment result:', paymentResult)

        if (!response.ok) {
          const errorMessage = paymentResult.error || paymentResult.details || 'Payment failed'
          console.error('Payment error details:', {
            status: response.status,
            statusText: response.statusText,
            paymentResult,
            errorMessage
          })
          throw new Error(errorMessage)
        }

        if (!paymentResult.success) {
          const errorMessage = paymentResult.error || 'Payment processing failed'
          console.error('Payment not successful:', paymentResult)
          throw new Error(errorMessage)
        }
      }

      // Create account using real Supabase auth
      const { data, error } = await authHelpers.signUpWithEmail(
        formData.email,
        formData.password,
        `${formData.firstName} ${formData.lastName}`
      )

      if (error) {
        alert(error.message || 'Account creation failed')
        return
      }

      if (data?.user) {
        // Update user profile with all collected information
        await profileHelpers.updateProfile(data.user.id, {
          user_type: 'investor',
          full_name: `${formData.firstName} ${formData.lastName}`,
          subscription_type: formData.accountType,
          // Add other profile data as needed
        })
        
        // Add a small delay to ensure auth state is updated
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Redirect to dashboard
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Account creation error:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'
      setPaymentError(errorMessage)
    } finally {
      setLoading(false)
      setPaymentLoading(false)
    }
  }

  // Modal handlers
  const openTermsModal = () => {
    setModalContent('terms')
    setIsModalOpen(true)
  }

  const openPrivacyModal = () => {
    setModalContent('privacy')
    setIsModalOpen(true)
  }

  const renderStep = () => {
    switch (formData.currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">First, tell us about yourself and your background:</h2>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your first name"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your last name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    id="jobTitle"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your job title"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                    Company/Fund Name *
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your company or fund name"
                    required
                  />
                </div>
              </div>

              {/* Address Fields */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Company Address *
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter street address"
                  required
                />
              </div>

              <div>
                <label htmlFor="address2" className="block text-sm font-medium text-gray-700">
                  Company Address 2
                </label>
                <input
                  type="text"
                  id="address2"
                  name="address2"
                  value={formData.address2}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Apartment, suite, unit, building, floor, etc. (optional)"
                />
              </div>

              {/* City, Province/State, Postal/Zip Code */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter city"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                    Province/State *
                  </label>
                  <select
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  >
                    <option value="">Select province/state</option>
                    <optgroup label="Canada">
                      <option value="Alberta">Alberta</option>
                      <option value="British Columbia">British Columbia</option>
                      <option value="Manitoba">Manitoba</option>
                      <option value="New Brunswick">New Brunswick</option>
                      <option value="Newfoundland and Labrador">Newfoundland and Labrador</option>
                      <option value="Northwest Territories">Northwest Territories</option>
                      <option value="Nova Scotia">Nova Scotia</option>
                      <option value="Nunavut">Nunavut</option>
                      <option value="Ontario">Ontario</option>
                      <option value="Prince Edward Island">Prince Edward Island</option>
                      <option value="Quebec">Quebec</option>
                      <option value="Saskatchewan">Saskatchewan</option>
                      <option value="Yukon">Yukon</option>
                    </optgroup>
                    <optgroup label="United States">
                      <option value="Alabama">Alabama</option>
                      <option value="Alaska">Alaska</option>
                      <option value="Arizona">Arizona</option>
                      <option value="Arkansas">Arkansas</option>
                      <option value="California">California</option>
                      <option value="Colorado">Colorado</option>
                      <option value="Connecticut">Connecticut</option>
                      <option value="Delaware">Delaware</option>
                      <option value="Florida">Florida</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Hawaii">Hawaii</option>
                      <option value="Idaho">Idaho</option>
                      <option value="Illinois">Illinois</option>
                      <option value="Indiana">Indiana</option>
                      <option value="Iowa">Iowa</option>
                      <option value="Kansas">Kansas</option>
                      <option value="Kentucky">Kentucky</option>
                      <option value="Louisiana">Louisiana</option>
                      <option value="Maine">Maine</option>
                      <option value="Maryland">Maryland</option>
                      <option value="Massachusetts">Massachusetts</option>
                      <option value="Michigan">Michigan</option>
                      <option value="Minnesota">Minnesota</option>
                      <option value="Mississippi">Mississippi</option>
                      <option value="Missouri">Missouri</option>
                      <option value="Montana">Montana</option>
                      <option value="Nebraska">Nebraska</option>
                      <option value="Nevada">Nevada</option>
                      <option value="New Hampshire">New Hampshire</option>
                      <option value="New Jersey">New Jersey</option>
                      <option value="New Mexico">New Mexico</option>
                      <option value="New York">New York</option>
                      <option value="North Carolina">North Carolina</option>
                      <option value="North Dakota">North Dakota</option>
                      <option value="Ohio">Ohio</option>
                      <option value="Oklahoma">Oklahoma</option>
                      <option value="Oregon">Oregon</option>
                      <option value="Pennsylvania">Pennsylvania</option>
                      <option value="Rhode Island">Rhode Island</option>
                      <option value="South Carolina">South Carolina</option>
                      <option value="South Dakota">South Dakota</option>
                      <option value="Tennessee">Tennessee</option>
                      <option value="Texas">Texas</option>
                      <option value="Utah">Utah</option>
                      <option value="Vermont">Vermont</option>
                      <option value="Virginia">Virginia</option>
                      <option value="Washington">Washington</option>
                      <option value="West Virginia">West Virginia</option>
                      <option value="Wisconsin">Wisconsin</option>
                      <option value="Wyoming">Wyoming</option>
                      <option value="District of Columbia">District of Columbia</option>
                    </optgroup>
                    <optgroup label="Other Regions">
                      <option value="Other">Other</option>
                    </optgroup>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                    Postal/Zip Code *
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter postal/zip code"
                    required
                  />
                </div>
              </div>

              {/* Country and Phone Number */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                    Country *
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  >
                    <option value="">Select your country</option>
                    <option value="Canada">Canada</option>
                    <option value="United States">United States</option>
                    <option disabled>────────────────</option>
                    <option value="Afghanistan">Afghanistan</option>
                    <option value="Albania">Albania</option>
                    <option value="Algeria">Algeria</option>
                    <option value="Argentina">Argentina</option>
                    <option value="Armenia">Armenia</option>
                    <option value="Australia">Australia</option>
                    <option value="Austria">Austria</option>
                    <option value="Azerbaijan">Azerbaijan</option>
                    <option value="Bangladesh">Bangladesh</option>
                    <option value="Belgium">Belgium</option>
                    <option value="Brazil">Brazil</option>
                    <option value="Bulgaria">Bulgaria</option>
                    <option value="Cambodia">Cambodia</option>
                    <option value="Chile">Chile</option>
                    <option value="China">China</option>
                    <option value="Colombia">Colombia</option>
                    <option value="Croatia">Croatia</option>
                    <option value="Czech Republic">Czech Republic</option>
                    <option value="Denmark">Denmark</option>
                    <option value="Egypt">Egypt</option>
                    <option value="Estonia">Estonia</option>
                    <option value="Finland">Finland</option>
                    <option value="France">France</option>
                    <option value="Germany">Germany</option>
                    <option value="Ghana">Ghana</option>
                    <option value="Greece">Greece</option>
                    <option value="Hungary">Hungary</option>
                    <option value="Iceland">Iceland</option>
                    <option value="India">India</option>
                    <option value="Indonesia">Indonesia</option>
                    <option value="Ireland">Ireland</option>
                    <option value="Israel">Israel</option>
                    <option value="Italy">Italy</option>
                    <option value="Japan">Japan</option>
                    <option value="Jordan">Jordan</option>
                    <option value="Kenya">Kenya</option>
                    <option value="Latvia">Latvia</option>
                    <option value="Lithuania">Lithuania</option>
                    <option value="Luxembourg">Luxembourg</option>
                    <option value="Malaysia">Malaysia</option>
                    <option value="Mexico">Mexico</option>
                    <option value="Morocco">Morocco</option>
                    <option value="Netherlands">Netherlands</option>
                    <option value="New Zealand">New Zealand</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="Norway">Norway</option>
                    <option value="Pakistan">Pakistan</option>
                    <option value="Peru">Peru</option>
                    <option value="Philippines">Philippines</option>
                    <option value="Poland">Poland</option>
                    <option value="Portugal">Portugal</option>
                    <option value="Romania">Romania</option>
                    <option value="Russia">Russia</option>
                    <option value="Saudi Arabia">Saudi Arabia</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Slovakia">Slovakia</option>
                    <option value="Slovenia">Slovenia</option>
                    <option value="South Africa">South Africa</option>
                    <option value="South Korea">South Korea</option>
                    <option value="Spain">Spain</option>
                    <option value="Sweden">Sweden</option>
                    <option value="Switzerland">Switzerland</option>
                    <option value="Thailand">Thailand</option>
                    <option value="Turkey">Turkey</option>
                    <option value="Ukraine">Ukraine</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Vietnam">Vietnam</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handlePhoneChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="+1 (123) 456-7890"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="investorType" className="block text-sm font-medium text-gray-700">
                  Investor Type *
                </label>
                <select
                  id="investorType"
                  name="investorType"
                  value={formData.investorType}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                >
                  <option value="">Select investor type</option>
                  <option value="angel">Angel Investor</option>
                  <option value="vc">Venture Capitalist</option>
                  <option value="pe">Private Equity</option>
                  <option value="family-office">Family Office</option>
                  <option value="corporate">Corporate Investor</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between">
              <Link 
                href="/signup" 
                className="text-gray-500 hover:text-gray-700 flex items-center"
              >
                ← Back to signup options
              </Link>
              <button
                type="button"
                onClick={handleStep1Continue}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 flex items-center"
              >
                Continue →
              </button>
            </div>
          </div>
        )
      
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">Next, tell us about your investment preferences:</h2>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Preferred Investment Stages (Select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C+', 'Growth', 'Later Stage'].map((stage) => (
                    <div key={stage} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`stage-${stage}`}
                        checked={formData.investmentStages.includes(stage)}
                        onChange={() => handleMultiSelectChange('investmentStages', stage)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`stage-${stage}`} className="ml-2 text-sm text-gray-700">
                        {stage}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Industry Preferences (Select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Technology', 'Healthcare', 'Financial Services', 'E-commerce', 'Education', 'Real Estate', 'Manufacturing', 'Energy', 'Consumer Goods', 'Media & Entertainment', 'Transportation', 'Agriculture', 'Other'].map((industry) => (
                    <div key={industry} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`industry-${industry}`}
                        checked={formData.industryPreferences.includes(industry)}
                        onChange={() => handleMultiSelectChange('industryPreferences', industry)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`industry-${industry}`} className="ml-2 text-sm text-gray-700">
                        {industry}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="minInvestment" className="block text-sm font-medium text-gray-700">
                    Minimum Investment
                  </label>
                  <select
                    id="minInvestment"
                    name="minInvestment"
                    value={formData.minInvestment}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select minimum</option>
                    <option value="1K-10K">$1K - $10K</option>
                    <option value="10K-50K">$10K - $50K</option>
                    <option value="50K-100K">$50K - $100K</option>
                    <option value="100K-500K">$100K - $500K</option>
                    <option value="500K-1M">$500K - $1M</option>
                    <option value="1M+">$1M+</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="maxInvestment" className="block text-sm font-medium text-gray-700">
                    Maximum Investment
                  </label>
                  <select
                    id="maxInvestment"
                    name="maxInvestment"
                    value={formData.maxInvestment}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select maximum</option>
                    <option value="1K-10K">$1K - $10K</option>
                    <option value="10K-50K">$10K - $50K</option>
                    <option value="50K-100K">$50K - $100K</option>
                    <option value="100K-500K">$100K - $500K</option>
                    <option value="500K-1M">$500K - $1M</option>
                    <option value="1M-5M">$1M - $5M</option>
                    <option value="5M+">$5M+</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, currentStep: 1 }))}
                className="text-gray-500 hover:text-gray-700 flex items-center"
              >
                ← Previous Step
              </button>
              <button
                type="button"
                onClick={handleStep2Continue}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 flex items-center"
              >
                Continue →
              </button>
            </div>
          </div>
        )
      
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">Finally, provide an email address and password, then select your account type to create your Pitchmoto account</h2>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your email address"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <div className="mt-1 relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Create a secure password (min 8 characters)"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-400">Password must be at least 8 characters long</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose Your Account Type *
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Free Account */}
                  <div 
                    className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${
                      formData.accountType === 'free' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, accountType: 'free', planType: 'Individual' }))}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="accountType"
                        value="free"
                        checked={formData.accountType === 'free'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div className="ml-3">
                        <h4 className="font-medium text-gray-900">Free Account</h4>
                        <p className="text-sm text-gray-600">
                          Browse pitches, upvote startups, and join the community.
                        </p>
                        <ul className="text-sm text-gray-600 mt-2 ml-4 list-disc">
                          <li>View trending pitches</li>
                          <li>Upvote your favorites</li>
                          <li>Create watchlists</li>
                          <li>Basic search and filters</li>
                          <li>Community discussions</li>
                        </ul>
                        <p className="text-lg font-semibold text-green-600 mt-2">$0/month</p>
                      </div>
                    </div>
                  </div>

                  {/* Paid Account */}
                  <div 
                    className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${
                      formData.accountType === 'paid' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, accountType: 'paid' }))}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="accountType"
                        value="paid"
                        checked={formData.accountType === 'paid'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div className="ml-3">
                        <h4 className="font-medium text-gray-900">
                          Paid Account
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            7-day free trial
                          </span>
                        </h4>
                        <p className="text-sm text-gray-600">
                          Everything in Free plus messaging, advanced analytics, and priority support.
                        </p>
                        <ul className="text-sm text-gray-600 mt-2 ml-4 list-disc">
                          <li>Direct messaging with founders</li>
                          <li>Advanced search & filters</li>
                          <li>Investment analytics</li>
                          <li>Priority support</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Plan Selection - Only show for paid accounts */}
              {formData.accountType === 'paid' && (
                <div className="border-t pt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Choose Your Plan *
                  </label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Individual Plan */}
                    <div 
                      className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${
                        formData.planType === 'Individual' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, planType: 'Individual' }))}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="planType"
                          value="Individual"
                          checked={formData.planType === 'Individual'}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <div className="ml-3">
                          <h4 className="font-medium text-gray-900">Individual</h4>
                          <p className="text-sm text-gray-600">Perfect for solo investors</p>
                          <p className="text-2xl font-bold text-gray-900 mt-2">CAD $50<span className="text-sm font-normal text-gray-600">/month</span></p>
                          <ul className="text-sm text-gray-600 mt-2 space-y-1">
                            <li>• 1 user account</li>
                            <li>• Unlimited messaging</li>
                            <li>• Personal dashboard</li>
                            <li>• Investment tracking</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Team Plan */}
                    <div 
                      className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${
                        formData.planType === 'Team' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, planType: 'Team' }))}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="planType"
                          value="Team"
                          checked={formData.planType === 'Team'}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <div className="ml-3">
                          <h4 className="font-medium text-gray-900">
                            Team
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              Popular
                            </span>
                          </h4>
                          <p className="text-sm text-gray-600">For investment firms & teams</p>
                          <p className="text-2xl font-bold text-gray-900 mt-2">CAD $250<span className="text-sm font-normal text-gray-600">/month</span></p>
                          <ul className="text-sm text-gray-600 mt-2 space-y-1">
                            <li>• Up to 5 team members</li>
                            <li>• Shared deal pipeline</li>
                            <li>• Team analytics</li>
                            <li>• Collaboration tools</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Billing Information - Only show for paid accounts */}
              {formData.accountType === 'paid' && (
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Billing Information</h3>
                    <p className="text-sm text-gray-500">
                      Auto-filled from your profile information
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="billingFirstName" className="block text-sm font-medium text-gray-700">
                          First Name *
                        </label>
                        <input
                          type="text"
                          id="billingFirstName"
                          name="billingFirstName"
                          value={formData.billingFirstName}
                          onChange={handleInputChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="billingLastName" className="block text-sm font-medium text-gray-700">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          id="billingLastName"
                          name="billingLastName"
                          value={formData.billingLastName}
                          onChange={handleInputChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="billingAddress" className="block text-sm font-medium text-gray-700">
                        Billing Address *
                      </label>
                      <input
                        type="text"
                        id="billingAddress"
                        name="billingAddress"
                        value={formData.billingAddress}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="billingAddress2" className="block text-sm font-medium text-gray-700">
                        Billing Address 2
                      </label>
                      <input
                        type="text"
                        id="billingAddress2"
                        name="billingAddress2"
                        value={formData.billingAddress2}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Apartment, suite, unit, etc. (optional)"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="billingCity" className="block text-sm font-medium text-gray-700">
                          City *
                        </label>
                        <input
                          type="text"
                          id="billingCity"
                          name="billingCity"
                          value={formData.billingCity}
                          onChange={handleInputChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="billingState" className="block text-sm font-medium text-gray-700">
                          Province/State *
                        </label>
                        <input
                          type="text"
                          id="billingState"
                          name="billingState"
                          value={formData.billingState}
                          onChange={handleInputChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="billingPostalCode" className="block text-sm font-medium text-gray-700">
                          Postal/Zip Code *
                        </label>
                        <input
                          type="text"
                          id="billingPostalCode"
                          name="billingPostalCode"
                          value={formData.billingPostalCode}
                          onChange={handleInputChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="billingCountry" className="block text-sm font-medium text-gray-700">
                        Country *
                      </label>
                      <input
                        type="text"
                        id="billingCountry"
                        name="billingCountry"
                        value={formData.billingCountry}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Credit Card Fields - Only show for paid accounts */}
              {formData.accountType === 'paid' && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h3>
                  
                  {paymentError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{paymentError}</p>
                    </div>
                  )}
                  
                  <StripeProvider>
                    <PaymentForm 
                      ref={paymentFormRef}
                      onPaymentSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      loading={paymentLoading}
                    />
                  </StripeProvider>
                </div>
              )}

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="agreesToTerms"
                  name="agreesToTerms"
                  checked={formData.agreesToTerms}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                />
                <div className="ml-3">
                  <label htmlFor="agreesToTerms" className="text-sm text-gray-700">
                    I agree to Pitchmoto's{' '}
                    <button 
                      type="button"
                      onClick={openTermsModal}
                      className="text-blue-600 hover:text-blue-500 underline"
                    >
                      Terms of Service
                    </button>{' '}
                    and{' '}
                    <button 
                      type="button"
                      onClick={openPrivacyModal}
                      className="text-blue-600 hover:text-blue-500 underline"
                    >
                      Privacy Policy
                    </button>
                    .
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, currentStep: 2 }))}
                className="text-gray-500 hover:text-gray-700 flex items-center"
                disabled={loading}
              >
                ← Previous Step
              </button>
              <button
                type="button"
                onClick={handleCreateAccount}
                disabled={loading}
                className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 flex items-center text-lg font-medium disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  const investmentStages = [
    'Pre-Seed',
    'Seed',
    'Series A',
    'Series B',
    'Series C+',
    'Growth/Late Stage',
    'IPO/Public'
  ]

  const sectorOptions = [
    'Technology',
    'Healthcare',
    'FinTech',
    'E-commerce',
    'SaaS',
    'Biotech',
    'CleanTech',
    'EdTech',
    'FoodTech',
    'Real Estate',
    'Manufacturing',
    'Energy',
    'Consumer Goods',
    'Media & Entertainment',
    'Other'
  ]

  const geographicOptions = [
    'North America',
    'Europe',
    'Asia-Pacific',
    'Latin America',
    'Middle East & Africa',
    'Global'
  ]

  const renderProgressBar = () => {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-blue-600 font-medium">
          Step {formData.currentStep} of {totalSteps}
        </span>
        <div className="flex-1 bg-gray-200 rounded-full h-2 ml-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(formData.currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Custom Header for Investor Signup */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold text-blue-600">
                PitchMoto
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="flex-1 max-w-md mx-8">
              {renderProgressBar()}
            </div>
            
            {/* Right spacer to center the progress bar */}
            <div className="flex-shrink-0 w-24">
              {/* Empty space to balance the logo */}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto pt-24 pb-8 px-4">
        {renderStep()}
      </main>

      {/* Modal for Terms of Service and Privacy Policy */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={modalContent === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
      >
        {modalContent === 'terms' ? <TermsOfServiceContent /> : <PrivacyPolicyContent />}
      </Modal>
    </div>
  )
}
