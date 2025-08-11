# PitchMoto Integration Plan

## Overview
The collaborator added significant new features but used mock services due to no Supabase access. This plan outlines how to integrate their work with the real Supabase backend.

## What the Collaborator Added
1. **Enhanced Signup Forms** - More detailed founder/investor signup with multi-step UI
2. **Stripe Integration** - Payment processing for investor subscriptions
3. **Messaging System** - Real-time messaging between founders and investors
4. **Legal Pages** - Privacy policy and terms of service
5. **UI Components** - Modals, payment forms, enhanced navigation

## Integration Tasks

### 1. File Structure Consolidation
**Issue**: Collaborator created nested `Pitchmoto-mvp/Pitchmoto-mvp/` structure
**Solution**: Move all new files to the correct src structure

### 2. Authentication Integration
**Current**: Uses mock auth (`mock-auth-helpers.ts`)
**Target**: Use real Supabase auth (`auth-helpers.ts`)

#### Files to Update:
- `foundersignup/page.tsx` - ✅ Started
- `investorsignup/page.tsx` - Need to update
- Any components using mock auth

### 3. Database Schema Updates
**New tables needed for collaborator's features**:

```sql
-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL,
  sender_id UUID REFERENCES profiles(id),
  recipient_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text',
  attachments JSONB,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Threads table
CREATE TABLE threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participants UUID[] NOT NULL,
  last_message_id UUID,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table (for Stripe)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  plan_type VARCHAR(50),
  status VARCHAR(50),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. Stripe Integration
**Current**: Basic setup exists
**Needed**: 
- Environment variables for Stripe keys
- Connect to real Stripe account
- Update subscription logic to work with Supabase users

### 5. Messaging System Integration
**Current**: Uses mock data (`mock-message-service.ts`)
**Target**: Replace with real Supabase queries

### 6. Route Consolidation
**Issues**:
- Duplicated signup pages (existing vs new enhanced ones)
- Need to decide which to keep or merge

### 7. Component Integration
**New components to integrate**:
- Enhanced navigation
- Messaging interface
- Payment forms
- Legal components

## Recommended Integration Order

### Phase 1: File Structure (High Priority)
1. Move all new files from nested structure to correct locations
2. Update import paths
3. Consolidate duplicate files

### Phase 2: Authentication (High Priority)
1. Replace all mock auth with real Supabase auth
2. Update signup forms to use real backend
3. Test signup flows

### Phase 3: Database Schema (High Priority)
1. Create new tables for messaging and subscriptions
2. Update RLS policies
3. Test database operations

### Phase 4: Stripe Integration (Medium Priority)
1. Set up real Stripe environment
2. Connect to Supabase users
3. Test payment flows

### Phase 5: Messaging System (Medium Priority)
1. Replace mock messaging with real Supabase
2. Implement real-time subscriptions
3. Test messaging interface

### Phase 6: UI Polish (Low Priority)
1. Merge enhanced UI components
2. Update navigation
3. Polish user experience

## Environment Variables Needed
```
# Stripe (new)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Existing Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Next Steps
1. Start with Phase 1 - consolidate file structure
2. Update authentication to use real Supabase
3. Create database schema for new features
4. Test integration step by step
