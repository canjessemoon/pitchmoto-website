-- Step 4: SQL Snapshots - Comprehensive RLS and Storage Policy Analysis
-- This will show us exactly what policies exist and why uploads are failing

-- 1. Check if RLS is enabled on storage.objects
SELECT 'RLS Status on storage.objects:' as section;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- 2. List ALL policies on storage.objects
SELECT 'All Policies on storage.objects:' as section;
SELECT 
    policyname,
    cmd as command_type,
    permissive,
    roles,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;

-- 3. Check storage.buckets policies (bucket-level restrictions)
SELECT 'Bucket Policies:' as section;
SELECT 
    policyname,
    cmd as command_type,
    permissive,
    roles,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'buckets'
ORDER BY policyname;

-- 4. List all storage buckets and their settings
SELECT 'Storage Buckets:' as section;
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets;

-- 5. Check for any objects in pitch-decks bucket
SELECT 'Existing Objects in pitch-decks bucket:' as section;
SELECT name, bucket_id, owner, created_at 
FROM storage.objects 
WHERE bucket_id = 'pitch-decks' 
LIMIT 5;

-- 6. Test auth functions that policies might be using
SELECT 'Auth Function Tests:' as section;
SELECT 
    'auth.uid()' as function_name,
    auth.uid() as current_value
UNION ALL
SELECT 
    'auth.role()' as function_name,
    auth.role() as current_value;

-- 7. Check if authenticated role exists and what it can do
SELECT 'Role Information:' as section;
SELECT rolname, rolsuper, rolcreaterole, rolcreatedb, rolcanlogin 
FROM pg_roles 
WHERE rolname IN ('authenticated', 'anon', 'service_role');

-- 8. Check grants on storage schema
SELECT 'Storage Schema Grants:' as section;
SELECT grantee, privilege_type, is_grantable
FROM information_schema.schema_privileges 
WHERE schema_name = 'storage';

-- 9. Check specific table grants
SELECT 'Storage Objects Table Grants:' as section;
SELECT grantee, privilege_type, is_grantable
FROM information_schema.table_privileges 
WHERE table_schema = 'storage' AND table_name = 'objects';