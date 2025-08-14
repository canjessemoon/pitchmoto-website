-- Add status column to pitches table
ALTER TABLE pitches 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';

-- Update any existing pitches to have 'draft' status
UPDATE pitches 
SET status = 'draft' 
WHERE status IS NULL;

-- Add a check constraint to ensure valid status values
ALTER TABLE pitches 
ADD CONSTRAINT pitches_status_check 
CHECK (status IN ('draft', 'published', 'archived'));
