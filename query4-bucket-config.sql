-- Query 4: Check bucket configuration specifically
SELECT id, name, public, allowed_mime_types, avif_autodetection, file_size_limit
FROM storage.buckets 
WHERE id = 'pitch-decks';