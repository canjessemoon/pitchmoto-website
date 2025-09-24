-- Temporary permissive policy to test upload mechanism
-- This allows any authenticated user to upload to test if the mechanism works

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "pitch_decks_policy" ON storage.objects;
DROP POLICY IF EXISTS "pitch_videos_policy" ON storage.objects;
DROP POLICY IF EXISTS "logo_policy" ON storage.objects;
DROP POLICY IF EXISTS "profile_picture_policy" ON storage.objects;

-- Create very permissive temporary policies for testing
CREATE POLICY "temp_pitch_decks_policy" ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'pitch-decks')
WITH CHECK (bucket_id = 'pitch-decks');

CREATE POLICY "temp_logo_policy" ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'logo')
WITH CHECK (bucket_id = 'logo');

CREATE POLICY "temp_pitch_videos_policy" ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'pitch-videos')
WITH CHECK (bucket_id = 'pitch-videos');

CREATE POLICY "temp_profile_picture_policy" ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'profile-picture')
WITH CHECK (bucket_id = 'profile-picture');

-- Verify the temporary policies are active
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;