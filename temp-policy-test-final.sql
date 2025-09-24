-- CRITICAL TEST: Remove auth.uid() requirement temporarily
-- This will prove if the issue is with auth context in multipart uploads

-- 1. Remove current policy
DROP POLICY IF EXISTS "authenticated_upload_all" ON storage.objects;

-- 2. Create temporary permissive policy (2 minutes only!)
CREATE POLICY "tmp_test_upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 3. Test your app upload now
-- 4. Then IMMEDIATELY run the revert below:

-- REVERT AFTER TESTING:
-- DROP POLICY IF EXISTS "tmp_test_upload" ON storage.objects;
-- 
-- CREATE POLICY "authenticated_upload_all"
-- ON storage.objects
-- FOR INSERT
-- TO authenticated
-- WITH CHECK (auth.uid() IS NOT NULL);