'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signUp, updateProfile } from '@/lib/auth'

interface FounderSignupData {
  // Step 1 - Personal Information
  firstName: string
  lastName: string
  position: string
  linkedInProfile: string
  // Step 2 - Company Information
  companyName: string
  companyAddress: string
  companyAddress2: string
  companyCity: string
  companyState: string
  companyPostalCode: string
  companyCountry: string
  companyTagline: string
  sector: string
  stage: string
  logo: File | null
  websiteLinks: string
  socialMediaLinks: string[]
  // Step 3 - Materials and Fundraising
  pitchDeck: File | null
  pitchDeckLink: string
  videoPitch: File | null
  videoPitchLink: string
  otherMaterials: File[]
  fundraisingTarget: string
  // Step 4 - Account Creation
  email: string
  password: string
  agreesToTerms: boolean
  // Navigation
  currentStep: number
}

export default function FounderSignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<FounderSignupData>({
    firstName: '',
    lastName: '',
    position: '',
    linkedInProfile: '',
    companyName: '',
    companyAddress: '',
    companyAddress2: '',
    companyCity: '',
    companyState: '',
    companyPostalCode: '',
    companyCountry: '',
    companyTagline: '',
    sector: '',
    stage: '',
    logo: null,
    websiteLinks: '',
    socialMediaLinks: [''],
    pitchDeck: null,
    pitchDeckLink: '',
    videoPitch: null,
    videoPitchLink: '',
    otherMaterials: [],
    fundraisingTarget: '',
    email: '',
    password: '',
    agreesToTerms: false,
    currentStep: 1
  })

  const totalSteps = 4

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData(prev => ({ ...prev, logo: file }))
  }

  const handleLogoRemove = () => {
    setFormData(prev => ({ ...prev, logo: null }))
    // Clear the file input
    const fileInput = document.getElementById('logo') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const handlePitchDeckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData(prev => ({ ...prev, pitchDeck: file }))
  }

  const handleVideoPitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData(prev => ({ ...prev, videoPitch: file }))
  }

  const handleOtherMaterialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData(prev => ({ ...prev, otherMaterials: files }))
  }

  const handlePitchDeckRemove = () => {
    setFormData(prev => ({ ...prev, pitchDeck: null }))
    const fileInput = document.getElementById('pitchDeck') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const handleVideoPitchRemove = () => {
    setFormData(prev => ({ ...prev, videoPitch: null }))
    const fileInput = document.getElementById('videoPitch') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const handleOtherMaterialsRemove = () => {
    setFormData(prev => ({ ...prev, otherMaterials: [] }))
    const fileInput = document.getElementById('otherMaterials') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const handleSocialMediaChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialMediaLinks: prev.socialMediaLinks.map((link, i) => i === index ? value : link)
    }))
  }

  const addSocialMediaLink = () => {
    if (formData.socialMediaLinks.length < 5) {
      setFormData(prev => ({
        ...prev,
        socialMediaLinks: [...prev.socialMediaLinks, '']
      }))
    }
  }

  const removeSocialMediaLink = (index: number) => {
    if (formData.socialMediaLinks.length > 1) {
      setFormData(prev => ({
        ...prev,
        socialMediaLinks: prev.socialMediaLinks.filter((_, i) => i !== index)
      }))
    }
  }

  const handleStep1Continue = () => {
    // Basic validation for Step 1
    if (!formData.firstName || !formData.lastName || !formData.position) {
      alert('Please fill in all required fields')
      return
    }
    setFormData(prev => ({ ...prev, currentStep: 2 }))
  }

  const handleStep2Continue = () => {
    // Basic validation for Step 2
    if (!formData.companyName || !formData.companyAddress || !formData.companyCity || 
        !formData.companyState || !formData.companyPostalCode || !formData.companyCountry || !formData.sector || !formData.stage) {
      alert('Please fill in all required fields')
      return
    }
    setFormData(prev => ({ ...prev, currentStep: 3 }))
  }

  const handleStep3Continue = () => {
    // Basic validation for Step 3 (fundraising target is required)
    if (!formData.fundraisingTarget) {
      alert('Please specify your fundraising target')
      return
    }
    setFormData(prev => ({ ...prev, currentStep: 4 }))
  }

  const handleCreateAccount = async () => {
    // Basic validation for Step 4
    if (!formData.email || !formData.password) {
      alert('Please fill in both email and password')
      return
    }

    if (formData.password.length < 8) {
      alert('Password must be at least 8 characters long')
      return
    }

    if (!formData.agreesToTerms) {
      alert('Please agree to the Terms of Service and Privacy Policy')
      return
    }

    setLoading(true)

    try {
      // Create account using mock auth
      const { data, error } = await signUp(
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
        await updateProfile(data.user.id, {
          user_type: 'founder',
          full_name: `${formData.firstName} ${formData.lastName}`,
          // Add other profile data as needed
        })
        
        // Add a small delay to ensure auth state is updated
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Redirect to dashboard
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Account creation error:', error)
      alert('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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

  const renderStep = () => {
    switch (formData.currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">First, tell us about yourself:</h2>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow space-y-6">
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your first name"
                />
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your last name"
                />
              </div>

              {/* Position */}
              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                  Position *
                </label>
                <select
                  id="position"
                  name="position"
                  required
                  value={formData.position}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select your position</option>
                  <option value="founder">Founder/Co-Founder</option>
                  <option value="executive">Executive/President (CEO, COO, CIO, President, etc.)</option>
                  <option value="vp">Vice President</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* LinkedIn Profile */}
              <div>
                <label htmlFor="linkedInProfile" className="block text-sm font-medium text-gray-700">
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  id="linkedInProfile"
                  name="linkedInProfile"
                  value={formData.linkedInProfile}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
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
              <h2 className="text-3xl font-bold text-gray-900">Next, tell us about your organization:</h2>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow space-y-6">
              {/* Company Name */}
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                  Company Name *
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  required
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your company name"
                />
              </div>

              {/* Company Address */}
              <div>
                <label htmlFor="companyAddress" className="block text-sm font-medium text-gray-700">
                  Company Address *
                </label>
                <input
                  type="text"
                  id="companyAddress"
                  name="companyAddress"
                  required
                  value={formData.companyAddress}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter street address"
                />
              </div>

              {/* Company Address 2 */}
              <div>
                <label htmlFor="companyAddress2" className="block text-sm font-medium text-gray-700">
                  Company Address 2
                </label>
                <input
                  type="text"
                  id="companyAddress2"
                  name="companyAddress2"
                  value={formData.companyAddress2}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Apartment, suite, unit, building, floor, etc. (optional)"
                />
              </div>

              {/* City, Province/State, Postal/Zip Code */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="companyCity" className="block text-sm font-medium text-gray-700">
                    City *
                  </label>
                  <input
                    type="text"
                    id="companyCity"
                    name="companyCity"
                    required
                    value={formData.companyCity}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter city"
                  />
                </div>
                
                <div>
                  <label htmlFor="companyState" className="block text-sm font-medium text-gray-700">
                    Province/State *
                  </label>
                  <select
                    id="companyState"
                    name="companyState"
                    value={formData.companyState}
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
                      <option value="Not Applicable">Not Applicable</option>
                    </optgroup>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="companyPostalCode" className="block text-sm font-medium text-gray-700">
                    Postal/Zip Code *
                  </label>
                  <input
                    type="text"
                    id="companyPostalCode"
                    name="companyPostalCode"
                    value={formData.companyPostalCode}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter postal/zip code"
                    required
                  />
                </div>
              </div>

              {/* Country */}
              <div>
                <label htmlFor="companyCountry" className="block text-sm font-medium text-gray-700">
                  Country *
                </label>
                <select
                  id="companyCountry"
                  name="companyCountry"
                  required
                  value={formData.companyCountry}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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

              {/* Company Tagline */}
              <div>
                <label htmlFor="companyTagline" className="block text-sm font-medium text-gray-700">
                  Company Tagline
                </label>
                <input
                  type="text"
                  id="companyTagline"
                  name="companyTagline"
                  value={formData.companyTagline}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="A brief description of what you do"
                />
              </div>

              {/* Sector */}
              <div>
                <label htmlFor="sector" className="block text-sm font-medium text-gray-700">
                  Sector *
                </label>
                <select
                  id="sector"
                  name="sector"
                  required
                  value={formData.sector}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select your sector</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Financial Services">Financial Services</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Education">Education</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Energy">Energy</option>
                  <option value="Consumer Goods">Consumer Goods</option>
                  <option value="Media & Entertainment">Media & Entertainment</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Agriculture">Agriculture</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Stage */}
              <div>
                <label htmlFor="stage" className="block text-sm font-medium text-gray-700">
                  Stage *
                </label>
                <select
                  id="stage"
                  name="stage"
                  required
                  value={formData.stage}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select your stage</option>
                  <option value="idea">Idea Stage</option>
                  <option value="prototype">Prototype</option>
                  <option value="mvp">MVP</option>
                  <option value="early-revenue">Early Revenue</option>
                  <option value="growth">Growth Stage</option>
                  <option value="scale">Scale Stage</option>
                </select>
              </div>

              {/* Logo */}
              <div>
                <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
                  Company Logo
                </label>
                <div className="mt-1 flex items-start space-x-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      id="logo"
                      name="logo"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="logo"
                      className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"
                    >
                      <svg 
                        className="w-4 h-4 mr-2" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" 
                        />
                      </svg>
                      Choose Image File
                    </label>
                  </div>
                  
                  {/* Logo Preview */}
                  {formData.logo && (
                    <div className="flex-shrink-0">
                      <div className="relative w-20 h-20 border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50 group">
                        <img
                          src={URL.createObjectURL(formData.logo)}
                          alt="Logo preview"
                          className="w-full h-full object-cover"
                        />
                        {/* Hover overlay with delete button */}
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={handleLogoRemove}
                            className="text-white hover:text-red-300 transition-colors"
                            title="Remove logo"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-center text-gray-500">Preview</p>
                    </div>
                  )}
                </div>
                {formData.logo && (
                  <p className="mt-2 text-sm text-green-600">✓ Selected: {formData.logo.name}</p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  Upload your company logo (JPEG, PNG, GIF, WebP). Maximum size: 5MB. Recommended: Square format, at least 200x200px.
                </p>
              </div>

              {/* Website Links */}
              <div>
                <label htmlFor="websiteLinks" className="block text-sm font-medium text-gray-700">
                  Company Website
                </label>
                <input
                  type="url"
                  id="websiteLinks"
                  name="websiteLinks"
                  value={formData.websiteLinks}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="https://yourcompany.com"
                />
              </div>

              {/* Social Media Links */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Social Media Links
                </label>
                <div className="space-y-3">
                  {formData.socialMediaLinks.map((link, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="url"
                        value={link}
                        onChange={(e) => handleSocialMediaChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder={index === 0 ? "https://twitter.com/yourcompany" : "https://instagram.com/yourcompany"}
                      />
                      {formData.socialMediaLinks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSocialMediaLink(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Remove this social media link"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {formData.socialMediaLinks.length < 5 && (
                    <button
                      type="button"
                      onClick={addSocialMediaLink}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Another Social Media Link
                    </button>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Add links to your company's social media profiles (Twitter, LinkedIn, Instagram, etc.)
                </p>
              </div>
            </div>

            <div className="flex justify-between">
              <button 
                onClick={() => setFormData(prev => ({ ...prev, currentStep: 1 }))}
                className="text-gray-500 hover:text-gray-700 flex items-center"
              >
                ← Previous Step
              </button>
              <button
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
              <h2 className="text-3xl font-bold text-gray-900">Next, provide some company materials:</h2>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow space-y-6">
              {/* Pitch Deck */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Pitch Deck
                </label>
                
                {/* Upload Option */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Upload a file:</p>
                  <div>
                    <input
                      type="file"
                      id="pitchDeck"
                      name="pitchDeck"
                      accept=".pdf,.ppt,.pptx"
                      onChange={handlePitchDeckChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="pitchDeck"
                      className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"
                    >
                      <svg 
                        className="w-4 h-4 mr-2" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" 
                        />
                      </svg>
                      Choose Pitch Deck File
                    </label>
                  </div>
                  {formData.pitchDeck && (
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-sm text-green-600">✓ Selected: {formData.pitchDeck.name}</p>
                      <button
                        type="button"
                        onClick={handlePitchDeckRemove}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove pitch deck"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Link Option */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Or provide a link:</p>
                  <input
                    type="url"
                    id="pitchDeckLink"
                    name="pitchDeckLink"
                    value={formData.pitchDeckLink}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="https://drive.google.com/your-pitch-deck or https://docsend.com/your-deck"
                  />
                  {formData.pitchDeckLink && (
                    <p className="mt-1 text-sm text-green-600">✓ Link provided</p>
                  )}
                </div>

                <p className="text-xs text-gray-400">
                  Upload your pitch deck (PDF, PPT, PPTX) or provide a link to Google Drive, Dropbox, DocSend, etc. Maximum file size: 25MB. Recommended: 10-15 slides covering problem, solution, market, and financials.
                </p>
              </div>

              {/* Video Pitch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Video Pitch
                </label>
                
                {/* Upload Option */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Upload a file:</p>
                  <div>
                    <input
                      type="file"
                      id="videoPitch"
                      name="videoPitch"
                      accept="video/mp4,video/mov,video/avi,video/quicktime"
                      onChange={handleVideoPitchChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="videoPitch"
                      className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"
                    >
                      <svg 
                        className="w-4 h-4 mr-2" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" 
                        />
                      </svg>
                      Choose Video File
                    </label>
                  </div>
                  {formData.videoPitch && (
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-sm text-green-600">✓ Selected: {formData.videoPitch.name}</p>
                      <button
                        type="button"
                        onClick={handleVideoPitchRemove}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove video pitch"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Link Option */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Or provide a link:</p>
                  <input
                    type="url"
                    id="videoPitchLink"
                    name="videoPitchLink"
                    value={formData.videoPitchLink}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="https://youtube.com/watch?v=... or https://vimeo.com/... or https://drive.google.com/..."
                  />
                  {formData.videoPitchLink && (
                    <p className="mt-1 text-sm text-green-600">✓ Link provided</p>
                  )}
                </div>

                <p className="text-xs text-gray-400">
                  Upload your video pitch (MP4, MOV, AVI) or provide a link to YouTube, Vimeo, Google Drive, etc. Maximum file size: 100MB. Recommended: 2-3 minutes highlighting your key value proposition.
                </p>
              </div>

              {/* Other Materials */}
              <div>
                <label htmlFor="otherMaterials" className="block text-sm font-medium text-gray-700">
                  Other Materials
                </label>
                <div className="mt-1">
                  <input
                    type="file"
                    id="otherMaterials"
                    name="otherMaterials"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,.pdf,.doc,.docx"
                    onChange={handleOtherMaterialsChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="otherMaterials"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"
                  >
                    <svg 
                      className="w-4 h-4 mr-2" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" 
                      />
                    </svg>
                    Choose Files (Multiple)
                  </label>
                </div>
                {formData.otherMaterials.length > 0 && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-green-600">✓ Selected files:</p>
                      <button
                        type="button"
                        onClick={handleOtherMaterialsRemove}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove all materials"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="space-y-1">
                      {formData.otherMaterials.map((file, index) => (
                        <p key={index} className="text-xs text-gray-400">• {file.name}</p>
                      ))}
                    </div>
                  </div>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  Upload additional materials (Images, PDFs, Documents). Maximum size per file: 10MB. Examples: product screenshots, testimonials, market research, team photos.
                </p>
              </div>

              {/* Fundraising Target */}
              <div>
                <label htmlFor="fundraisingTarget" className="block text-sm font-medium text-gray-700">
                  Fundraising Target *
                </label>
                <select
                  id="fundraisingTarget"
                  name="fundraisingTarget"
                  required
                  value={formData.fundraisingTarget}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select fundraising target</option>
                  <option value="pre-seed">Pre-Seed ($10K - $250K)</option>
                  <option value="seed">Seed ($250K - $2M)</option>
                  <option value="series-a">Series A ($2M - $15M)</option>
                  <option value="series-b">Series B ($15M - $50M)</option>
                  <option value="series-c">Series C ($50M+)</option>
                  <option value="not-fundraising">Not currently fundraising</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between">
              <button 
                onClick={() => setFormData(prev => ({ ...prev, currentStep: 2 }))}
                className="text-gray-500 hover:text-gray-700 flex items-center"
              >
                ← Previous Step
              </button>
              <button
                onClick={handleStep3Continue}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 flex items-center"
              >
                Continue →
              </button>
            </div>
          </div>
        )
      
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">Finally, provide an email address and password to create your Pitchmoto account</h2>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow space-y-6">
              {/* Email Address */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your email address"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <div className="mt-1 relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Create a secure password (min 8 characters)"
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

              {/* Terms and Privacy */}
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
                    I agree to PitchMoto's{' '}
                    <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                      Privacy Policy
                    </Link>
                    .
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button 
                onClick={() => setFormData(prev => ({ ...prev, currentStep: 3 }))}
                className="text-gray-500 hover:text-gray-700 flex items-center"
                disabled={loading}
              >
                ← Previous Step
              </button>
              <button
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
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Step {formData.currentStep}</h2>
            <p className="text-gray-600">Coming soon...</p>
            <button
              onClick={() => setFormData(prev => ({ ...prev, currentStep: Math.max(1, prev.currentStep - 1) }))}
              className="mt-4 text-blue-600 hover:text-blue-700"
            >
              ← Previous Step
            </button>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Custom Header for Founder Signup - Fixed Progress Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
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

      {/* Main Content - Add top padding to account for fixed header */}
      <main className="max-w-2xl mx-auto pt-24 pb-8 px-4">
        {renderStep()}
      </main>
    </div>
  )
}
