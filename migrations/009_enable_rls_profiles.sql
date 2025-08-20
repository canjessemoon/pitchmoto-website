-- Enable Row Level Security on profiles table
-- This fixes the security warning where RLS policies exist but RLS is not enabled

-- Enable RLS on the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Verify that the existing policies are still in place
-- (This is just for reference - the policies should already exist)
-- 
-- Expected policies:
-- 1. "Users can insert their own profile"
-- 2. "Users can update their own profile" 
-- 3. "Users can view their own profile"

-- You can check existing policies with:
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';
