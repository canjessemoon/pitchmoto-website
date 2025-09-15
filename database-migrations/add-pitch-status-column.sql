-- Migration: Add status column to pitches table
-- Run this in your Supabase SQL editor

-- Add status column to pitches table
ALTER TABLE pitches 
ADD COLUMN status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft';

-- Update existing pitches to have 'published' status (since they were created without status)
UPDATE pitches SET status = 'published' WHERE status IS NULL;

-- Make status column NOT NULL after setting default values
ALTER TABLE pitches ALTER COLUMN status SET NOT NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_pitches_status ON pitches(status);

-- Add comment for documentation
COMMENT ON COLUMN pitches.status IS 'Pitch publication status: draft, published, or archived';
