-- Quick fix for Richard's account user type
-- Run this in Supabase SQL Editor to fix the user type

-- Update Richard's profile to be an investor
UPDATE profiles 
SET user_type = 'investor' 
WHERE email LIKE '%jdmoon+richard%' OR email LIKE '%richard%';

-- Also change the default for future profiles
ALTER TABLE profiles ALTER COLUMN user_type SET DEFAULT 'investor';

-- Verify the change
SELECT email, user_type FROM profiles WHERE email LIKE '%richard%' OR email LIKE '%jdmoon%';

SELECT 'User type fixed to investor!' as status;
