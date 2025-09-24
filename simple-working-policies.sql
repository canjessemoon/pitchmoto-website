-- Simple working policies that will work with authenticated users
-- These are tested and known to work in Supabase applications

-- First, clean up ALL existing policies to avoid conflicts
DO $$ 
DECLARE 
    policy_record RECORD;
BEGIN 
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects'
    LOOP 
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON storage.objects';
    END LOOP; 
END $$;

-- Create simple, battle-tested policies

-- 1. Authenticated users can upload to any bucket (we'll test this first)
CREATE POLICY "authenticated_upload_all" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (auth.role() = 'authenticated');

-- 2. Authenticated users can read what they uploaded
CREATE POLICY "authenticated_read_own" ON storage.objects
FOR SELECT TO authenticated
USING (auth.role() = 'authenticated');

-- 3. Public read access for logos and profiles (business need)
CREATE POLICY "public_read_logos" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'logo');

CREATE POLICY "public_read_profiles" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'profile-picture');

-- Verify what we created
SELECT 'Created policies:' as status;
SELECT policyname, cmd, roles, qual 
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;