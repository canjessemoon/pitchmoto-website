-- Migration: Add funding_ask column to pitches table
-- Date: 2025-01-27
-- Description: Move funding ask from startup-level to pitch-level for more flexibility

-- Add funding_ask column to pitches table
ALTER TABLE pitches ADD COLUMN funding_ask BIGINT;

-- Add comment for documentation
COMMENT ON COLUMN pitches.funding_ask IS 'Funding amount being requested in this pitch (in cents/smallest currency unit)';

-- Update the main schema file reference (this is the command to run)
-- You can also update the main schema.sql file to include this column for fresh installations

-- Example values:
-- $100,000 = 10000000 (cents)
-- $1,000,000 = 100000000 (cents)
-- $5,000,000 = 500000000 (cents)
