-- Deep audit: Find ALL constraints blocking storage uploads
-- This will reveal hidden policies, triggers, or other restrictions

-- 1. Check for ANY policies on storage.buckets (missed earlier)
SELECT 'Bucket Policies:' as section;
SELECT schemaname, tablename, policyname, cmd, permissive, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'buckets';

-- 2. Check if RLS is FORCED (overrides permissive policies)
SELECT 'RLS Status:' as section;
SELECT 
  n.nspname as schema, 
  c.relname as table, 
  c.relrowsecurity as rls_enabled, 
  c.relforcerowsecurity as rls_forced
FROM pg_class c 
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'storage' AND c.relname IN ('objects', 'buckets');

-- 3. Check for database triggers that might block inserts
SELECT 'Triggers on storage.objects:' as section;
SELECT trigger_name, event_manipulation, action_timing, action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'storage' AND event_object_table = 'objects';

-- 4. Check current active policies after our change
SELECT 'Current Active Policies:' as section;
SELECT schemaname, tablename, policyname, cmd, permissive, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;

-- 5. Test if bucket exists and is accessible
SELECT 'Bucket Check:' as section;
SELECT id, name, public, owner, file_size_limit, allowed_mime_types
FROM storage.buckets 
WHERE id = 'pitch-decks';