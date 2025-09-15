-- Migration: Add tags support to startups
-- Date: 2025-09-15
-- Description: Adds optional cross-industry tags to startups table

-- Add tags column to startups table
ALTER TABLE startups 
ADD COLUMN tags TEXT[] DEFAULT '{}';

-- Add index for tags array search performance
CREATE INDEX idx_startups_tags ON startups USING GIN (tags);

-- Add comment for documentation
COMMENT ON COLUMN startups.tags IS 'Cross-industry tags for enhanced categorization and search';