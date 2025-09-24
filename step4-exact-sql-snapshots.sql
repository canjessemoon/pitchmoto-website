-- Step 4: SQL Snapshots - Exact diagnostic queries
-- Run these in Supabase SQL Editor and save outputs

-- 1. RLS Posture Check
SELECT 'RLS Posture:' as section;
SELECT 
  n.nspname as schema, 
  c.relname as table, 
  c.relrowsecurity as rls_enabled, 
  c.relforcerowsecurity as rls_forced
FROM pg_class c 
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'storage' AND c.relname IN ('objects', 'buckets');

-- 2. All Existing Policies (the real culprits)
SELECT 'Existing Policies:' as section;
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd, 
  permissive,   -- CRITICAL: if any are 'false', they AND with others
  roles, 
  qual, 
  with_check
FROM pg_policies
WHERE schemaname = 'storage' AND tablename IN ('objects', 'buckets')
ORDER BY tablename, policyname;

-- 3. Bucket Configuration
SELECT 'Bucket Configuration:' as section;
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets 
WHERE id = 'pitch-decks';

-- 4. Test auth functions in current SQL context
SELECT 'Auth Function Tests:' as section;
SELECT 
  auth.uid() as current_user_id,
  auth.role() as current_role,
  CASE WHEN auth.uid() IS NOT NULL THEN 'HAS_USER' ELSE 'NO_USER' END as auth_status;