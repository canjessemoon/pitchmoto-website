-- Create Storage Buckets via SQL
-- Copy and paste this into Supabase SQL Editor

-- Create profile-picture bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-picture',
  'profile-picture', 
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Create logo bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'logo',
  'logo',
  true, 
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
);

-- Create pitch-decks bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pitch-decks',
  'pitch-decks',
  false,
  52428800, -- 50MB
  ARRAY['application/pdf']
);

-- Create pitch-videos bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pitch-videos', 
  'pitch-videos',
  false,
  524288000, -- 500MB
  ARRAY['video/mp4', 'video/webm', 'video/quicktime']
);

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create storage policies for profile-picture (public bucket)
CREATE POLICY "Users can upload their own profile pictures" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'profile-picture' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Public can view profile pictures" ON storage.objects FOR SELECT USING (
  bucket_id = 'profile-picture'
);

-- Create storage policies for logo (public bucket)  
CREATE POLICY "Users can upload logos" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'logo' AND auth.uid() IS NOT NULL
);

CREATE POLICY "Public can view logos" ON storage.objects FOR SELECT USING (
  bucket_id = 'logo'
);

-- Create storage policies for pitch-decks (private bucket)
CREATE POLICY "Founders can upload pitch decks" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'pitch-decks' AND auth.uid() IS NOT NULL
);

CREATE POLICY "Authenticated users can view pitch decks" ON storage.objects FOR SELECT USING (
  bucket_id = 'pitch-decks' AND auth.uid() IS NOT NULL
);

-- Create storage policies for pitch-videos (private bucket)
CREATE POLICY "Founders can upload pitch videos" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'pitch-videos' AND auth.uid() IS NOT NULL
);

CREATE POLICY "Authenticated users can view pitch videos" ON storage.objects FOR SELECT USING (
  bucket_id = 'pitch-videos' AND auth.uid() IS NOT NULL
);
