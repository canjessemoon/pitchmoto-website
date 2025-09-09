-- PitchMoto Database Quick Fix Script
-- Run this in Supabase SQL Editor to add missing columns and create user_profiles table

-- Step 1: Add missing columns to startups table
ALTER TABLE startups ADD COLUMN IF NOT EXISTS funding_goal BIGINT;
UPDATE startups SET funding_goal = 100000 WHERE funding_goal IS NULL;
ALTER TABLE startups ALTER COLUMN funding_goal SET NOT NULL;

ALTER TABLE startups ADD COLUMN IF NOT EXISTS current_funding BIGINT DEFAULT 0;
ALTER TABLE startups ADD COLUMN IF NOT EXISTS country TEXT;

-- Step 2: Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  user_type user_type NOT NULL DEFAULT 'investor',
  bio TEXT,
  location TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Step 3: Enable RLS and create policies for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile" ON user_profiles 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile" ON user_profiles 
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
CREATE POLICY "Users can insert their own profile" ON user_profiles 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Step 4: Create trigger for updated_at
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

-- Step 5: Add funding_ask column to pitches table
ALTER TABLE pitches ADD COLUMN IF NOT EXISTS funding_ask BIGINT;
UPDATE pitches SET funding_ask = 100000 WHERE funding_ask IS NULL;

-- Step 6: Fix Richard's account to be an investor (update existing profile if it exists)
UPDATE user_profiles 
SET user_type = 'investor' 
WHERE email LIKE '%jdmoon+richard%' OR email LIKE '%richard%';

-- Success message
SELECT 'Database schema updated successfully!' as status;
