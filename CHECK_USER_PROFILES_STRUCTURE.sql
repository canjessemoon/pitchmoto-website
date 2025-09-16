-- Check the structure of user_profiles table
-- Run this in Supabase SQL Editor

SELECT 'user_profiles table structure:' as step;

SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Also check if there are any existing records
SELECT 'Sample data from user_profiles:' as step;
SELECT * FROM user_profiles LIMIT 3;