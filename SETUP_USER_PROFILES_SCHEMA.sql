-- Complete User Profiles Schema Setup
-- Run this in Supabase SQL Editor to fix the user_profiles table

-- Step 1: Check what currently exists
SELECT 'Current user_profiles table structure:' as step;

SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Check current data
SELECT 'Current data in user_profiles:' as step;
SELECT * FROM user_profiles LIMIT 5;

-- Step 3: Add missing columns if they don't exist
SELECT 'Adding missing columns...' as step;

-- Add full_name column if it doesn't exist
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Add other missing columns
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Step 4: If you have separate first_name/last_name, combine them into full_name
SELECT 'Migrating name data...' as step;

-- Check if first_name and last_name columns exist
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
          AND column_name = 'first_name'
    ) THEN
        -- Combine first_name and last_name into full_name
        UPDATE user_profiles 
        SET full_name = TRIM(CONCAT(
            COALESCE(first_name, ''), 
            ' ', 
            COALESCE(last_name, '')
        ))
        WHERE full_name IS NULL 
          AND (first_name IS NOT NULL OR last_name IS NOT NULL);
          
        RAISE NOTICE 'Combined first_name and last_name into full_name';
    ELSE
        RAISE NOTICE 'No first_name column found, skipping migration';
    END IF;
END $$;

-- Step 5: Ensure user_type has correct default
ALTER TABLE user_profiles 
ALTER COLUMN user_type SET DEFAULT 'investor';

-- Step 6: Add updated_at trigger if it doesn't exist
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
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 7: Enable RLS if not already enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 8: Create RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Step 9: Verify final structure
SELECT 'Final user_profiles table structure:' as step;

SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 10: Show any existing data
SELECT 'Final data check:' as step;
SELECT 
    user_id,
    email,
    full_name,
    user_type,
    location,
    created_at
FROM user_profiles 
LIMIT 5;

SELECT 'Schema setup complete! ✅' as status;
