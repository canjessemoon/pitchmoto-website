# Supabase Authentication Configuration Fix

## The Issue
"Failed to fetch" error typically means:
1. Auth redirect URLs aren't configured in Supabase
2. CORS issues with localhost
3. Missing auth configuration

## Quick Fix - Configure Auth URLs in Supabase

### Step 1: Go to Supabase Dashboard
1. Open your Supabase project dashboard
2. Go to **Authentication > URL Configuration**

### Step 2: Set Site URL
Set your **Site URL** to:
```
http://localhost:3000
```

### Step 3: Add Redirect URLs
Add these **Redirect URLs** (one per line):
```
http://localhost:3000
http://localhost:3000/auth/callback
http://localhost:3000/**
```

### Step 4: Additional Redirect URLs (if needed)
Also add these for broader compatibility:
```
http://localhost:3000/auth/signin
http://localhost:3000/auth/signup
http://localhost:3000/dashboard
```

### Step 5: Save Configuration
Click **Save** to apply changes.

### Step 6: Test Again
1. Restart your development server: `npm run dev`
2. Visit `http://localhost:3000/test-connection`
3. Try the test signup again

## Alternative: Check Network Tab
1. Open browser Dev Tools (F12)
2. Go to **Network** tab
3. Try signup again
4. Look for failed requests to see the exact error

## Common Issues & Solutions

### If you see "Invalid redirect URL":
- Make sure `http://localhost:3000` is in redirect URLs
- Check for typos in the URLs
- Ensure no trailing slashes

### If you see CORS errors:
- Add `http://localhost:3000/**` to redirect URLs
- Make sure Site URL is set correctly

### If still failing:
- Check Supabase project is active (not paused)
- Verify your API key is correct
- Try using a different browser/incognito mode

---

**Try the URL configuration fix first - this resolves 90% of "Failed to fetch" auth errors!**
