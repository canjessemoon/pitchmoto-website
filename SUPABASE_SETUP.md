# Supabase Integration Setup Guide

## Step 1: Create Supabase Project

### 1.1 Sign Up and Create Project
1. **Go to [Supabase](https://supabase.com)**
2. **Sign up** with GitHub or email
3. **Create New Project**:
   - Project Name: `PitchMoto MVP`
   - Database Password: (create a strong password - save it!)
   - Region: Choose closest to your users

### 1.2 Wait for Project Setup
- Takes ~2 minutes to provision PostgreSQL database
- You'll get a project dashboard with your credentials

## Step 2: Configure Database Schema

### 2.1 Run Database Schema
1. **Go to SQL Editor** in Supabase dashboard
2. **Create new query**
3. **Copy and paste** the entire content from `supabase/schema-clean.sql` (use this file, not schema.sql)
4. **Run the query** - this creates all tables, policies, and functions

### 2.2 Verify Tables Created
Check in **Table Editor** that these tables exist:
- profiles
- startups  
- pitches
- upvotes
- comments
- watchlists
- messages
- subscriptions

## Step 3: Configure Authentication

### 3.1 Enable Auth Providers
Go to **Authentication > Providers**:

#### Email (Already enabled by default)
- ✅ **Email OTP**: Enabled
- ✅ **Email confirmations**: Enabled

#### Google OAuth
1. **Enable Google provider**
2. **Create Google OAuth App**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
3. **Configure in Supabase**:
   - Client ID: `your_google_client_id`
   - Client Secret: `your_google_client_secret`

#### LinkedIn OAuth  
1. **Enable LinkedIn provider**
2. **Create LinkedIn App**:
   - Go to [LinkedIn Developers](https://developer.linkedin.com)
   - Create new app
   - Request OAuth 2.0 permissions
3. **Configure in Supabase**:
   - Client ID: `your_linkedin_client_id`
   - Client Secret: `your_linkedin_client_secret`

### 3.2 Set Redirect URLs
Go to **Authentication > URL Configuration**:

#### Site URL (Production)
```
https://your-vercel-app.vercel.app
```

#### Redirect URLs
```
http://localhost:3000/auth/callback
https://your-vercel-app.vercel.app/auth/callback
```

## Step 4: Get Your Credentials

### 4.1 Project Credentials
Go to **Settings > API**:

#### Required Environment Variables:
```bash
# Project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co

# Anonymous (public) key  
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service role key (private - for server operations)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4.2 Update Environment Files

#### Local Development (`.env.local`):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

#### Vercel Production:
Add the same variables in Vercel dashboard under Settings > Environment Variables

## Step 5: Test Connection

### 5.1 Start Development Server
```bash
npm run dev
```

### 5.2 Test Authentication Flow
1. **Go to** `http://localhost:3000`
2. **Click "Sign up"**
3. **Try creating an account**:
   - Use a real email address
   - Check your email for confirmation
   - Complete the signup process
4. **Verify in Supabase**:
   - Go to Authentication > Users
   - You should see your test user

### 5.3 Test Database Integration
1. **Sign up as founder**
2. **Check profiles table** in Supabase
3. **Verify user data** is properly stored

## Step 6: OAuth Testing (Optional)

### 6.1 Test Google OAuth
1. **Configure Google OAuth** (see Step 3.1)
2. **Add Google sign-in button** to auth pages
3. **Test sign-in flow**

### 6.2 Test LinkedIn OAuth  
1. **Configure LinkedIn OAuth** (see Step 3.1)
2. **Add LinkedIn sign-in button** to auth pages
3. **Test sign-in flow**

## Step 7: Production Deployment

### 7.1 Update Vercel Environment Variables
1. **Go to Vercel dashboard**
2. **Add Supabase credentials** to environment variables
3. **Redeploy** if necessary

### 7.2 Update Supabase URLs
1. **Add production URL** to Supabase redirect URLs
2. **Test auth flow** on production deployment

## Troubleshooting

### Common Issues:

#### "Invalid API Key"
- ✅ Check environment variables are correct
- ✅ Restart development server
- ✅ Verify `.env.local` is in correct directory

#### "Auth flow not working"
- ✅ Check redirect URLs are correct
- ✅ Verify site URL is set properly
- ✅ Check browser console for errors

#### "Database connection failed"
- ✅ Verify schema was run successfully
- ✅ Check RLS policies are enabled
- ✅ Ensure user has proper permissions

#### "OAuth provider errors"
- ✅ Verify OAuth app configuration
- ✅ Check client ID/secret are correct
- ✅ Ensure redirect URLs match exactly

## Next Steps After Setup

1. ✅ **Test all auth flows** (email, Google, LinkedIn)
2. ✅ **Verify database operations** work
3. ✅ **Test role-based access** (founder vs investor)
4. ✅ **Deploy to production** with proper environment variables
5. ✅ **Monitor usage** in Supabase dashboard

---

**Ready for Integration**: Once completed, your app will have full Supabase authentication and database integration!
