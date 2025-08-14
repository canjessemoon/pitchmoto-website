-- Check the current status of the pitches table
-- Run this to see the current structure of the pitches table

\d pitches;

-- Check current data in pitches table to see status values
SELECT id, title, status, created_at FROM pitches LIMIT 10;

-- If status column exists but has null values, update them
UPDATE pitches SET status = 'draft' WHERE status IS NULL;

-- Make sure the status column has the right constraints
ALTER TABLE pitches 
ALTER COLUMN status SET DEFAULT 'draft';

-- Add constraint if it doesn't exist
ALTER TABLE pitches 
DROP CONSTRAINT IF EXISTS pitches_status_check;

ALTER TABLE pitches 
ADD CONSTRAINT pitches_status_check 
CHECK (status IN ('draft', 'published'));
