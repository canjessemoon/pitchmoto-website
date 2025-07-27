-- Fix Storage Policies
-- Run this in Supabase SQL Editor to fix the upload issues

-- Drop existing policies and create new ones
DROP POLICY IF EXISTS "Users can upload their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Public can view profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view logos" ON storage.objects;

-- Create simpler profile picture policies
CREATE POLICY "Anyone can upload profile pictures" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'profile-picture' AND auth.uid() IS NOT NULL
);

CREATE POLICY "Anyone can view profile pictures" ON storage.objects FOR SELECT USING (
  bucket_id = 'profile-picture'
);

-- Create simpler logo policies
CREATE POLICY "Anyone can upload logos" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'logo' AND auth.uid() IS NOT NULL
);

CREATE POLICY "Anyone can view logos" ON storage.objects FOR SELECT USING (
  bucket_id = 'logo'
);

-- Create simpler pitch deck policies
CREATE POLICY "Anyone can upload pitch decks" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'pitch-decks' AND auth.uid() IS NOT NULL
);

CREATE POLICY "Anyone can view pitch decks" ON storage.objects FOR SELECT USING (
  bucket_id = 'pitch-decks' AND auth.uid() IS NOT NULL
);

-- Create simpler pitch video policies
CREATE POLICY "Anyone can upload pitch videos" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'pitch-videos' AND auth.uid() IS NOT NULL
);

CREATE POLICY "Anyone can view pitch videos" ON storage.objects FOR SELECT USING (
  bucket_id = 'pitch-videos' AND auth.uid() IS NOT NULL
);
