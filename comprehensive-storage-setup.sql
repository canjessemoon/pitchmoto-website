-- Comprehensive Storage Setup for PitchMoto (Option 3)
-- Run this in Supabase SQL Editor to create buckets and secure policies

-- IMPORTANT: This script matches the bucket names in storage-helpers.ts

-- 1. Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('profile-picture', 'profile-picture', true),    -- matches storage-helpers.ts
  ('logo', 'logo', true),                          -- matches storage-helpers.ts  
  ('pitch-decks', 'pitch-decks', false),           -- matches storage-helpers.ts
  ('pitch-videos', 'pitch-videos', false)          -- matches storage-helpers.ts
ON CONFLICT (id) DO NOTHING;

-- 2. PITCH DECKS BUCKET POLICIES (Private - for pitch PDFs)
-- Founders can upload pitch decks to their own startup folders
CREATE POLICY "Founders can upload pitch decks" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'pitch-decks' AND 
  EXISTS (
    SELECT 1 FROM startups 
    WHERE founder_id = auth.uid() 
    AND id::text = (storage.foldername(name))[1]
  )
);

-- Founders can view their own pitch decks
CREATE POLICY "Founders can view own pitch decks" ON storage.objects 
FOR SELECT USING (
  bucket_id = 'pitch-decks' AND 
  EXISTS (
    SELECT 1 FROM startups 
    WHERE founder_id = auth.uid() 
    AND id::text = (storage.foldername(name))[1]
  )
);

-- Investors can view pitch decks (for business model)
CREATE POLICY "Investors can view pitch decks" ON storage.objects 
FOR SELECT USING (
  bucket_id = 'pitch-decks' AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type IN ('investor', 'admin'))
);

-- Founders can update/replace their pitch decks
CREATE POLICY "Founders can update own pitch decks" ON storage.objects 
FOR UPDATE USING (
  bucket_id = 'pitch-decks' AND 
  EXISTS (
    SELECT 1 FROM startups 
    WHERE founder_id = auth.uid() 
    AND id::text = (storage.foldername(name))[1]
  )
);

-- Founders can delete their pitch decks
CREATE POLICY "Founders can delete own pitch decks" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'pitch-decks' AND 
  EXISTS (
    SELECT 1 FROM startups 
    WHERE founder_id = auth.uid() 
    AND id::text = (storage.foldername(name))[1]
  )
);

-- 3. PROFILE PICTURES BUCKET POLICIES (Public)
-- Users can upload their own profile pictures
CREATE POLICY "Users can upload own profile pictures" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'profile-picture' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Public can view profile pictures
CREATE POLICY "Public can view profile pictures" ON storage.objects 
FOR SELECT USING (bucket_id = 'profile-picture');

-- Users can update their own profile pictures
CREATE POLICY "Users can update own profile pictures" ON storage.objects 
FOR UPDATE USING (
  bucket_id = 'profile-picture' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own profile pictures
CREATE POLICY "Users can delete own profile pictures" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'profile-picture' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. LOGOS BUCKET POLICIES (Public)
-- Founders can upload logos for their startups
CREATE POLICY "Founders can upload startup logos" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'logo' AND 
  EXISTS (
    SELECT 1 FROM startups 
    WHERE founder_id = auth.uid() 
    AND id::text = (storage.foldername(name))[1]
  )
);

-- Public can view startup logos
CREATE POLICY "Public can view startup logos" ON storage.objects 
FOR SELECT USING (bucket_id = 'logo');

-- Founders can update their startup logos
CREATE POLICY "Founders can update startup logos" ON storage.objects 
FOR UPDATE USING (
  bucket_id = 'logo' AND 
  EXISTS (
    SELECT 1 FROM startups 
    WHERE founder_id = auth.uid() 
    AND id::text = (storage.foldername(name))[1]
  )
);

-- Founders can delete their startup logos
CREATE POLICY "Founders can delete startup logos" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'logo' AND 
  EXISTS (
    SELECT 1 FROM startups 
    WHERE founder_id = auth.uid() 
    AND id::text = (storage.foldername(name))[1]
  )
);

-- 5. PITCH VIDEOS BUCKET POLICIES (Private)
-- Founders can upload pitch videos for their startups
CREATE POLICY "Founders can upload pitch videos" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'pitch-videos' AND 
  EXISTS (
    SELECT 1 FROM startups 
    WHERE founder_id = auth.uid() 
    AND id::text = (storage.foldername(name))[1]
  )
);

-- Founders can view their own pitch videos
CREATE POLICY "Founders can view own pitch videos" ON storage.objects 
FOR SELECT USING (
  bucket_id = 'pitch-videos' AND 
  EXISTS (
    SELECT 1 FROM startups 
    WHERE founder_id = auth.uid() 
    AND id::text = (storage.foldername(name))[1]
  )
);

-- Investors can view pitch videos
CREATE POLICY "Investors can view pitch videos" ON storage.objects 
FOR SELECT USING (
  bucket_id = 'pitch-videos' AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type IN ('investor', 'admin'))
);

-- Founders can update their pitch videos
CREATE POLICY "Founders can update own pitch videos" ON storage.objects 
FOR UPDATE USING (
  bucket_id = 'pitch-videos' AND 
  EXISTS (
    SELECT 1 FROM startups 
    WHERE founder_id = auth.uid() 
    AND id::text = (storage.foldername(name))[1]
  )
);

-- Founders can delete their pitch videos
CREATE POLICY "Founders can delete own pitch videos" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'pitch-videos' AND 
  EXISTS (
    SELECT 1 FROM startups 
    WHERE founder_id = auth.uid() 
    AND id::text = (storage.foldername(name))[1]
  )
);

-- Success message
SELECT 'Comprehensive storage setup completed successfully!' as status,
       'Created buckets: profile-picture, logo, pitch-decks, pitch-videos' as buckets,
       'All security policies applied for proper access control' as security;