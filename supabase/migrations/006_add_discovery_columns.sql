-- Migration to add missing columns for discovery functionality
-- Add missing columns to pitches table

ALTER TABLE pitches 
ADD COLUMN IF NOT EXISTS tagline TEXT,
ADD COLUMN IF NOT EXISTS sector TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS stage TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS deck_url TEXT,
ADD COLUMN IF NOT EXISTS one_pager_url TEXT;

-- Add missing columns to startups table
ALTER TABLE startups 
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS founded_year INTEGER,
ADD COLUMN IF NOT EXISTS team_size INTEGER,
ADD COLUMN IF NOT EXISTS description TEXT;
