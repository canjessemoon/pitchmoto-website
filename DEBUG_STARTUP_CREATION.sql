-- Debug startup creation issues
-- Run this in Supabase SQL Editor to diagnose the problem

-- 1. Check if the current user has a profile
SELECT 
    u.id as user_id,
    u.email,
    p.id as profile_id,
    p.user_type,
    p.full_name,
    p.created_at as profile_created
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 5;

-- 2. Check the startups table structure and policies
SELECT schemaname, tablename, tableowner, hasindexes, hasrules, hastriggers 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'startups';

-- 3. Check RLS policies on startups table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'startups';

-- 4. Test the startup creation policy manually
-- (Replace 'YOUR_USER_ID' with actual user ID from step 1)
-- SELECT EXISTS (
--     SELECT 1 FROM profiles 
--     WHERE id = 'YOUR_USER_ID' 
--     AND user_type = 'founder'
-- ) as can_create_startup;

-- 5. If you need to create/update a profile:
-- INSERT INTO public.profiles (id, email, full_name, user_type, created_at, updated_at)
-- VALUES (
--     'YOUR_USER_ID',
--     'your@email.com',
--     'Your Name',
--     'founder',
--     NOW(),
--     NOW()
-- )
-- ON CONFLICT (id) DO UPDATE SET 
--     user_type = 'founder',
--     updated_at = NOW();
