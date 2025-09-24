-- Quick Account Status Check for Missing testfounder accounts and investors
-- Run this in Supabase SQL Editor

-- 1. Check ALL auth.users accounts with jdmoon emails
SELECT 
    'AUTH USERS' as section,
    au.email,
    au.email_confirmed_at IS NOT NULL as verified,
    au.created_at,
    up.user_type,
    up.full_name,
    CASE 
        WHEN up.user_id IS NULL THEN '❌ No Profile'
        WHEN up.user_type IS NULL THEN '⚠️ No User Type' 
        ELSE '✅ Has Profile'
    END as profile_status
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
WHERE au.email LIKE '%jdmoon%'
ORDER BY au.email;

-- 2. Check for testfounder1-8 specifically
SELECT 
    'TESTFOUNDER 1-8 CHECK' as section,
    generate_series(1,8) as founder_number,
    CASE 
        WHEN au.email IS NOT NULL THEN '✅ Auth User Exists'
        ELSE '❌ Missing Auth User'
    END as auth_status,
    CASE 
        WHEN up.user_id IS NOT NULL THEN '✅ Profile Exists' 
        ELSE '❌ Missing Profile'
    END as profile_status,
    au.email_confirmed_at IS NOT NULL as verified,
    up.user_type
FROM generate_series(1,8) gs(founder_number)
LEFT JOIN auth.users au ON au.email = 'jdmoon+testfounder' || gs.founder_number || '@gmail.com'
LEFT JOIN public.user_profiles up ON au.id = up.user_id
ORDER BY founder_number;

-- 3. Check investor accounts specifically
SELECT 
    'INVESTOR ACCOUNTS' as section,
    up.email,
    up.full_name,
    up.created_at as profile_created,
    au.email_confirmed_at IS NOT NULL as email_verified,
    it.id IS NOT NULL as has_thesis,
    it.is_active as thesis_active
FROM public.user_profiles up
LEFT JOIN auth.users au ON up.user_id = au.id
LEFT JOIN public.investor_theses it ON up.user_id = it.investor_id AND it.is_active = true
WHERE up.user_type = 'investor'
AND (up.email LIKE '%jdmoon%' OR up.email LIKE '%testinvestor%')
ORDER BY up.email;

-- 4. Summary of what we have
SELECT 
    'SUMMARY' as section,
    COUNT(CASE WHEN au.email LIKE '%testfounder%' THEN 1 END) as total_testfounder_auth,
    COUNT(CASE WHEN up.email LIKE '%testfounder%' AND up.user_type = 'founder' THEN 1 END) as testfounder_profiles,
    COUNT(CASE WHEN up.user_type = 'investor' AND up.email LIKE '%jdmoon%' THEN 1 END) as investor_profiles,
    COUNT(CASE WHEN it.id IS NOT NULL THEN 1 END) as investor_theses
FROM auth.users au
FULL OUTER JOIN public.user_profiles up ON au.id = up.user_id
LEFT JOIN public.investor_theses it ON up.user_id = it.investor_id AND it.is_active = true
WHERE au.email LIKE '%jdmoon%' OR up.email LIKE '%jdmoon%';