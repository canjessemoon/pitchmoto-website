-- Restore proper RLS policy now that mime types are fixed
-- Replace the temporary policy with a proper bucket-scoped policy

-- Remove temporary policy
DROP POLICY IF EXISTS "tmp_test_upload" ON storage.objects;

-- Create proper bucket-scoped policy (more secure than auth.uid())
CREATE POLICY "pitch_decks_authenticated_upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'pitch-decks');

-- Verify the final policy
SELECT 'Final Policy:' as status;
SELECT policyname, cmd, roles, with_check
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'pitch_decks_authenticated_upload';