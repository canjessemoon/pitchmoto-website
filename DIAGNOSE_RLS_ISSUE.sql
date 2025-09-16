-- Check existing RLS policies and diagnose the issue
-- Run this in Supabase SQL Editor

-- Check current RLS policies
SELECT 'Current RLS policies on user_profiles:' as step;

SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- Check if RLS is enabled
SELECT 'Checking if RLS is enabled:' as step;

SELECT schemaname, tablename, rowsecurity
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- Test the auth.uid() function to see what it returns
SELECT 'Testing auth.uid() function:' as step;

SELECT auth.uid() as current_user_id;

-- Check if there are any conflicting policies
SELECT 'All policies on user_profiles table:' as step;

SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY cmd, policyname;