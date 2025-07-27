-- Debug query to check current user and profile setup
-- Run this in Supabase SQL Editor to debug the RLS issue

-- 1. Check if the profile fields exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 2. Check current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 3. Check if your current user has a profile
SELECT id, email, full_name, user_type, 
       bio, company, location, website, linkedin_url, profile_picture_url,
       created_at, updated_at
FROM profiles 
WHERE id = auth.uid();

-- 4. Test a simple update (replace 'test-value' with actual data)
-- UPDATE profiles 
-- SET full_name = 'Your Name Here'
-- WHERE id = auth.uid();

-- 5. Check auth context
SELECT 
    auth.uid() as current_user_id,
    auth.jwt() ->> 'email' as email_from_jwt,
    current_setting('request.jwt.claims', true)::json ->> 'sub' as sub_from_jwt;
