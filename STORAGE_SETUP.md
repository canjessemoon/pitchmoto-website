# Supabase Storage Setup Guide

## Step 1: Create Storage Buckets in Supabase Dashboard

### Go to Supabase Dashboard
1. Visit: https://supabase.com/dashboard
2. Select your project: `mksktpujwwrvndinencl`
3. Go to **Storage** in the left sidebar

### Create These Buckets

#### 1. **avatars** bucket
- **Name**: `avatars`
- **Public**: ✅ **Yes** (for profile pictures)
- **File size limit**: 5MB
- **Allowed file types**: image/jpeg, image/png, image/webp

#### 2. **logos** bucket  
- **Name**: `logos`
- **Public**: ✅ **Yes** (for startup logos)
- **File size limit**: 2MB
- **Allowed file types**: image/jpeg, image/png, image/svg+xml, image/webp

#### 3. **pitch-decks** bucket
- **Name**: `pitch-decks`
- **Public**: ❌ **No** (private - only accessible to investors)
- **File size limit**: 50MB
- **Allowed file types**: application/pdf

#### 4. **pitch-videos** bucket
- **Name**: `pitch-videos`
- **Public**: ❌ **No** (private - only accessible to investors)
- **File size limit**: 500MB
- **Allowed file types**: video/mp4, video/webm, video/quicktime

### Step 2: Configure Storage Policies

For each bucket, set up Row Level Security policies:

**avatars & logos (public buckets):**
```sql
-- Allow authenticated users to upload their own files
CREATE POLICY "Users can upload their own avatars" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public access to view avatars
CREATE POLICY "Public can view avatars" ON storage.objects FOR SELECT USING (
  bucket_id = 'avatars'
);
```

**pitch-decks & pitch-videos (private buckets):**
```sql
-- Only founders can upload to their startup folders
CREATE POLICY "Founders can upload pitch files" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id IN ('pitch-decks', 'pitch-videos') AND 
  EXISTS (
    SELECT 1 FROM startups 
    WHERE founder_id = auth.uid() 
    AND id::text = (storage.foldername(name))[1]
  )
);

-- Investors can view pitch files
CREATE POLICY "Investors can view pitch files" ON storage.objects FOR SELECT USING (
  bucket_id IN ('pitch-decks', 'pitch-videos') AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type IN ('investor', 'admin'))
);
```

## Next Steps
After creating buckets in dashboard, we'll add the storage utilities and upload components to the codebase.
