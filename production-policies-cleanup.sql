-- PRODUCTION CLEANUP: Replace temporary policies with proper bucket-scoped ones
-- Remove all temporary policies and create secure, production-ready ones

-- 1) Clean up temporary policies
DROP POLICY IF EXISTS "tmp_any_insert" ON storage.objects;
DROP POLICY IF EXISTS "tmp_test_upload" ON storage.objects;
DROP POLICY IF EXISTS "tmp_any_update" ON storage.objects;

-- 2) Create production-ready policies for pitch-decks bucket only

-- Allow authenticated users to read bucket metadata (keep this one as-is)
-- Policy "buckets_select_auth" already exists and is correct

-- Objects: INSERT policy (bucket-scoped for security)
CREATE POLICY "pitch_decks_insert_auth"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'pitch-decks');

-- Objects: UPDATE policy (bucket-scoped for security)  
CREATE POLICY "pitch_decks_update_auth"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'pitch-decks')
WITH CHECK (bucket_id = 'pitch-decks');

-- Objects: SELECT policy for reading own files (already exists as "authenticated_read_own")
-- No need to change the existing read policy

-- 3) Verify the new policies
SELECT 'Production policies created successfully' as status;
SELECT schemaname, tablename, policyname, cmd, permissive, roles, qual, with_check
FROM pg_policies
WHERE schemaname='storage' 
  AND tablename IN ('buckets','objects')
  AND policyname IN ('buckets_select_auth', 'pitch_decks_insert_auth', 'pitch_decks_update_auth', 'authenticated_read_own')
ORDER BY tablename, policyname;