-- Quick database check queries
-- Run these in Supabase SQL editor to see current data

-- Check existing users and their roles
SELECT id, email, created_at, 
       profiles.full_name, profiles.role, profiles.subscription_tier
FROM auth.users 
LEFT JOIN public.profiles ON auth.users.id = profiles.id
ORDER BY created_at DESC;

-- Check existing startups
SELECT id, name, tagline, sector, founder_id, created_at
FROM startups
ORDER BY created_at DESC;

-- Check existing pitches
SELECT p.id, p.title, p.sector, p.stage, p.funding_ask, p.upvote_count, p.status,
       s.name as startup_name
FROM pitches p
JOIN startups s ON p.startup_id = s.id
ORDER BY p.created_at DESC;

-- Check upvotes
SELECT u.id, u.created_at, p.title as pitch_title, pr.full_name as voter_name
FROM upvotes u
JOIN pitches p ON u.pitch_id = p.id
JOIN profiles pr ON u.user_id = pr.id
ORDER BY u.created_at DESC;

-- Check comments
SELECT c.id, c.content, c.created_at, p.title as pitch_title, pr.full_name as commenter_name
FROM comments c
JOIN pitches p ON c.pitch_id = p.id
JOIN profiles pr ON c.user_id = pr.id
ORDER BY c.created_at DESC;
