-- Add tags column to startups table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'startups' AND column_name = 'tags'
    ) THEN
        ALTER TABLE startups ADD COLUMN tags TEXT[] DEFAULT '{}';
        CREATE INDEX idx_startups_tags ON startups USING GIN (tags);
        
        -- Add comment
        COMMENT ON COLUMN startups.tags IS 'Cross-industry tags for enhanced categorization and search';
        
        RAISE NOTICE 'Added tags column to startups table';
    ELSE
        RAISE NOTICE 'Tags column already exists in startups table';
    END IF;
END $$;