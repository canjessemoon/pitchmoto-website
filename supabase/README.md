# Matching System Database Migration

## Overview
This migration creates the database schema for the new investor-startup matching system, replacing the simple upvote system with sophisticated matching based on investor criteria.

## New Tables Created

### 1. investor_theses
Stores investor preferences and investment criteria:
- Investment range preferences (min/max funding ask)
- Industry, stage, and location preferences  
- Scoring weights for different criteria
- Keywords and exclusions
- Deal terms preferences (equity range)

### 2. startup_matches
Stores calculated matches between startups and investors:
- Match scores (overall + individual criteria scores)
- Match metadata (reason, confidence level)
- Status tracking (pending, viewed, interested, etc.)
- Unique constraint prevents duplicate matches

### 3. match_interactions
Tracks investor interactions with matches:
- Interaction types: view, like, pass, save, contact, note
- Notes and timestamps
- Links to both match and startup for analytics

## How to Apply the Migration

### Option 1: Using Supabase SQL Editor (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/20250908_create_matching_system.sql`
4. Paste and run the SQL

### Option 2: Using the Script (if tsx is available)
```bash
# Install tsx if not available
npm install -g tsx

# Run the migration script
npx tsx scripts/run-migration.ts
```

### Option 3: Manual SQL Execution
Copy and paste the SQL from the migration file directly into your preferred PostgreSQL client.

## Security Features
- Row Level Security (RLS) enabled on all tables
- Investors can only see their own data
- Founders can see matches for their startups
- Proper foreign key constraints
- Data validation constraints

## Indexes Created
Performance indexes on:
- Foreign key relationships
- Score sorting
- Status filtering
- Date ranges
- Interaction types

## After Migration
1. Update your TypeScript types (already done in this PR)
2. Test the database connection
3. Proceed to Phase C (API Endpoints) implementation

## Rollback
If you need to rollback this migration:
```sql
DROP TABLE IF EXISTS match_interactions CASCADE;
DROP TABLE IF EXISTS startup_matches CASCADE; 
DROP TABLE IF EXISTS investor_theses CASCADE;
```

## Next Steps
After successfully applying this migration, proceed to:
- Phase C: API Endpoints
- Phase D: Scoring Algorithm  
- Phase E: UI Components
- Phase F: Integration
- Phase G: Testing & Deployment
