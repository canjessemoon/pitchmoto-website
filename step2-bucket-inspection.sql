-- STEP 2: Check storage.buckets policies and RLS posture
-- The ultra-permissive objects policy still failed, so something else is blocking

-- 1) RLS posture on both storage tables
SELECT n.nspname AS schema, c.relname AS table,
       c.relrowsecurity AS rls_enabled, c.relforcerowsecurity AS rls_forced
FROM pg_class c 
JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='storage' AND c.relname IN ('objects','buckets');

-- 2) ALL policies on buckets & objects (look for restrictive policies)
SELECT schemaname, tablename, policyname, cmd, permissive, roles, qual, with_check
FROM pg_policies
WHERE schemaname='storage' AND tablename IN ('buckets','objects')
ORDER BY tablename, policyname;

-- 3) Any custom triggers on objects (rare but worth ruling out)
SELECT tgname, tgtype, tgenabled
FROM pg_trigger
WHERE tgrelid = 'storage.objects'::regclass
  AND NOT tgisinternal;

-- 4) Check bucket configuration specifically
SELECT id, name, public, allowed_mime_types, avif_autodetection, file_size_limit
FROM storage.buckets 
WHERE id = 'pitch-decks';

-- 5) Check for any restrictive policies on buckets
SELECT 'Bucket policies:' as check_type;
SELECT schemaname, tablename, policyname, cmd, permissive, roles, qual, with_check
FROM pg_policies
WHERE schemaname='storage' AND tablename='buckets';