-- TEMPORARY TEST - Run this for 2 minutes, then revert
-- This will prove if the issue is missing Authorization header

-- Remove auth.uid() requirement temporarily
DROP POLICY IF EXISTS "authenticated_upload_all" ON storage.objects;

CREATE POLICY "tmp_any_insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Test your app upload now - if it works, the issue is missing user token
-- Then immediately run the revert below:

-- REVERT (run this after testing):
-- DROP POLICY IF EXISTS "tmp_any_insert" ON storage.objects;
-- 
-- CREATE POLICY "authenticated_upload_all"
-- ON storage.objects
-- FOR INSERT
-- TO authenticated
-- WITH CHECK (auth.uid() IS NOT NULL);