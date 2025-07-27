// Debug utility to clear auth session
// Run this in browser console if you encounter refresh token errors

function clearAuthSession() {
  console.log('Clearing all Supabase auth data from localStorage...')
  
  // Get all localStorage keys
  const keys = Object.keys(localStorage)
  
  // Remove all supabase-related items
  keys.forEach(key => {
    if (key.includes('supabase') || key.includes('sb-')) {
      console.log('Removing:', key)
      localStorage.removeItem(key)
    }
  })
  
  // Also clear sessionStorage
  const sessionKeys = Object.keys(sessionStorage)
  sessionKeys.forEach(key => {
    if (key.includes('supabase') || key.includes('sb-')) {
      console.log('Removing from session:', key)
      sessionStorage.removeItem(key)
    }
  })
  
  console.log('Auth session cleared. Please refresh the page.')
  
  // Optionally reload the page
  if (confirm('Reload the page now?')) {
    window.location.reload()
  }
}

// Export for console use
window.clearAuthSession = clearAuthSession

console.log('Debug utility loaded. Run clearAuthSession() to clear auth data.')
