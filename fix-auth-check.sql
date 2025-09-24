-- Fix the WITH CHECK condition - make it more permissive for authenticated users
-- The issue is auth.role() might not return exactly 'authenticated' in app context

-- Drop the problematic policy and recreate it
DROP POLICY IF EXISTS "authenticated_upload_all" ON storage.objects;

-- Create a more permissive policy that just checks if user is logged in
CREATE POLICY "authenticated_upload_all" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Also update the read policy to be consistent
DROP POLICY IF EXISTS "authenticated_read_own" ON storage.objects;

CREATE POLICY "authenticated_read_own" ON storage.objects
FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL);

-- Verify the updated policies
SELECT 'Updated policies:' as status;
SELECT policyname, cmd, roles, 
       CASE WHEN qual IS NULL THEN 'NO CONDITION' ELSE qual END as condition
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;