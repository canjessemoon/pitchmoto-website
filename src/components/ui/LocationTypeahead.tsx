'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, MapPin, X } from 'lucide-react'

interface LocationTypeaheadProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

// Comprehensive list of major cities and business hubs
const MAJOR_LOCATIONS = [
  // North America
  'New York, NY, USA',
  'Los Angeles, CA, USA',
  'San Francisco, CA, USA',
  'Chicago, IL, USA',
  'Boston, MA, USA',
  'Seattle, WA, USA',
  'Austin, TX, USA',
  'Denver, CO, USA',
  'Miami, FL, USA',
  'Atlanta, GA, USA',
  'Washington, DC, USA',
  'Philadelphia, PA, USA',
  'San Diego, CA, USA',
  'Phoenix, AZ, USA',
  'Dallas, TX, USA',
  'Houston, TX, USA',
  'Portland, OR, USA',
  'Nashville, TN, USA',
  'Toronto, ON, Canada',
  'Vancouver, BC, Canada',
  'Montreal, QC, Canada',
  'Calgary, AB, Canada',
  'Ottawa, ON, Canada',
  'Mexico City, Mexico',
  
  // Europe
  'London, United Kingdom',
  'Berlin, Germany',
  'Paris, France',
  'Amsterdam, Netherlands',
  'Stockholm, Sweden',
  'Copenhagen, Denmark',
  'Oslo, Norway',
  'Helsinki, Finland',
  'Zurich, Switzerland',
  'Geneva, Switzerland',
  'Dublin, Ireland',
  'Edinburgh, United Kingdom',
  'Barcelona, Spain',
  'Madrid, Spain',
  'Milan, Italy',
  'Rome, Italy',
  'Vienna, Austria',
  'Prague, Czech Republic',
  'Warsaw, Poland',
  'Brussels, Belgium',
  'Luxembourg City, Luxembourg',
  'Lisbon, Portugal',
  'Munich, Germany',
  'Frankfurt, Germany',
  'Hamburg, Germany',
  
  // Asia Pacific
  'Singapore',
  'Hong Kong',
  'Tokyo, Japan',
  'Seoul, South Korea',
  'Beijing, China',
  'Shanghai, China',
  'Shenzhen, China',
  'Bangalore, India',
  'Mumbai, India',
  'New Delhi, India',
  'Sydney, Australia',
  'Melbourne, Australia',
  'Brisbane, Australia',
  'Auckland, New Zealand',
  'Bangkok, Thailand',
  'Kuala Lumpur, Malaysia',
  'Jakarta, Indonesia',
  'Manila, Philippines',
  'Tel Aviv, Israel',
  
  // Middle East & Africa
  'Dubai, UAE',
  'Abu Dhabi, UAE',
  'Riyadh, Saudi Arabia',
  'Kuwait City, Kuwait',
  'Doha, Qatar',
  'Cairo, Egypt',
  'Lagos, Nigeria',
  'Cape Town, South Africa',
  'Johannesburg, South Africa',
  'Nairobi, Kenya',
  'Casablanca, Morocco',
  
  // South America
  'São Paulo, Brazil',
  'Rio de Janeiro, Brazil',
  'Buenos Aires, Argentina',
  'Santiago, Chile',
  'Lima, Peru',
  'Bogotá, Colombia',
  'Montevideo, Uruguay',
]

export function LocationTypeahead({ 
  value, 
  onChange, 
  placeholder = "e.g., San Francisco, CA, USA",
  className = "" 
}: LocationTypeaheadProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const [filteredLocations, setFilteredLocations] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Filter locations based on input
  useEffect(() => {
    if (inputValue.length === 0) {
      setFilteredLocations(MAJOR_LOCATIONS.slice(0, 10)) // Show top 10 by default
    } else {
      const filtered = MAJOR_LOCATIONS.filter(location =>
        location.toLowerCase().includes(inputValue.toLowerCase())
      ).slice(0, 10) // Limit to 10 results
      setFilteredLocations(filtered)
    }
  }, [inputValue])

  // Update internal value when prop changes
  useEffect(() => {
    setInputValue(value)
  }, [value])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange(newValue)
    setIsOpen(true)
  }

  const handleLocationSelect = (location: string) => {
    setInputValue(location)
    onChange(location)
    setIsOpen(false)
    inputRef.current?.blur()
  }

  const handleInputFocus = () => {
    setIsOpen(true)
  }

  const handleClear = () => {
    setInputValue('')
    onChange('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#405B53] focus:border-transparent"
        />
        
        {/* Location icon */}
        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        
        {/* Clear button */}
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-8 top-2.5 h-4 w-4 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        
        {/* Dropdown arrow */}
        <ChevronDown 
          className={`absolute right-3 top-2.5 h-4 w-4 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredLocations.length > 0 ? (
            <>
              {filteredLocations.map((location, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleLocationSelect(location)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-900">{location}</span>
                  </div>
                </button>
              ))}
              
              {/* Custom location option */}
              {inputValue && !MAJOR_LOCATIONS.some(loc => 
                loc.toLowerCase() === inputValue.toLowerCase()
              ) && (
                <button
                  type="button"
                  onClick={() => handleLocationSelect(inputValue)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-t border-gray-200"
                >
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-900">
                      Use "<strong>{inputValue}</strong>"
                    </span>
                  </div>
                </button>
              )}
            </>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500">
              No locations found. Type to add a custom location.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
