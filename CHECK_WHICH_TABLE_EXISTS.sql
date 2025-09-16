-- Check which profile table exists in your Supabase database
-- Run this in Supabase SQL Editor

-- Check if 'profiles' table exists
SELECT 'Checking if profiles table exists...' as step;

SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name = 'profiles' 
  AND table_schema = 'public';

-- Check if 'user_profiles' table exists  
SELECT 'Checking if user_profiles table exists...' as step;

SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name = 'user_profiles' 
  AND table_schema = 'public';

-- List all your tables to see what's actually there
SELECT 'All tables in your database:' as step;

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;