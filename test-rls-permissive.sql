-- STEP 1: Make RLS definitively permissive for INSERT (2-3 minutes)
-- This isolates "missing user context" vs. everything else

-- Remove current INSERT policy
DROP POLICY IF EXISTS "authenticated_upload_all" ON storage.objects;

-- Ultra-permissive INSERT for authenticated users
CREATE POLICY "tmp_any_insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Verify the policy was created
SELECT 'Policy created successfully' as status;
SELECT schemaname, tablename, policyname, cmd, permissive, roles, qual, with_check
FROM pg_policies
WHERE schemaname='storage' AND tablename='objects' AND policyname='tmp_any_insert';