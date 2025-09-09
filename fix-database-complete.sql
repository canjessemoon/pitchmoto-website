-- PitchMoto Database Fix Script
-- Run this in Supabase SQL Editor to fix schema issues and migrate data

-- First, let's check current tables
-- Run this first to see what tables exist:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Step 1: Add missing columns to existing tables
-- Add funding_goal to startups table if it doesn't exist
ALTER TABLE startups ADD COLUMN IF NOT EXISTS funding_goal BIGINT;

-- Set default value for existing records
UPDATE startups SET funding_goal = 100000 WHERE funding_goal IS NULL;

-- Make it NOT NULL after setting defaults
ALTER TABLE startups ALTER COLUMN funding_goal SET NOT NULL;

-- Add current_funding column if it doesn't exist
ALTER TABLE startups ADD COLUMN IF NOT EXISTS current_funding BIGINT DEFAULT 0;

-- Add country column if it doesn't exist  
ALTER TABLE startups ADD COLUMN IF NOT EXISTS country TEXT;

-- Step 2: Create user_profiles table (new user profile structure)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  user_type user_type NOT NULL DEFAULT 'founder',
  bio TEXT,
  location TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Step 3: Check if profiles table exists and migrate if it does
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
    -- Migrate existing profiles to user_profiles table
    INSERT INTO user_profiles (user_id, email, first_name, last_name, user_type, created_at, updated_at)
    SELECT 
      id as user_id,
      email,
      CASE 
        WHEN full_name IS NOT NULL AND position(' ' in full_name) > 0 
        THEN trim(substring(full_name from 1 for position(' ' in full_name) - 1))
        ELSE full_name
      END as first_name,
      CASE 
        WHEN full_name IS NOT NULL AND position(' ' in full_name) > 0 
        THEN trim(substring(full_name from position(' ' in full_name) + 1))
        ELSE NULL
      END as last_name,
      user_type,
      created_at,
      updated_at
    FROM profiles 
    WHERE NOT EXISTS (
      SELECT 1 FROM user_profiles WHERE user_profiles.user_id = profiles.id
    );
    
    RAISE NOTICE 'Migrated existing profiles to user_profiles table';
  ELSE
    RAISE NOTICE 'No profiles table found - skipping migration step';
  END IF;
END $$;

-- Step 4: Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: Create policies for user_profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile" ON user_profiles 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile" ON user_profiles 
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
CREATE POLICY "Users can insert their own profile" ON user_profiles 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Step 6: Create trigger for updated_at on user_profiles
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 7: Add funding_ask column to pitches table if it doesn't exist
ALTER TABLE pitches ADD COLUMN IF NOT EXISTS funding_ask BIGINT;

-- Set default values for existing pitches
UPDATE pitches SET funding_ask = 100000 WHERE funding_ask IS NULL;

-- Verification queries (run these to check the migration worked):
-- SELECT COUNT(*) as profiles_count FROM profiles;
-- SELECT COUNT(*) as user_profiles_count FROM user_profiles;
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'startups' AND table_schema = 'public';
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'user_profiles' AND table_schema = 'public';

COMMIT;
