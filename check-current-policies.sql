-- Check what policies are currently active
SELECT 'Current storage policies:' as status;

SELECT 
  schemaname,
  tablename, 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
ORDER BY policyname;

-- Also check bucket config to confirm our fix worked
SELECT 'Current bucket config:' as status;
SELECT id, name, public, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'pitch-decks';