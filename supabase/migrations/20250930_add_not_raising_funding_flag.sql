-- Add "not raising funding at this time" flag to startups and pitches tables
-- This allows startups to indicate they are not actively fundraising

-- Add flag to startups table
ALTER TABLE startups 
ADD COLUMN is_not_raising_funding BOOLEAN DEFAULT FALSE;

-- Add flag to pitches table  
ALTER TABLE pitches
ADD COLUMN is_not_raising_funding BOOLEAN DEFAULT FALSE;

-- Add comments for clarity
COMMENT ON COLUMN startups.is_not_raising_funding IS 'True if startup is not actively raising funding at this time';
COMMENT ON COLUMN pitches.is_not_raising_funding IS 'True if this pitch is not seeking funding at this time';

-- Update existing records where funding_goal or funding_ask is 0 to set the flag
UPDATE startups SET is_not_raising_funding = TRUE WHERE funding_goal = 0;
UPDATE pitches SET is_not_raising_funding = TRUE WHERE funding_ask = 0;