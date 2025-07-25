# OAuth Setup Guide - Google & LinkedIn

## Step 1: Configure Supabase Redirect URLs

### Go to Supabase Dashboard
1. Visit https://supabase.com/dashboard
2. Select your project: `mksktpujwwrvndinencl`
3. Go to **Authentication > URL Configuration**

### Set Site URL
```
http://localhost:3000
```

### Add Redirect URLs (one per line)
```
http://localhost:3000
http://localhost:3000/callback
http://localhost:3000/auth/callback
http://localhost:3000/**
```

### For Production (add these later)
```
https://yourdomain.com
https://yourdomain.com/callback
https://yourdomain.com/**
```

---

## Step 2: Set Up Google OAuth

### A. Create Google OAuth App
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth 2.0 Client IDs**

### B. Configure OAuth Client
- **Application type**: Web application
- **Name**: PitchMoto MVP
- **Authorized JavaScript origins**:
  ```
  http://localhost:3000
  https://mksktpujwwrvndinencl.supabase.co
  ```
- **Authorized redirect URIs**:
  ```
  https://mksktpujwwrvndinencl.supabase.co/auth/v1/callback
  ```

### C. Get Client ID & Secret
- Copy the **Client ID** and **Client Secret**

### D. Configure in Supabase
1. In Supabase dashboard, go to **Authentication > Providers**
2. Find **Google** and click **Configure**
3. Enable **Google enabled**
4. Enter your **Client ID** and **Client Secret**
5. Click **Save**

---

## Step 3: Set Up LinkedIn OAuth

### A. Create LinkedIn App
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Click **Create app**
3. Fill in app details:
   - **App name**: PitchMoto MVP
   - **LinkedIn Page**: Your company page (or create one)
   - **Privacy policy URL**: http://localhost:3000/privacy (temporary)
   - **App logo**: Upload a logo

### B. Configure OAuth Settings
1. Go to **Auth** tab in your LinkedIn app
2. Add **Authorized redirect URLs**:
   ```
   https://mksktpujwwrvndinencl.supabase.co/auth/v1/callback
   ```

### C. Get Client ID & Secret
- Copy the **Client ID** and **Client Secret** from the Auth tab

### D. Configure in Supabase
1. In Supabase dashboard, go to **Authentication > Providers**
2. Find **LinkedIn** and click **Configure** 
3. Enable **LinkedIn enabled**
4. Enter your **Client ID** and **Client Secret**
5. Click **Save**

---

## Step 4: Test OAuth Integration

After configuration, test the OAuth buttons on:
- http://localhost:3000/signin
- http://localhost:3000/signup

---

## Important Notes

- **Google**: Usually works immediately after setup
- **LinkedIn**: May require app review for production use
- **Redirect URLs**: Must match exactly (including https/http)
- **Development**: Use http://localhost:3000 for local testing
- **Production**: Update URLs when deploying

---

**Start with Step 1 (Supabase URLs), then we'll tackle Google and LinkedIn one by one!**
