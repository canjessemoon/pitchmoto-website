-- Create or update Richard's profile
-- Run this in Supabase SQL Editor

-- First, let's see what users exist in auth.users
SELECT 
  id, 
  email,
  created_at,
  raw_user_meta_data
FROM auth.users 
WHERE email LIKE '%richard%' OR email LIKE '%jdmoon%';

-- Check what exists in profiles table
SELECT * FROM public.profiles 
WHERE email LIKE '%richard%' OR email LIKE '%jdmoon%';

-- Create profile for Richard if it doesn't exist
-- Replace 'USER_ID_HERE' with the actual ID from the first query
INSERT INTO public.profiles (id, email, full_name, user_type, created_at, updated_at)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', 'Richard Moon') as full_name,
  'investor' as user_type,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users u
WHERE u.email LIKE '%jdmoon+richard%' 
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = u.id
  );

-- Verify the profile was created
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.user_type,
  p.created_at
FROM public.profiles p
WHERE p.email LIKE '%richard%' OR p.email LIKE '%jdmoon%';

SELECT 'Profile setup complete!' as status;
