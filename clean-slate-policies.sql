-- NUCLEAR OPTION: Drop ALL storage policies and start fresh
-- This ensures no conflicting policies remain

-- Get list of all current policies for reference
SELECT 'Policies to be dropped:' as info;
SELECT policyname FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- Drop ALL policies on storage.objects (nuclear option)
DO $$ 
DECLARE 
    policy_record RECORD;
BEGIN 
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects'
    LOOP 
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON storage.objects';
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP; 
END $$;

-- Verify all policies are gone
SELECT 'Remaining policies after cleanup:' as status;
SELECT COUNT(*) as policy_count 
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- Now create ONLY the minimal policies needed for PitchMoto

-- 1. Founders can manage their startup files (upload, update, delete)
CREATE POLICY "startup_owners_full_access" ON storage.objects
FOR ALL TO authenticated
USING (
  -- Check if user owns the startup in the file path
  (bucket_id IN ('pitch-decks', 'logo', 'pitch-videos')) AND
  EXISTS (
    SELECT 1 FROM startups s 
    WHERE s.founder_id = auth.uid() 
    AND s.id::text = split_part(name, '/', 1)
  )
)
WITH CHECK (
  -- Same check for write operations
  (bucket_id IN ('pitch-decks', 'logo', 'pitch-videos')) AND
  EXISTS (
    SELECT 1 FROM startups s 
    WHERE s.founder_id = auth.uid() 
    AND s.id::text = split_part(name, '/', 1)
  )
);

-- 2. Users can manage their own profile pictures
CREATE POLICY "profile_picture_owner_access" ON storage.objects
FOR ALL TO authenticated
USING (
  bucket_id = 'profile-picture' AND
  auth.uid()::text = split_part(name, '/', 1)
)
WITH CHECK (
  bucket_id = 'profile-picture' AND
  auth.uid()::text = split_part(name, '/', 1)
);

-- 3. Public read access for logos and profile pictures (business requirement)
CREATE POLICY "public_logo_read" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'logo');

CREATE POLICY "public_profile_read" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'profile-picture');

-- 4. Investors can view pitch content (business requirement)
CREATE POLICY "investor_pitch_content_read" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id IN ('pitch-decks', 'pitch-videos') AND
  EXISTS (
    SELECT 1 FROM user_profiles up 
    WHERE up.user_id = auth.uid() 
    AND up.user_type IN ('investor', 'admin')
  )
);

-- Verify final policy state
SELECT 'Final policies created:' as status;
SELECT policyname, cmd, roles, 
       CASE WHEN length(qual) > 80 THEN left(qual, 80) || '...' ELSE qual END as qual_preview
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;