-- Quick Fix: Create Storage Buckets with names that match the code
-- Run this in Supabase SQL Editor

-- Create buckets that match what the storage-helpers.ts code expects
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('profile-picture', 'profile-picture', true),
  ('logo', 'logo', true),
  ('pitch-decks', 'pitch-decks', false),
  ('pitch-videos', 'pitch-videos', false)
ON CONFLICT (id) DO NOTHING;

-- Simple policies that allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads" ON storage.objects 
FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('profile-picture', 'logo', 'pitch-decks', 'pitch-videos'));

CREATE POLICY "Allow authenticated reads" ON storage.objects 
FOR SELECT TO authenticated USING (bucket_id IN ('profile-picture', 'logo', 'pitch-decks', 'pitch-videos'));

CREATE POLICY "Allow public reads for public buckets" ON storage.objects 
FOR SELECT USING (bucket_id IN ('profile-picture', 'logo'));

SELECT 'Quick storage setup completed!' as status;