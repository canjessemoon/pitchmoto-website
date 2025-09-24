-- Create Storage Buckets and Policies for PitchMoto
-- Run this in Supabase SQL Editor to set up file uploads

-- 1. Create storage buckets (if they don't exist)
-- Note: You must create buckets in the Supabase Dashboard first, then run this for policies

-- 2. Create storage policies for pitch-decks bucket
-- Allow founders to upload pitch decks for their own startups
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pitch-decks', 'pitch-decks', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: Founders can upload pitch files to their startup folders
CREATE POLICY "Founders can upload pitch files" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'pitch-decks' AND 
  EXISTS (
    SELECT 1 FROM startups 
    WHERE founder_id = auth.uid() 
    AND id::text = (storage.foldername(name))[1]
  )
);

-- Policy: Founders can view their own pitch files
CREATE POLICY "Founders can view own pitch files" ON storage.objects 
FOR SELECT USING (
  bucket_id = 'pitch-decks' AND 
  EXISTS (
    SELECT 1 FROM startups 
    WHERE founder_id = auth.uid() 
    AND id::text = (storage.foldername(name))[1]
  )
);

-- Policy: Investors can view pitch files (for paid access)
CREATE POLICY "Investors can view pitch files" ON storage.objects 
FOR SELECT USING (
  bucket_id = 'pitch-decks' AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type IN ('investor', 'admin'))
);

-- Policy: Allow updating/replacing files
CREATE POLICY "Founders can update own pitch files" ON storage.objects 
FOR UPDATE USING (
  bucket_id = 'pitch-decks' AND 
  EXISTS (
    SELECT 1 FROM startups 
    WHERE founder_id = auth.uid() 
    AND id::text = (storage.foldername(name))[1]
  )
);

-- Policy: Allow deleting files
CREATE POLICY "Founders can delete own pitch files" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'pitch-decks' AND 
  EXISTS (
    SELECT 1 FROM startups 
    WHERE founder_id = auth.uid() 
    AND id::text = (storage.foldername(name))[1]
  )
);

-- 3. Create similar policies for profile-pictures bucket (public)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Users can upload their own profile pictures
CREATE POLICY "Users can upload their own profile pictures" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'profile-pictures' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Public access to view profile pictures
CREATE POLICY "Public can view profile pictures" ON storage.objects 
FOR SELECT USING (bucket_id = 'profile-pictures');

-- 4. Create logos bucket (public)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Founders can upload logos for their startups
CREATE POLICY "Founders can upload startup logos" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'logos' AND 
  EXISTS (
    SELECT 1 FROM startups 
    WHERE founder_id = auth.uid() 
    AND id::text = (storage.foldername(name))[1]
  )
);

-- Policy: Public access to view logos
CREATE POLICY "Public can view logos" ON storage.objects 
FOR SELECT USING (bucket_id = 'logos');

-- 5. Create pitch-videos bucket (private)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pitch-videos', 'pitch-videos', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: Founders can upload pitch videos for their startups
CREATE POLICY "Founders can upload pitch videos" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'pitch-videos' AND 
  EXISTS (
    SELECT 1 FROM startups 
    WHERE founder_id = auth.uid() 
    AND id::text = (storage.foldername(name))[1]
  )
);

-- Policy: Founders can view their own pitch videos
CREATE POLICY "Founders can view own pitch videos" ON storage.objects 
FOR SELECT USING (
  bucket_id = 'pitch-videos' AND 
  EXISTS (
    SELECT 1 FROM startups 
    WHERE founder_id = auth.uid() 
    AND id::text = (storage.foldername(name))[1]
  )
);

-- Policy: Investors can view pitch videos
CREATE POLICY "Investors can view pitch videos" ON storage.objects 
FOR SELECT USING (
  bucket_id = 'pitch-videos' AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type IN ('investor', 'admin'))
);

SELECT 'Storage buckets and policies created successfully!' as status;