-- Query 1: RLS posture on both storage tables
SELECT n.nspname AS schema, c.relname AS table,
       c.relrowsecurity AS rls_enabled, c.relforcerowsecurity AS rls_forced
FROM pg_class c 
JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='storage' AND c.relname IN ('objects','buckets');