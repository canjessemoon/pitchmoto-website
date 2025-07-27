-- Add country field to startups table
ALTER TABLE startups ADD COLUMN country TEXT;

-- Add a comment explaining the field
COMMENT ON COLUMN startups.country IS 'Country where the startup is incorporated';
