-- Fix Database Schema for PitchMoto (Safe Version)
-- This script creates the user_profiles table that the code expects
-- Run this in your Supabase SQL Editor

-- First, drop existing policies to avoid conflicts
DO $$ 
DECLARE
    pol_name text;
BEGIN
    -- Drop all existing policies for startups
    FOR pol_name IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'startups'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol_name || '" ON startups';
    END LOOP;
    
    -- Drop all existing policies for pitches
    FOR pol_name IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'pitches'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol_name || '" ON pitches';
    END LOOP;
    
    -- Drop all existing policies for upvotes
    FOR pol_name IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'upvotes'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol_name || '" ON upvotes';
    END LOOP;
    
    -- Drop all existing policies for user_profiles
    FOR pol_name IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'user_profiles'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol_name || '" ON user_profiles';
    END LOOP;
END $$;

-- Drop existing tables if they exist (in proper order to handle foreign keys)
DROP TABLE IF EXISTS upvotes CASCADE;
DROP TABLE IF EXISTS pitches CASCADE;
DROP TABLE IF EXISTS startups CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create custom types (if they don't already exist)
DO $$ BEGIN
    CREATE TYPE user_type AS ENUM ('founder', 'investor', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE pitch_type AS ENUM ('text', 'video', 'slide');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'unpaid');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE plan_type AS ENUM ('basic', 'premium');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create user_profiles table (what the code expects)
CREATE TABLE user_profiles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  user_type user_type NOT NULL DEFAULT 'founder',
  bio TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "user_profiles_select_policy" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own profile
CREATE POLICY "user_profiles_insert_policy" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own profile
CREATE POLICY "user_profiles_update_policy" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create startups table
CREATE TABLE IF NOT EXISTS startups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  founder_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  industry TEXT NOT NULL,
  stage TEXT NOT NULL,
  funding_ask BIGINT NOT NULL,
  current_funding BIGINT DEFAULT 0,
  country TEXT,
  pitch_deck_url TEXT,
  logo_url TEXT,
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for startups
ALTER TABLE startups ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read startups
CREATE POLICY "startups_select_policy" ON startups
  FOR SELECT USING (true);

-- Policy: Founders can insert their own startups
CREATE POLICY "startups_insert_policy" ON startups
  FOR INSERT WITH CHECK (
    auth.uid() = founder_id AND 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND user_type = 'founder'
    )
  );

-- Policy: Founders can update their own startups
CREATE POLICY "startups_update_policy" ON startups
  FOR UPDATE USING (auth.uid() = founder_id);

-- Create pitches table
CREATE TABLE IF NOT EXISTS pitches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  startup_id UUID REFERENCES startups(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  pitch_type pitch_type NOT NULL DEFAULT 'text',
  video_url TEXT,
  slide_url TEXT,
  funding_ask BIGINT,
  upvote_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for pitches
ALTER TABLE pitches ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read pitches
CREATE POLICY "pitches_select_policy" ON pitches
  FOR SELECT USING (true);

-- Policy: Startup founders can insert pitches for their startups
CREATE POLICY "pitches_insert_policy" ON pitches
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM startups 
      WHERE id = startup_id AND founder_id = auth.uid()
    )
  );

-- Policy: Startup founders can update pitches for their startups
CREATE POLICY "pitches_update_policy" ON pitches
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM startups 
      WHERE id = startup_id AND founder_id = auth.uid()
    )
  );

-- Create upvotes table
CREATE TABLE IF NOT EXISTS upvotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE NOT NULL,
  pitch_id UUID REFERENCES pitches(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, pitch_id)
);

-- Create RLS policies for upvotes
ALTER TABLE upvotes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all upvotes
CREATE POLICY "upvotes_select_policy" ON upvotes
  FOR SELECT USING (true);

-- Policy: Authenticated users can insert upvotes
CREATE POLICY "upvotes_insert_policy" ON upvotes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own upvotes
CREATE POLICY "upvotes_delete_policy" ON upvotes
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update upvote counts
CREATE OR REPLACE FUNCTION update_pitch_upvote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE pitches SET upvote_count = upvote_count + 1 WHERE id = NEW.pitch_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE pitches SET upvote_count = upvote_count - 1 WHERE id = OLD.pitch_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for upvote count updates
DROP TRIGGER IF EXISTS update_pitch_upvote_count_trigger ON upvotes;
CREATE TRIGGER update_pitch_upvote_count_trigger
  AFTER INSERT OR DELETE ON upvotes
  FOR EACH ROW EXECUTE FUNCTION update_pitch_upvote_count();

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, first_name, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'founder')::user_type
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- Note: Test users will be created when you sign up through the authentication flow
-- The handle_new_user() function will automatically create profiles for new users

COMMIT;
