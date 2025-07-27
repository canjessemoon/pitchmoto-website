-- Fix RLS policies for profiles table to allow profile picture updates
-- Run this in Supabase SQL Editor after running ADD_PROFILE_FIELDS.sql

-- First, check if the new columns exist
-- If you get an error about missing columns, run ADD_PROFILE_FIELDS.sql first

-- Update the existing RLS policy to allow updates to all profile fields
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Alternative: If you want more granular control, create separate policies
-- DROP POLICY IF EXISTS "Users can update basic profile info" ON profiles;
-- DROP POLICY IF EXISTS "Users can update extended profile info" ON profiles;

-- CREATE POLICY "Users can update basic profile info" ON profiles
--     FOR UPDATE USING (auth.uid() = id)
--     WITH CHECK (
--         auth.uid() = id AND
--         -- Only allow updates to these specific fields
--         (
--             full_name IS NOT DISTINCT FROM full_name OR
--             user_type IS NOT DISTINCT FROM user_type OR
--             bio IS NOT DISTINCT FROM bio OR
--             company IS NOT DISTINCT FROM company OR
--             location IS NOT DISTINCT FROM location OR
--             website IS NOT DISTINCT FROM website OR
--             linkedin_url IS NOT DISTINCT FROM linkedin_url OR
--             profile_picture_url IS NOT DISTINCT FROM profile_picture_url
--         )
--     );

-- Verify the policy is working
-- You can test with: SELECT current_setting('request.jwt.claims', true)::json ->> 'sub';
