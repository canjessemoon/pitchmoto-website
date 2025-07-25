# Vercel Deployment Guide

## Quick Setup Steps

### 1. Connect Repository to Vercel

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click "Add New Project"**
3. **Import from GitHub**: Select `canjessemoon/pitchmoto-website`
4. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `Pitchmoto-mvp`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

### 2. Set Environment Variables

In Vercel project settings, add these environment variables:

#### Required for Basic Functionality:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

#### Required for Payments:
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_BASIC_PRICE_ID=your_stripe_basic_price_id
STRIPE_PREMIUM_PRICE_ID=your_stripe_premium_price_id
```

#### Optional:
```bash
NEXTAUTH_URL=https://your-vercel-app.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret
ADMIN_EMAIL=jdmoon@gmail.com
```

### 3. Deploy

1. **Click "Deploy"** - Vercel will build and deploy automatically
2. **Set up Domain** (optional): Add custom domain in project settings
3. **Enable Auto-Deployment**: Already configured - pushes to `main` branch will auto-deploy

## Post-Deployment Setup

### 1. Set up Supabase Database

1. **Create Supabase Project**: [supabase.com](https://supabase.com)
2. **Run Database Schema**: Copy/paste `supabase/schema.sql` in Supabase SQL editor
3. **Get Credentials**: Copy URL and anon key from Supabase settings
4. **Update Vercel Environment Variables**: Add Supabase credentials

### 2. Configure Stripe (Optional)

1. **Create Stripe Account**: [stripe.com](https://stripe.com)
2. **Create Products**: Set up Basic ($29/month) and Premium ($99/month) plans
3. **Get API Keys**: Copy publishable and secret keys
4. **Update Vercel Environment Variables**: Add Stripe credentials

### 3. Test Deployment

1. **Visit Deployed URL**: Check landing page loads
2. **Test Authentication**: Try signup/signin flows
3. **Check Dashboard**: Verify role-based access works
4. **Test Email Signup**: Confirm mailto functionality works

## Deployment Structure

```
Vercel Project Root: Pitchmoto-mvp/
├── src/app/           # Next.js App Router pages
├── src/components/    # React components
├── src/lib/          # Utilities and integrations
├── public/           # Static assets
├── vercel.json       # Vercel configuration
└── package.json      # Dependencies
```

## Automatic Deployments

- **Production**: Pushes to `main` branch auto-deploy to production URL
- **Preview**: Pull requests create preview deployments
- **Branch Deploys**: Other branches can be configured for staging

## Environment Management

- **Production**: Set in Vercel dashboard under Settings > Environment Variables
- **Preview**: Same variables used for preview deployments
- **Development**: Use local `.env.local` file (already configured)

## Custom Domain Setup (Optional)

1. **Add Domain**: In Vercel project settings > Domains
2. **Configure DNS**: Point domain to Vercel (instructions provided)
3. **SSL Certificate**: Automatically provisioned by Vercel

## Monitoring & Analytics

- **Vercel Analytics**: Available in project dashboard
- **Function Logs**: Real-time logs for API routes
- **Performance Metrics**: Core Web Vitals tracking

## Next Steps After Deployment

1. **Test all functionality** with live database
2. **Set up monitoring** and error tracking
3. **Configure custom domain** if desired
4. **Enable Vercel Analytics** for usage insights
5. **Set up staging environment** for testing

---

**Ready to Deploy**: The repository is configured and ready for Vercel deployment!
