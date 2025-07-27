-- Check Supabase Auth Configuration
-- Run these queries in Supabase SQL Editor to check auth settings

-- 1. Check if email confirmation is required for password updates
SELECT 
    raw_app_meta_data,
    raw_user_meta_data,
    email_confirmed_at,
    confirmation_sent_at
FROM auth.users 
WHERE email = 'jdmoon@gmail.com';

-- 2. Check auth configuration (if accessible)
-- This might not work depending on your Supabase permissions
-- SELECT * FROM auth.config;

-- 3. Check if there are any auth audit logs
SELECT 
    id,
    payload,
    error_message,
    created_at
FROM auth.audit_log_entries 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC
LIMIT 10;
