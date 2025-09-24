-- Temporary script to disable RLS for testing uploads
-- This will help us verify if the upload mechanism works without RLS blocking

-- Disable RLS on storage.objects temporarily
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Check that RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- Note: Remember to re-enable RLS after testing with:
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;