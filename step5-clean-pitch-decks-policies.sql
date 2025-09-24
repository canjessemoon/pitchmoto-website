-- Step 5: Clean Policy Reset for pitch-decks bucket
-- Based on expert review - bucket-only policies, no owner scoping yet

-- 1. Wipe ALL policies on storage.objects (idempotent)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN (
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', r.policyname);
  END LOOP;
END$$;

-- 2. Ensure RLS enabled (but NOT forced - forced + restrictive = denial)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects DISABLE FORCE ROW LEVEL SECURITY;

-- 3. Verify cleanup
SELECT 'Policies after cleanup:' as status;
SELECT count(*) as remaining_policies 
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- 4. Create minimal bucket-only policies for pitch-decks
-- These allow ANY authenticated user to work with pitch-decks bucket

-- READ
CREATE POLICY "obj_select_pitch_decks_auth"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'pitch-decks');

-- INSERT (the critical one for your upload)
CREATE POLICY "obj_insert_pitch_decks_auth"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'pitch-decks');

-- UPDATE (optional)
CREATE POLICY "obj_update_pitch_decks_auth"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'pitch-decks')
WITH CHECK (bucket_id = 'pitch-decks');

-- DELETE (optional)
CREATE POLICY "obj_delete_pitch_decks_auth"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'pitch-decks');

-- 5. Ensure proper grants (usually already present, make explicit)
GRANT USAGE ON SCHEMA storage TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE storage.objects TO anon, authenticated;

-- 6. Ensure pitch-decks bucket exists with proper config
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('pitch-decks', 'pitch-decks', false, 52428800, 
        ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- 7. Verify final state
SELECT 'Final Policies:' as status;
SELECT 
  policyname, 
  cmd, 
  permissive,   -- Should all be 'true' now
  roles, 
  CASE WHEN qual IS NULL THEN 'NO USING' ELSE qual END as using_condition,
  CASE WHEN with_check IS NULL THEN 'NO WITH CHECK' ELSE with_check END as with_check_condition
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;

SELECT 'Bucket Status:' as status;
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id = 'pitch-decks';