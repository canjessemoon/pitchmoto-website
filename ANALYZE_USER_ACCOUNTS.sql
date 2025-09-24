-- Comprehensive User Account Analysis
-- This query shows all users, their roles, profile completeness, and setup status

-- 1. Main user analysis with profile data
SELECT 
    au.id as user_id,
    au.email,
    au.email_confirmed_at,
    au.created_at as auth_created,
    au.last_sign_in_at,
    up.user_type,
    up.full_name,
    up.first_name,
    up.last_name,
    up.bio,
    up.location,
    up.linkedin_url,
    up.website,
    up.profile_image_url,
    up.created_at as profile_created,
    up.updated_at as profile_updated,
    
    -- Status indicators
    CASE 
        WHEN au.email_confirmed_at IS NULL THEN 'Email Not Verified'
        WHEN up.user_id IS NULL THEN 'No Profile Created'
        WHEN up.user_type IS NULL THEN 'No User Type Set'
        WHEN up.full_name IS NULL OR up.full_name = '' THEN 'Profile Incomplete'
        ELSE 'Profile Complete'
    END as account_status,
    
    -- Email verification status
    CASE 
        WHEN au.email_confirmed_at IS NULL THEN '❌ Not Verified'
        ELSE '✅ Verified'
    END as email_status

FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
WHERE au.email LIKE '%jdmoon%' OR au.email LIKE '%testfounder%' OR au.email LIKE '%testinvestor%'
ORDER BY au.created_at DESC;

-- 2. Summary counts by user type
SELECT 
    'SUMMARY' as section,
    up.user_type,
    COUNT(*) as total_accounts,
    COUNT(CASE WHEN au.email_confirmed_at IS NOT NULL THEN 1 END) as verified_emails,
    COUNT(CASE WHEN up.full_name IS NOT NULL AND up.full_name != '' THEN 1 END) as complete_profiles
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
WHERE au.email LIKE '%jdmoon%' OR au.email LIKE '%testfounder%' OR au.email LIKE '%testinvestor%'
GROUP BY up.user_type
ORDER BY up.user_type;

-- 3. Specific test founder accounts (testfounder1-8)
SELECT 
    'TEST FOUNDERS' as section,
    au.email,
    au.email_confirmed_at IS NOT NULL as email_verified,
    up.user_type,
    up.full_name,
    CASE 
        WHEN au.email_confirmed_at IS NULL THEN '❌ Email Not Verified'
        WHEN up.user_id IS NULL THEN '❌ No Profile'
        WHEN up.user_type != 'founder' THEN '⚠️ Wrong User Type'
        WHEN up.full_name IS NULL THEN '⚠️ Incomplete Profile'
        ELSE '✅ Setup Complete'
    END as status
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
WHERE au.email ~ 'jdmoon\+testfounder[1-8]@gmail\.com'
ORDER BY au.email;

-- 4. Check for orphaned profiles (profiles without auth users)
SELECT 
    'ORPHANED PROFILES' as section,
    up.user_id,
    up.email,
    up.user_type,
    up.full_name,
    '⚠️ Profile exists but no auth user' as status
FROM public.user_profiles up
LEFT JOIN auth.users au ON up.user_id = au.id
WHERE au.id IS NULL
AND (up.email LIKE '%jdmoon%' OR up.email LIKE '%testfounder%' OR up.email LIKE '%testinvestor%');

-- 5. Check for duplicate profiles
SELECT 
    'DUPLICATE PROFILES' as section,
    email,
    COUNT(*) as profile_count,
    string_agg(user_id::text, ', ') as user_ids
FROM public.user_profiles
WHERE email LIKE '%jdmoon%' OR email LIKE '%testfounder%' OR email LIKE '%testinvestor%'
GROUP BY email
HAVING COUNT(*) > 1;

-- 6. Investment thesis status for investors
SELECT 
    'INVESTOR THESIS STATUS' as section,
    up.email,
    up.full_name,
    it.id IS NOT NULL as has_thesis,
    it.created_at as thesis_created,
    it.min_funding_ask,
    it.max_funding_ask,
    array_length(it.preferred_industries, 1) as industry_count,
    array_length(it.preferred_stages, 1) as stage_count,
    it.is_active
FROM public.user_profiles up
LEFT JOIN public.investor_theses it ON up.user_id = it.investor_id
WHERE up.user_type = 'investor'
AND (up.email LIKE '%jdmoon%' OR up.email LIKE '%testfounder%' OR up.email LIKE '%testinvestor%')
ORDER BY up.email;

-- 7. Startups created by test founders
SELECT 
    'FOUNDER STARTUPS' as section,
    up.email as founder_email,
    s.name as startup_name,
    s.tagline,
    s.industry,
    s.stage,
    s.funding_ask,
    s.created_at as startup_created,
    COUNT(p.id) as pitch_count
FROM public.user_profiles up
LEFT JOIN public.startups s ON up.user_id = s.founder_id
LEFT JOIN public.pitches p ON s.id = p.startup_id
WHERE up.user_type = 'founder'
AND (up.email LIKE '%jdmoon%' OR up.email LIKE '%testfounder%' OR up.email LIKE '%testinvestor%')
GROUP BY up.email, s.id, s.name, s.tagline, s.industry, s.stage, s.funding_ask, s.created_at
ORDER BY up.email, s.created_at;