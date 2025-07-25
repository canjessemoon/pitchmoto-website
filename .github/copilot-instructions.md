# PitchMoto MVP - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is the PitchMoto MVP - a startup pitch platform where founders can upload pitches and investors can discover, upvote, and connect with startups.

## Technology Stack
- **Frontend**: Next.js 15 with TypeScript and App Router
- **Styling**: TailwindCSS with custom PitchMoto branding
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth with OAuth (Google, LinkedIn)
- **File Storage**: Supabase Storage for pitch decks, videos, images
- **Payments**: Stripe for investor subscriptions
- **Email**: Resend/SendGrid for transactional emails
- **Deployment**: Vercel

## Code Style & Patterns
- Use TypeScript with strict mode
- Prefer functional components with hooks
- Use React Hook Form with Zod validation
- Follow Next.js App Router conventions
- Use Supabase client for database operations
- Implement proper error handling and loading states
- Use Lucide React for icons

## Project Structure
```
src/
├── app/                 # App Router pages
│   ├── (marketing)/     # Marketing pages (landing, about, etc.)
│   ├── app/            # Authenticated app routes
│   ├── api/            # API routes
│   └── globals.css     # Global styles
├── components/         # Reusable components
│   ├── ui/            # Base UI components
│   ├── marketing/     # Marketing-specific components
│   └── app/           # App-specific components
├── lib/               # Utilities and configurations
│   ├── supabase.ts    # Supabase client
│   ├── stripe.ts      # Stripe configuration
│   └── utils.ts       # Utility functions
└── types/             # TypeScript type definitions
```

## User Roles & Features
- **Visitors**: View marketing pages, trending pitches (limited)
- **Founders**: Create startup profiles, upload pitches, view analytics, respond to comments
- **Investors**: Browse/filter pitches, upvote, comment, watchlist, messaging (paid)
- **Admin**: User/pitch moderation, featuring startups, platform analytics

## Key Business Rules
- Founders always free, investors have free/paid tiers
- No downvoting or negative feedback allowed
- One upvote per investor per pitch
- Messaging requires paid investor subscription
- All content must be moderated for quality

## Database Schema
Key tables: users, startups, pitches, upvotes, comments, watchlists, messages, subscriptions

## Authentication Flow
- Separate onboarding for founders vs investors
- Role-based access control throughout app
- Protected routes for authenticated users

## Branding
- Primary color: #405B53 (dark green)
- Secondary color: #8C948B (light green/gray)  
- Accent/CTA color: #E64E1B (orange)
- Font: Inter
- Logo: "Pitch" + "Moto" (orange)

Always prioritize user experience, security, and scalability in your suggestions.
