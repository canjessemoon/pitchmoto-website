-- THE FIX: Allow authenticated users to read bucket metadata
-- storage.buckets has RLS enabled but NO policies, so Storage API can't SELECT bucket rows

-- Allow authenticated users to read bucket rows
-- Drop policy if it exists, then create it
DROP POLICY IF EXISTS "buckets_select_auth" ON storage.buckets;

CREATE POLICY "buckets_select_auth"
ON storage.buckets
FOR SELECT
TO authenticated
USING (true);

-- Verify the policy was created
SELECT 'Bucket read policy created successfully' as status;
SELECT schemaname, tablename, policyname, cmd, permissive, roles, qual, with_check
FROM pg_policies
WHERE schemaname='storage' AND tablename='buckets' AND policyname='buckets_select_auth';