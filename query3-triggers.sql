-- Query 3: Any custom triggers on objects (rare but worth ruling out)
SELECT tgname, tgtype, tgenabled
FROM pg_trigger
WHERE tgrelid = 'storage.objects'::regclass
  AND NOT tgisinternal;