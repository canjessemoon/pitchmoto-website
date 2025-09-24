-- Step 5: Clean Policy Reset - Based on Step 2 Auth Success
-- Authentication is working (HAS_TOKEN: true, AUD: 'authenticated')
-- Issue is purely RLS policies, so we'll create minimal working policies

-- 1. Clean slate: Remove ALL existing storage policies
DROP POLICY IF EXISTS "authenticated_upload_all" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_read_own" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to read files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to read files" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_read" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view files" ON storage.objects;

-- 2. Verify policies are gone
SELECT 'Policies after cleanup:' as status;
SELECT count(*) as remaining_policies 
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- 3. Create ONE minimal upload policy - simplest possible
-- This allows ANY authenticated user to upload to ANY bucket
CREATE POLICY "minimal_upload" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 4. Create ONE minimal read policy - simplest possible  
-- This allows ANY authenticated user to read ANY file
CREATE POLICY "minimal_read" ON storage.objects
FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL);

-- 5. Verify the bucket exists and is properly configured
SELECT 'Bucket configuration:' as status;
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets 
WHERE id = 'pitch-decks';

-- 6. Create bucket if it doesn't exist (idempotent)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('pitch-decks', 'pitch-decks', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- 7. Verify final policy state
SELECT 'Final policies:' as status;
SELECT policyname, cmd, roles, 
       CASE WHEN qual IS NULL THEN 'NO USING CONDITION' ELSE qual END as using_condition,
       CASE WHEN with_check IS NULL THEN 'NO WITH CHECK' ELSE with_check END as with_check_condition
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;

-- 8. Test the auth function that our policies use
SELECT 'Auth function test:' as status;
SELECT 
    auth.uid() as current_user_id,
    CASE WHEN auth.uid() IS NOT NULL THEN 'PASS' ELSE 'FAIL' END as policy_check_result;