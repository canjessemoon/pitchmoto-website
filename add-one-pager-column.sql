-- Add one_pager_url column to pitches table
-- Run this in Supabase SQL Editor

ALTER TABLE pitches ADD COLUMN IF NOT EXISTS one_pager_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN pitches.one_pager_url IS 'URL to the one-pager document stored in Supabase Storage';

-- Check that the column was added successfully
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'pitches' 
  AND column_name = 'one_pager_url';