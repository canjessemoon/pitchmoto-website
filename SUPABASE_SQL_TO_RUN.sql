/*
INSTRUCTIONS: Run this SQL in your Supabase SQL Editor
to add the tags column to the startups table
*/

-- Add tags column to startups table
ALTER TABLE startups 
ADD COLUMN tags TEXT[] DEFAULT '{}';

-- Add GIN index for efficient array searches
CREATE INDEX idx_startups_tags ON startups USING GIN (tags);

-- Add comment for documentation
COMMENT ON COLUMN startups.tags IS 'Cross-industry tags for enhanced categorization and search';

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'startups' AND column_name = 'tags';