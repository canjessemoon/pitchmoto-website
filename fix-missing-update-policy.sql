-- THE REAL FIX: Add UPDATE policy for upsert functionality
-- The file already exists, so upsert tries to UPDATE it, but we only have INSERT policies

-- Add UPDATE policy for authenticated users
CREATE POLICY "tmp_any_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Verify the policy was created
SELECT 'UPDATE policy created successfully' as status;
SELECT schemaname, tablename, policyname, cmd, permissive, roles, qual, with_check
FROM pg_policies
WHERE schemaname='storage' AND tablename='objects' AND policyname='tmp_any_update';