-- Query to see all columns in all tables
-- Run this in your Supabase SQL editor to inspect your database schema

-- Show all columns for the pitches table specifically
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'pitches' 
ORDER BY ordinal_position;

-- Show all columns for the startups table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'startups' 
ORDER BY ordinal_position;

-- Show all tables in your database
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Show all columns for ALL tables (comprehensive view)
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
