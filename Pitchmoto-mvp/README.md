# PitchMoto MVP Application

## Overview
PitchMoto is a platform where startups meet investors any day of the year, bypassing traditional demo days and pitch events. This is the MVP (Minimum Viable Product) implementation built with Next.js 15.

## Features Implemented

### ✅ Completed
- **Project Foundation**: Next.js 15 with TypeScript, TailwindCSS
- **Database Schema**: Complete PostgreSQL schema with Supabase integration
- **Authentication System**: User signup/signin with role-based access (founder/investor)  
- **Landing Page**: Marketing page with email signup functionality
- **User Dashboard**: Role-specific dashboard for founders and investors
- **Form Validation**: Comprehensive form validation with Zod
- **Responsive Design**: Mobile-first responsive design system

### 🔄 In Progress
- **Database Integration**: Supabase client setup (requires environment variables)
- **User Profiles**: Profile management system
- **Pitch Creation**: Startup pitch submission system

### 📅 Planned
- **Pitch Browsing**: Investor pitch discovery system
- **Messaging System**: Direct communication between users
- **Watchlist**: Investor startup tracking
- **Payment Integration**: Stripe subscription system
- **File Uploads**: Pitch deck and logo upload system
- **Admin Panel**: Admin user management system

## Technology Stack

- **Frontend**: Next.js 15, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **File Storage**: Supabase Storage
- **Deployment**: Vercel (planned)

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   │   ├── signin/        # Sign in page
│   │   └── signup/        # Sign up page
│   ├── (dashboard)/       # Protected dashboard routes
│   │   └── dashboard/     # Main dashboard
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Home page
├── components/
│   ├── app/              # Application components
│   ├── marketing/        # Marketing/landing page components
│   ├── ui/               # Reusable UI components
│   └── providers.tsx     # React context providers
├── lib/
│   ├── auth.ts           # Authentication utilities
│   ├── stripe.ts         # Stripe integration
│   ├── supabase.ts       # Supabase client
│   ├── utils.ts          # General utilities
│   └── validations.ts    # Form validation schemas
└── types/
    └── database.ts       # Database type definitions
```

## Database Schema

The application uses 8 main tables:
- **profiles**: User profiles extending Supabase auth
- **startups**: Startup company information
- **pitches**: Startup pitches (text, video, slides)
- **upvotes**: User pitch voting system
- **comments**: Pitch commenting system
- **watchlists**: Investor startup tracking
- **messages**: Direct messaging between users
- **subscriptions**: Stripe subscription management

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (for database)
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/canjessemoon/pitchmoto-website.git
   cd pitchmoto-website/Pitchmoto-mvp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Copy `.env.example` to `.env.local` and fill in your credentials:
   ```bash
   cp .env.example .env.local
   ```

4. **Set up Supabase database**
   - Create a new Supabase project
   - Run the SQL schema from `supabase/schema.sql`
   - Update `.env.local` with your Supabase credentials

5. **Set up Stripe (optional for basic functionality)**
   - Create Stripe products and prices
   - Update `.env.local` with your Stripe keys

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Open the application**
   Navigate to `http://localhost:3000`

## Current Status

The MVP is in active development with core authentication and UI components implemented. The database schema is complete and ready for integration. Next steps involve:

1. **Supabase Integration**: Connect to live database
2. **Pitch System**: Build startup pitch creation and browsing
3. **Messaging**: Implement user-to-user communication
4. **Payment System**: Integrate Stripe subscriptions
5. **File Uploads**: Add pitch deck and image uploads

## User Flow

### For Founders
1. Sign up as a founder
2. Create startup profile
3. Post pitches (text, video, or slides)
4. Receive messages from interested investors
5. Manage startup information and pitches

### For Investors  
1. Sign up as an investor
2. Browse startup pitches
3. Upvote interesting pitches
4. Add startups to watchlist
5. Message founders directly
6. Subscribe for premium features

## Email Integration

The landing page includes email signup functionality that sends notifications to `jdmoon@gmail.com` via mailto links, matching the static website implementation.

## Development Notes

- Uses Next.js App Router with TypeScript
- Implements proper error handling and form validation
- Follows React best practices with hooks and context
- Uses TailwindCSS for consistent styling
- Implements proper authentication state management
- Database schema includes Row Level Security (RLS) policies

## Related Projects

This MVP works alongside the static marketing website located in the parent directory (`../`), providing a complete solution from marketing to application functionality.

## Contributing

This is a private project for PitchMoto. For questions or issues, contact the development team.

---

**Last Updated**: January 2025  
**Version**: 0.1.0 (MVP)  
**Status**: Active Development
