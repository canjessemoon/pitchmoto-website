-- Fix Row Level Security for user_profiles table
-- Run this in Supabase SQL Editor

-- Check current RLS policies
SELECT 'Current RLS policies on user_profiles:' as step;

SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- Create policy to allow users to insert their own profile
SELECT 'Creating INSERT policy for user_profiles:' as step;

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to read their own profile  
SELECT 'Creating SELECT policy for user_profiles:' as step;

CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to update their own profile
SELECT 'Creating UPDATE policy for user_profiles:' as step;

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Verify policies were created
SELECT 'Verifying new policies:' as step;

SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_profiles';