# Comprehensive Supabase Auth Debug & Fix

## Current Error Analysis
The "Failed to fetch" error in your console specifically points to the Supabase auth client (`SupabaseAuthClient.signUp`) failing to reach the Supabase server. This is almost certainly a configuration issue.

## Debugging Steps

### Step 1: Verify Your Supabase Project Status
1. Go to https://supabase.com/dashboard
2. Find your project: `mksktpujwwrvndineencl`
3. **Check if the project is PAUSED** - this is a common cause!
4. If paused, click "Resume project"

### Step 2: Configure Authentication URLs (CRITICAL)
1. In your Supabase dashboard, go to **Authentication > URL Configuration**
2. Set these EXACT values:

**Site URL:**
```
http://localhost:3000
```

**Redirect URLs:** (Add each on a new line)
```
http://localhost:3000
http://localhost:3000/**
http://localhost:3000/auth/callback
http://localhost:3000/auth/signin
http://localhost:3000/auth/signup
http://localhost:3000/dashboard
```

### Step 3: Enable Email Authentication
1. Go to **Authentication > Providers**
2. Make sure **Email** is enabled
3. **Disable email confirmations for testing:**
   - Set "Enable email confirmations" to **OFF** (for now)
   - This eliminates email delivery as a variable

### Step 4: Test Network Connectivity
Open your browser's Developer Tools and try this test:

```javascript
// Paste this in your browser console on localhost:3000
fetch('https://mksktpujwwrvndineencl.supabase.co/rest/v1/', {
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rc2t0cHVqd3dydm5kaW5lbmNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NjMzMjMsImV4cCI6MjA2OTAzOTMyM30.okCoLx5Zx8kKp6GB83RQxyWuXy1ug5k1u9WX-_gJ7CI'
  }
})
.then(r => console.log('✅ Basic connectivity works:', r.status))
.catch(e => console.error('❌ Network issue:', e))
```

### Step 5: Test Auth Endpoint Specifically
```javascript
// Test the auth endpoint directly
fetch('https://mksktpujwwrvndineencl.supabase.co/auth/v1/signup', {
  method: 'POST',
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rc2t0cHVqd3dydm5kaW5lbmNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NjMzMjMsImV4cCI6MjA2OTAzOTMyM30.okCoLx5Zx8kKp6GB83RQxyWuXy1ug5k1u9WX-_gJ7CI',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'testpassword123'
  })
})
.then(r => r.json())
.then(data => console.log('Auth test result:', data))
.catch(e => console.error('Auth test failed:', e))
```

## Quick Fix Implementation

### Option A: Minimal Test (No Email Confirmation)
1. **Disable email confirmations** in Supabase Auth settings
2. **Add localhost URLs** to redirect URLs
3. **Resume project** if paused
4. Test signup again

### Option B: Alternative Auth Test
Create a simpler test without our auth helpers:

```typescript
// Add this to your test-connection page
const directSupabaseTest = async () => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpass123'
    })
    console.log('Direct Supabase test:', { data, error })
  } catch (err) {
    console.error('Direct test failed:', err)
  }
}
```

## Common Solutions by Error Type

### If you see "Invalid API key":
- Check your `.env.local` file has the correct anon key
- Restart your dev server: `npm run dev`

### If you see "Project paused":
- Resume your project in the Supabase dashboard
- Free tier projects auto-pause after inactivity

### If you see "CORS error":
- Add `http://localhost:3000/**` to redirect URLs
- Make sure Site URL is exactly `http://localhost:3000`

### If you see "Invalid redirect URL":
- Double-check spelling of URLs in Supabase settings
- No trailing slashes in URLs
- Use `http://` not `https://` for localhost

## Next Steps After Fix
1. ✅ Get basic auth working
2. ✅ Test email confirmations (re-enable them)
3. ✅ Set up OAuth providers (Google, LinkedIn)
4. ✅ Test complete signup flow

---
**Priority: Check if your Supabase project is paused - this causes "Failed to fetch" 90% of the time!**
