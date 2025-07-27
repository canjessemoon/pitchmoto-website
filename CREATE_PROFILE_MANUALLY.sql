-- Manual profile creation script
-- Run this in Supabase SQL Editor to manually create your profile
-- Replace 'YOUR_USER_ID_HERE' and 'YOUR_EMAIL_HERE' with your actual values

-- First, let's see what users exist without profiles
SELECT 
    u.id as user_id,
    u.email,
    u.created_at as user_created,
    p.id as profile_id
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Then create a profile for your user (replace the values below)
-- INSERT INTO public.profiles (
--     id,
--     email,
--     full_name,
--     user_type,
--     created_at,
--     updated_at
-- ) VALUES (
--     'YOUR_USER_ID_HERE',  -- Replace with your actual user ID
--     'YOUR_EMAIL_HERE',    -- Replace with your actual email
--     'Your Full Name',     -- Replace with your actual name
--     'founder',            -- Or 'investor' if you're an investor
--     NOW(),
--     NOW()
-- );

-- After running the INSERT, verify the profile was created:
-- SELECT * FROM public.profiles WHERE email = 'YOUR_EMAIL_HERE';
