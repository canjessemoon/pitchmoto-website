-- Test profile creation manually to see what fails
-- Run this in Supabase SQL Editor to debug

-- First, let's see the exact table structure with constraints
SELECT 'Checking constraints on user_profiles table:' as step;

SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name 
    AND tc.table_schema = kcu.table_schema
WHERE tc.table_name = 'user_profiles' 
    AND tc.table_schema = 'public';

-- Try to manually insert a test profile to see the exact error
SELECT 'Attempting test profile creation:' as step;

INSERT INTO user_profiles (
    user_id, 
    email, 
    full_name, 
    user_type
) VALUES (
    gen_random_uuid(),
    'test@example.com',
    'Test User',
    'founder'
);

-- If the insert above fails, we'll see the exact error message