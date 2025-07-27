# PitchMoto - Complete Platform

A comprehensive platform where startups meet investors any day of the year, bypassing traditional demo days and pitch events.

## Project Overview

This repository contains both the marketing website and the MVP application for PitchMoto:

- **Marketing Website**: Static HTML landing page (`./` root directory)
- **MVP Application**: Full-stack Next.js application (`./Pitchmoto-mvp/` directory)

## About PitchMoto

PitchMoto is a platform that connects startups with investors through an always-on pitch discovery system. Founders can upload their pitches, and investors can discover, upvote, and connect with promising startups anytime, anywhere.

### For Founders
- Upload pitches, share vision, get noticed by investors - always free
- Create comprehensive startup profiles
- Receive direct messages from interested investors

### For Investors  
- Discover trending startups beyond traditional Demo Days
- Upvote favorites and build watchlists
- Connect directly with founders
- Premium features for enhanced discovery

## Repository Structure

```
pitchmoto-website/
├── index.html              # Marketing website
├── styles.css              # Website styles
├── script.js               # Website functionality
├── faq.html               # FAQ page
├── for-founders.html      # Founders page
├── for-investors.html     # Investors page
├── how-it-works.html      # How it works page
└── Pitchmoto-mvp/         # MVP Application
    ├── src/
    │   ├── app/           # Next.js App Router
    │   ├── components/    # React components
    │   ├── lib/           # Utilities and integrations
    │   └── types/         # TypeScript definitions
    ├── supabase/          # Database schema
    └── package.json       # Dependencies
```

## MVP Application Features

### ✅ Completed
- **Authentication System**: Role-based access (founder/investor)
- **Startup Creation**: Multi-step startup profile creation
- **Pitch Creation**: Comprehensive pitch submission with video/file upload
- **Profile Management**: User profile editing and management  
- **Database Integration**: Supabase PostgreSQL with RLS
- **File Storage**: Supabase storage for logos, decks, videos
- **API Routes**: Complete backend with service role authentication
- **Responsive Design**: Mobile-first responsive design system

### 🔄 In Progress
- **Pitch Browsing**: Investor pitch discovery system
- **Messaging System**: Direct communication between users

### 📅 Planned
- **Watchlist**: Investor startup tracking
- **Payment Integration**: Stripe subscription system
- **Admin Panel**: Admin user management system

## Technology Stack

### Marketing Website
- HTML5, CSS3, Vanilla JavaScript
- Responsive design with CSS Grid and Flexbox
- Google Fonts (Inter)

### MVP Application
- **Frontend**: Next.js 15, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, Supabase PostgreSQL
- **Authentication**: Supabase Auth with OAuth
- **File Storage**: Supabase Storage
- **Payments**: Stripe (planned)
- **Deployment**: Vercel

## Getting Started

### Marketing Website
1. Open `index.html` in your web browser
2. The website is ready to use!

### MVP Application

1. **Navigate to MVP directory**
   ```bash
   cd Pitchmoto-mvp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase credentials

4. **Set up Supabase database**
   - Create a new Supabase project
   - Run the SQL schema from `supabase/schema.sql`
   - Update `.env.local` with your credentials

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   Navigate to `http://localhost:3000`

## Database Schema

The MVP uses 8 main tables:
- **profiles**: User profiles extending Supabase auth
- **startups**: Startup company information  
- **pitches**: Startup pitches (text, video, slides)
- **upvotes**: User pitch voting system
- **comments**: Pitch commenting system
- **watchlists**: Investor startup tracking
- **messages**: Direct messaging between users
- **subscriptions**: Stripe subscription management

## Development Status

**Current Version**: 0.2.0 (MVP with founder workflows)  
**Last Updated**: January 2025  
**Status**: Active Development

### Recent Updates
- Complete founder workflow (startup + pitch creation)
- Multi-step forms with validation
- File upload system with storage integration
- API routes with proper authentication
- Database RLS policies and security

## Contact

For questions about PitchMoto, please reach out to jdmoon@gmail.com

## License

© 2025 PitchMoto. All rights reserved.