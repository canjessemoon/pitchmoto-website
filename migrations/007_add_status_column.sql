-- Add status column to pitches table
-- This migration adds a status column to track draft/published state of pitches

-- Add the status column with default value 'draft'
ALTER TABLE pitches 
ADD COLUMN status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published'));

-- Update existing pitches to have 'draft' status if they don't have one
UPDATE pitches 
SET status = 'draft' 
WHERE status IS NULL;

-- Add a comment to the column
COMMENT ON COLUMN pitches.status IS 'Status of the pitch: draft or published';
