-- Complete audit of all storage policies to understand current state
-- This helps us make informed decisions about what to keep/remove

SELECT 
  'CURRENT STORAGE POLICIES:' as section,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY cmd, policyname;

-- Also check what auth context looks like
SELECT 'AUTH CONTEXT:' as section;
SELECT 
  auth.uid() as current_user_id,
  auth.role() as current_role,
  CASE 
    WHEN auth.uid() IS NULL THEN 'NOT AUTHENTICATED'
    ELSE 'AUTHENTICATED'
  END as auth_status;