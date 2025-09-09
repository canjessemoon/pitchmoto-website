-- Migration script to copy existing profiles to user_profiles table
-- Run this in Supabase SQL Editor to migrate your existing data

-- First, check if we have data in the old profiles table
DO $$
DECLARE
    profile_count INTEGER;
BEGIN
    -- Check if profiles table exists and has data
    SELECT COUNT(*) INTO profile_count 
    FROM information_schema.tables 
    WHERE table_name = 'profiles' AND table_schema = 'public';
    
    IF profile_count > 0 THEN
        -- Check if profiles table has actual data
        EXECUTE 'SELECT COUNT(*) FROM profiles' INTO profile_count;
        
        IF profile_count > 0 THEN
            RAISE NOTICE 'Found % existing profiles, migrating to user_profiles...', profile_count;
            
            -- Insert existing profiles into user_profiles table
            INSERT INTO user_profiles (user_id, email, first_name, last_name, user_type, created_at, updated_at)
            SELECT 
                id as user_id,
                email,
                COALESCE(SPLIT_PART(full_name, ' ', 1), '') as first_name,
                CASE 
                    WHEN POSITION(' ' IN COALESCE(full_name, '')) > 0 
                    THEN SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1)
                    ELSE ''
                END as last_name,
                user_type,
                created_at,
                updated_at
            FROM profiles
            WHERE id NOT IN (SELECT user_id FROM user_profiles)
            ON CONFLICT (user_id) DO UPDATE SET
                email = EXCLUDED.email,
                first_name = EXCLUDED.first_name,
                last_name = EXCLUDED.last_name,
                user_type = EXCLUDED.user_type,
                updated_at = EXCLUDED.updated_at;
                
            RAISE NOTICE 'Migration completed successfully!';
        ELSE
            RAISE NOTICE 'Profiles table exists but is empty, no migration needed.';
        END IF;
    ELSE
        RAISE NOTICE 'No profiles table found, no migration needed.';
    END IF;
END $$;

-- Update any user metadata that might be missing
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN 
        SELECT DISTINCT u.id, u.email, u.raw_user_meta_data
        FROM auth.users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        WHERE up.user_id IS NULL
    LOOP
        INSERT INTO user_profiles (user_id, email, first_name, user_type)
        VALUES (
            user_record.id,
            user_record.email,
            COALESCE(user_record.raw_user_meta_data->>'first_name', ''),
            COALESCE(user_record.raw_user_meta_data->>'user_type', 'founder')::user_type
        )
        ON CONFLICT (user_id) DO NOTHING;
    END LOOP;
END $$;

-- Verify the migration
SELECT 
    'Migration Summary' as status,
    (SELECT COUNT(*) FROM user_profiles) as total_user_profiles,
    (SELECT COUNT(*) FROM auth.users) as total_auth_users,
    (SELECT COUNT(*) FROM auth.users u 
     LEFT JOIN user_profiles up ON u.id = up.user_id 
     WHERE up.user_id IS NULL) as users_without_profiles;

COMMIT;
