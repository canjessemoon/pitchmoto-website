-- Step 5: Minimal Bucket-Scoped Policies (proven-good approach)
-- Prove green first, then tighten

-- Enable RLS but not forced (allows policies to work)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects DISABLE FORCE ROW LEVEL SECURITY;

-- Clean slate: Remove ALL existing storage policies
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

-- Verify cleanup
SELECT 'Policies after cleanup:' as status;
SELECT count(*) as remaining_policies 
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- Create minimal bucket-scoped policies (replace pitch-decks with your bucket)
CREATE POLICY "obj_select_bucket_auth"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'pitch-decks');

CREATE POLICY "obj_insert_bucket_auth"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'pitch-decks');

-- Optional: update and delete policies
CREATE POLICY "obj_update_bucket_auth"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'pitch-decks')
WITH CHECK (bucket_id = 'pitch-decks');

CREATE POLICY "obj_delete_bucket_auth"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'pitch-decks');

-- Ensure bucket exists with proper config
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('pitch-decks', 'pitch-decks', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Verify final state
SELECT 'Final Policies:' as status;
SELECT 
  policyname, 
  cmd, 
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