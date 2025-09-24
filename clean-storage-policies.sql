-- Clean up ALL existing storage policies and keep only the simple test ones
-- This removes conflicting policies that could block uploads

-- Drop ALL existing policies (except our temp ones)
DROP POLICY IF EXISTS "Anyone can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload pitch decks" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload pitch videos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view logos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view pitch decks" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view pitch videos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Founders can delete own pitch decks" ON storage.objects;
DROP POLICY IF EXISTS "Founders can delete own pitch videos" ON storage.objects;
DROP POLICY IF EXISTS "Founders can delete startup logos" ON storage.objects;
DROP POLICY IF EXISTS "Founders can update own pitch decks" ON storage.objects;
DROP POLICY IF EXISTS "Founders can update own pitch videos" ON storage.objects;
DROP POLICY IF EXISTS "Founders can update startup logos" ON storage.objects;
DROP POLICY IF EXISTS "Founders can upload pitch decks" ON storage.objects;
DROP POLICY IF EXISTS "Founders can upload pitch videos" ON storage.objects;
DROP POLICY IF EXISTS "Founders can upload startup logos" ON storage.objects;
DROP POLICY IF EXISTS "Founders can view own pitch decks" ON storage.objects;
DROP POLICY IF EXISTS "Founders can view own pitch videos" ON storage.objects;
DROP POLICY IF EXISTS "Investors can view pitch decks" ON storage.objects;
DROP POLICY IF EXISTS "Investors can view pitch videos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Public can view startup logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own profile pictures" ON storage.objects;

-- Keep only our simple temp policies (they should already exist)
-- If they don't exist, recreate them:

-- Ensure temp policies exist
CREATE POLICY IF NOT EXISTS "temp_pitch_decks_policy" ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'pitch-decks')
WITH CHECK (bucket_id = 'pitch-decks');

CREATE POLICY IF NOT EXISTS "temp_logo_policy" ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'logo')
WITH CHECK (bucket_id = 'logo');

CREATE POLICY IF NOT EXISTS "temp_pitch_videos_policy" ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'pitch-videos')
WITH CHECK (bucket_id = 'pitch-videos');

CREATE POLICY IF NOT EXISTS "temp_profile_picture_policy" ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'profile-picture')
WITH CHECK (bucket_id = 'profile-picture');

-- Verify only our temp policies remain
SELECT 'After cleanup:' as status;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;