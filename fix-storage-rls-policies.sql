-- Updated Storage RLS Policies for PitchMoto
-- This script fixes the RLS policies to properly check through the startup ownership chain

-- First, let's check what policies currently exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- Drop existing policies to rebuild them correctly
DROP POLICY IF EXISTS "pitch_decks_policy" ON storage.objects;
DROP POLICY IF EXISTS "pitch_videos_policy" ON storage.objects;
DROP POLICY IF EXISTS "logo_policy" ON storage.objects;
DROP POLICY IF EXISTS "profile_picture_policy" ON storage.objects;

-- Create proper RLS policies for storage buckets

-- 1. Profile Pictures - users can manage their own profile pictures
CREATE POLICY "profile_picture_policy" ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'profile-picture' AND
  auth.uid()::text = split_part(name, '/', 1)
)
WITH CHECK (
  bucket_id = 'profile-picture' AND
  auth.uid()::text = split_part(name, '/', 1)
);

-- 2. Company Logos - founders can manage logos for their startups
CREATE POLICY "logo_policy" ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'logo' AND
  EXISTS (
    SELECT 1 FROM public.startups s
    WHERE s.id::text = split_part(name, '/', 1)
    AND s.founder_id = auth.uid()
  )
)
WITH CHECK (
  bucket_id = 'logo' AND
  EXISTS (
    SELECT 1 FROM public.startups s
    WHERE s.id::text = split_part(name, '/', 1)
    AND s.founder_id = auth.uid()
  )
);

-- 3. Pitch Decks - founders can manage pitch decks for their startups
CREATE POLICY "pitch_decks_policy" ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'pitch-decks' AND
  EXISTS (
    SELECT 1 FROM public.startups s
    WHERE s.id::text = split_part(name, '/', 1)
    AND s.founder_id = auth.uid()
  )
)
WITH CHECK (
  bucket_id = 'pitch-decks' AND
  EXISTS (
    SELECT 1 FROM public.startups s
    WHERE s.id::text = split_part(name, '/', 1)
    AND s.founder_id = auth.uid()
  )
);

-- 4. Pitch Videos - founders can manage pitch videos for their startups
CREATE POLICY "pitch_videos_policy" ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'pitch-videos' AND
  EXISTS (
    SELECT 1 FROM public.startups s
    WHERE s.id::text = split_part(name, '/', 1)
    AND s.founder_id = auth.uid()
  )
)
WITH CHECK (
  bucket_id = 'pitch-videos' AND
  EXISTS (
    SELECT 1 FROM public.startups s
    WHERE s.id::text = split_part(name, '/', 1)
    AND s.founder_id = auth.uid()
  )
);

-- Verify the policies were created correctly
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;

-- Test query to verify the ownership chain works for your specific case
-- This should return a row if the policy logic is correct
SELECT 
  s.id as startup_id,
  s.name as startup_name,
  s.founder_id,
  up.user_id,
  auth.uid() as current_user_id,
  'Should be true:' as note,
  (s.founder_id = up.user_id AND up.user_id = auth.uid()) as ownership_check
FROM public.startups s
INNER JOIN public.user_profiles up ON s.founder_id = up.user_id
WHERE s.id = '7f30e44b-fb7e-48cb-9941-1c964cafc3a7'
AND up.user_id = auth.uid();

-- Also test the path parsing function
SELECT 
  '7f30e44b-fb7e-48cb-9941-1c964cafc3a7/pitch-deck.pdf' as example_path,
  split_part('7f30e44b-fb7e-48cb-9941-1c964cafc3a7/pitch-deck.pdf', '/', 1) as extracted_startup_id;