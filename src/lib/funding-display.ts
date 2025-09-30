/**
 * Utility functions for displaying funding information
 */

export function formatFundingAmount(amount: number, isNotRaising: boolean = false): string {
  if (isNotRaising || amount === 0) {
    return 'Not raising funding at this time'
  }
  
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`
  } else {
    return `$${amount.toLocaleString()}`
  }
}

export function getFundingDisplayClass(isNotRaising: boolean): string {
  return isNotRaising 
    ? 'text-gray-600 bg-gray-100 px-2 py-1 rounded text-sm'
    : 'text-green-600 font-semibold'
}

export function getFundingDisplayBadge(amount: number, isNotRaising: boolean = false): {
  text: string
  className: string
} {
  if (isNotRaising || amount === 0) {
    return {
      text: 'Not fundraising',
      className: 'bg-gray-100 text-gray-700'
    }
  }
  
  return {
    text: formatFundingAmount(amount, false),
    className: 'bg-green-100 text-green-700'
  }
}