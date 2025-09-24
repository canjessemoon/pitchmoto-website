-- Check what policies are currently active and test direct database insert
-- Step 1: See all current policies
SELECT schemaname, tablename, policyname, cmd, permissive, roles, qual, with_check
FROM pg_policies
WHERE schemaname='storage' AND tablename IN ('buckets','objects')
ORDER BY tablename, policyname;

-- Step 2: Test if we can manually insert into storage.objects (this should work with our permissive policy)
-- First check if path already exists
SELECT id, bucket_id, name, owner, created_at 
FROM storage.objects 
WHERE bucket_id = 'pitch-decks' AND name LIKE '%7f30e44b-fb7e-48cb-9941-1c964cafc3a7%'
ORDER BY created_at DESC;

-- Step 3: Check bucket access
SELECT id, name, public, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'pitch-decks';