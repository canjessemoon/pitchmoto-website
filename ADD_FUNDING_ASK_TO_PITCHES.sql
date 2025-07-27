-- Add funding_ask column to pitches table
ALTER TABLE pitches ADD COLUMN funding_ask BIGINT;

-- Set a default value for existing records (if any)
UPDATE pitches SET funding_ask = 100000 WHERE funding_ask IS NULL;

-- Make the column NOT NULL after setting defaults
ALTER TABLE pitches ALTER COLUMN funding_ask SET NOT NULL;

-- Add a check constraint to ensure funding_ask is at least $1,000
ALTER TABLE pitches ADD CONSTRAINT pitches_funding_ask_min CHECK (funding_ask >= 1000);
