-- Create proper ownership-based storage policies that work with authentication
-- This restores security while ensuring auth.uid() works correctly

-- First, let's create a function to debug auth context
CREATE OR REPLACE FUNCTION debug_auth_context()
RETURNS TABLE (
  user_id uuid,
  user_role text,
  jwt_claims jsonb
) AS $$
BEGIN
  RETURN QUERY SELECT 
    auth.uid() as user_id,
    auth.role() as user_role,
    auth.jwt() as jwt_claims;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the auth context
SELECT 'Current auth context:' as debug;
SELECT * FROM debug_auth_context();

-- Drop ALL existing policies (temp and any existing secure ones)
DROP POLICY IF EXISTS "temp_pitch_decks_policy" ON storage.objects;
DROP POLICY IF EXISTS "temp_logo_policy" ON storage.objects;
DROP POLICY IF EXISTS "temp_pitch_videos_policy" ON storage.objects;
DROP POLICY IF EXISTS "temp_profile_picture_policy" ON storage.objects;
DROP POLICY IF EXISTS "founders_pitch_decks_all" ON storage.objects;
DROP POLICY IF EXISTS "founders_logos_all" ON storage.objects;
DROP POLICY IF EXISTS "founders_pitch_videos_all" ON storage.objects;
DROP POLICY IF EXISTS "users_profile_pictures_all" ON storage.objects;
DROP POLICY IF EXISTS "public_read_logos" ON storage.objects;
DROP POLICY IF EXISTS "public_read_profile_pictures" ON storage.objects;
DROP POLICY IF EXISTS "investors_read_pitch_decks" ON storage.objects;
DROP POLICY IF EXISTS "investors_read_pitch_videos" ON storage.objects;

-- Create working ownership-based policies
-- For pitch decks - founders can manage their own startup's files
CREATE POLICY "founders_pitch_decks_all" ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'pitch-decks' 
  AND EXISTS (
    SELECT 1 FROM startups s 
    WHERE s.founder_id = auth.uid() 
    AND s.id::text = split_part(name, '/', 1)
  )
)
WITH CHECK (
  bucket_id = 'pitch-decks' 
  AND EXISTS (
    SELECT 1 FROM startups s 
    WHERE s.founder_id = auth.uid() 
    AND s.id::text = split_part(name, '/', 1)
  )
);

-- For logos - founders can manage their own startup's logos
CREATE POLICY "founders_logos_all" ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'logo' 
  AND EXISTS (
    SELECT 1 FROM startups s 
    WHERE s.founder_id = auth.uid() 
    AND s.id::text = split_part(name, '/', 1)
  )
)
WITH CHECK (
  bucket_id = 'logo' 
  AND EXISTS (
    SELECT 1 FROM startups s 
    WHERE s.founder_id = auth.uid() 
    AND s.id::text = split_part(name, '/', 1)
  )
);

-- For pitch videos - founders can manage their own startup's videos
CREATE POLICY "founders_pitch_videos_all" ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'pitch-videos' 
  AND EXISTS (
    SELECT 1 FROM startups s 
    WHERE s.founder_id = auth.uid() 
    AND s.id::text = split_part(name, '/', 1)
  )
)
WITH CHECK (
  bucket_id = 'pitch-videos' 
  AND EXISTS (
    SELECT 1 FROM startups s 
    WHERE s.founder_id = auth.uid() 
    AND s.id::text = split_part(name, '/', 1)
  )
);

-- For profile pictures - users can manage their own profile pictures
CREATE POLICY "users_profile_pictures_all" ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'profile-picture' 
  AND auth.uid()::text = split_part(name, '/', 1)
)
WITH CHECK (
  bucket_id = 'profile-picture' 
  AND auth.uid()::text = split_part(name, '/', 1)
);

-- Add public read access for certain files
CREATE POLICY "public_read_logos" ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'logo');

CREATE POLICY "public_read_profile_pictures" ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile-picture');

-- Investors can view pitch content
CREATE POLICY "investors_read_pitch_decks" ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'pitch-decks'
  AND EXISTS (
    SELECT 1 FROM user_profiles up 
    WHERE up.user_id = auth.uid() 
    AND up.user_type IN ('investor', 'admin')
  )
);

CREATE POLICY "investors_read_pitch_videos" ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'pitch-videos'
  AND EXISTS (
    SELECT 1 FROM user_profiles up 
    WHERE up.user_id = auth.uid() 
    AND up.user_type IN ('investor', 'admin')
  )
);

-- Verify the new policies
SELECT 'New policies created:' as status;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, 
       CASE WHEN length(qual) > 100 THEN left(qual, 100) || '...' ELSE qual END as qual_preview
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;