-- Advanced diagnostic queries for profile RLS issue
-- Run these one by one in Supabase SQL Editor

-- 1. See all users and their profiles
SELECT 
    u.id as user_id,
    u.email as auth_email,
    u.created_at as user_created,
    p.id as profile_id,
    p.email as profile_email,
    p.full_name,
    p.user_type,
    p.profile_picture_url,
    p.created_at as profile_created
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- 2. Check current authentication context (should be null in SQL Editor)
SELECT 
    auth.uid() as current_user_id,
    current_setting('request.jwt.claims', true)::json as jwt_claims;

-- 3. Test if you can directly update a profile (will fail with RLS)
-- Replace 'YOUR_EMAIL_HERE' with your actual email
-- UPDATE public.profiles 
-- SET profile_picture_url = 'test-url'
-- WHERE email = 'YOUR_EMAIL_HERE';

-- 4. Check exact RLS policy definition
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles' AND cmd = 'UPDATE';

-- 5. Test RLS bypass (as superuser)
-- This will tell us if the issue is definitely RLS-related
SET row_security = off;
-- Try the update again after this
-- SET row_security = on; -- to re-enable
