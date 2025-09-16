/*
INSTRUCTIONS: Copy and paste this SQL directly in your Supabase SQL Editor
Run each statement one by one if needed
*/

-- Step 1: Add tags column to startups table
ALTER TABLE startups ADD COLUMN tags TEXT[] DEFAULT '{}';

-- Step 2: Add GIN index for efficient array searches  
CREATE INDEX idx_startups_tags ON startups USING GIN (tags);

-- Step 3: Add comment for documentation
COMMENT ON COLUMN startups.tags IS 'Cross-industry tags for enhanced categorization and search';

-- Step 4: Verify the column was added (optional)
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'startups' AND column_name = 'tags';