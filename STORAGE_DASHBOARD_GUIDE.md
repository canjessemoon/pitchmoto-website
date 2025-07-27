# Step-by-Step: Create Storage Buckets in Supabase Dashboard

## 🎯 **Step 1: Access Supabase Dashboard**

1. **Open your browser** and go to: https://supabase.com/dashboard
2. **Sign in** to your Supabase account
3. **Find your PitchMoto project** in the project list
4. **Click on your project** (`mksktpujwwrvndinencl`)

---

## 🎯 **Step 2: Navigate to Storage**

1. **Look at the left sidebar** in your project dashboard
2. **Click on "Storage"** (it has a folder icon)
3. You should see a page that says "No buckets" or shows existing buckets

---

## 🎯 **Step 3: Create "profile-pictures" Bucket (First)**

1. **Click the "New bucket" button** (usually green/blue button)
2. **Fill in the bucket details:**

   **Bucket name:** `profile-pictures`
   
   **Make bucket public:** ✅ **CHECK THIS BOX** (very important!)
   
   **File size limit:** `5` (MB)
   
   **Allowed MIME types:** Leave empty for now (we'll set this later)

3. **Click "Create bucket"**
4. You should see the "profile-pictures" bucket appear in your list

---

## 🎯 **Step 4: Create "logos" Bucket**

1. **Click "New bucket" again**
2. **Fill in the bucket details:**

   **Bucket name:** `logos`
   
   **Make bucket public:** ✅ **CHECK THIS BOX**
   
   **File size limit:** `2` (MB)

3. **Click "Create bucket"**

---

## 🎯 **Step 5: Create "pitch-decks" Bucket**

1. **Click "New bucket" again**
2. **Fill in the bucket details:**

   **Bucket name:** `pitch-decks`
   
   **Make bucket public:** ❌ **LEAVE UNCHECKED** (private bucket)
   
   **File size limit:** `50` (MB)

3. **Click "Create bucket"**

---

## 🎯 **Step 6: Create "pitch-videos" Bucket**

1. **Click "New bucket" again**
2. **Fill in the bucket details:**

   **Bucket name:** `pitch-videos`
   
   **Make bucket public:** ❌ **LEAVE UNCHECKED** (private bucket)
   
   **File size limit:** `500` (MB)

3. **Click "Create bucket"**

---

## ✅ **Step 7: Verify All Buckets Created**

You should now see **4 buckets** in your Storage dashboard:

- ✅ **profile-pictures** (Public)
- ✅ **logos** (Public) 
- ✅ **pitch-decks** (Private)
- ✅ **pitch-videos** (Private)

---

## 🧪 **Step 8: Test Profile Picture Upload**

1. **Go back to your test page:** http://localhost:3000/test-storage
2. **Try uploading a profile picture** in the "Profile Picture Upload Test" section
3. **You should now see:** "✅ Profile picture uploaded successfully" instead of "Bucket not found"

---

## 🔧 **Troubleshooting**

### If you still get "Bucket not found":
- **Check bucket name spelling** - must be exactly `profile-pictures` (lowercase, with dash)
- **Refresh your browser** - sometimes the dashboard needs a refresh
- **Wait 30 seconds** - bucket creation might take a moment

### If you can't find the "New bucket" button:
- **Look for a "+" icon** or "Create" button
- **Check you're in the Storage section** (not Database or Auth)
- **Make sure you selected the right project**

### If bucket creation fails:
- **Check your Supabase project isn't paused** (free tier projects auto-pause)
- **Verify you have permissions** to create buckets

---

## 📸 **What You Should See**

**In Storage Dashboard:**
```
Storage
├── profile-pictures (Public)
├── logos (Public)
├── pitch-decks (Private)
└── pitch-videos (Private)
```

**In Test Page After Upload:**
```
✅ Profile picture uploaded successfully: https://[your-project].supabase.co/storage/v1/object/public/profile-pictures/test-user-123/profile-picture.jpg
```

---

**Follow these steps and let me know when you've created the buckets!** 🚀
