-- Temporary fix for startup creation RLS policy
-- Run this in Supabase SQL Editor to allow authenticated users to create startups

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Founders can create startups" ON startups;

-- Create a more permissive policy for testing
CREATE POLICY "Authenticated users can create startups" ON startups FOR INSERT TO authenticated WITH CHECK (
  auth.uid() IS NOT NULL
);

-- Optional: Also ensure the founder_id gets set correctly by adding a trigger
-- This ensures founder_id always matches the authenticated user
CREATE OR REPLACE FUNCTION set_founder_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.founder_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically set founder_id
DROP TRIGGER IF EXISTS startup_set_founder_id ON startups;
CREATE TRIGGER startup_set_founder_id
  BEFORE INSERT ON startups
  FOR EACH ROW
  EXECUTE FUNCTION set_founder_id();
