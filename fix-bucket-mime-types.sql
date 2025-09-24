-- FIX: Update bucket to allow PDF and image uploads
-- The bucket currently has allowed_mime_types: null which blocks ALL file types

UPDATE storage.buckets 
SET allowed_mime_types = ARRAY[
  'application/pdf',
  'image/jpeg', 
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
]
WHERE id = 'pitch-decks';

-- Verify the fix
SELECT 'Updated Bucket:' as status;
SELECT id, name, public, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'pitch-decks';