-- Clean up duplicate RLS policies on user_profiles
-- Run this in Supabase SQL Editor

-- Drop duplicate policies (keep the cleaner named ones)
DROP POLICY IF EXISTS "user_profiles_insert_policy" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_select_policy" ON user_profiles;  
DROP POLICY IF EXISTS "user_profiles_update_policy" ON user_profiles;

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Keep these policies (they have the clearest names):
-- "Users can manage their own profile" (ALL)
-- "Users can insert their own profile" (INSERT) 
-- "Users can view their own profile" (SELECT)
-- "Users can update their own profile" (UPDATE)

-- Verify remaining policies
SELECT 'Remaining policies after cleanup:' as step;

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