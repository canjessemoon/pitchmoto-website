-- Query 2: ALL policies on buckets & objects (look for restrictive policies)
SELECT schemaname, tablename, policyname, cmd, permissive, roles, qual, with_check
FROM pg_policies
WHERE schemaname='storage' AND tablename IN ('buckets','objects')
ORDER BY tablename, policyname;