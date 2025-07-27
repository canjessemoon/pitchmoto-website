-- Test script to verify funding_ask migration
-- Run this FIRST to check if the column already exists

-- Check if funding_ask column exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'pitches' AND column_name = 'funding_ask';

-- If the above query returns no rows, the column doesn't exist and you need to run:
-- ALTER TABLE pitches ADD COLUMN funding_ask BIGINT;

-- If it returns a row, the column already exists and you can skip the migration
