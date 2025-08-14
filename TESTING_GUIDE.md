# Testing Guide: Upvoting & Discovery Functionality

## 🚀 Quick Start Testing

### Prerequisites
1. **Dev Server Running**: `npm run dev` (should be on http://localhost:3000)
2. **Database Setup**: Supabase database with tables created
3. **Test Data**: Sample pitches and users (see test-data.sql)

## 📋 Step-by-Step Testing Process

### Step 1: Create Test Users
1. **Create Founder Account**:
   - Go to http://localhost:3000/signup/founder/enhanced
   - Complete the 4-step signup process
   - Note the user ID from the success page or dashboard

2. **Create Investor Account**:
   - Go to http://localhost:3000/signup/investor/enhanced
   - Complete the 3-step signup process (choose paid tier for full access)
   - Note the user ID from the success page or dashboard

### Step 2: Add Test Data
1. **Open Supabase Dashboard**: https://supabase.com/dashboard
2. **Go to SQL Editor** in your project
3. **Update test-data.sql**:
   - Replace `'your-founder-user-id'` with actual founder user ID
   - Run the SQL script to create sample startups and pitches

4. **Update User Roles** (if needed):
   ```sql
   -- Make user an investor
   UPDATE profiles SET role = 'investor', subscription_tier = 'paid' 
   WHERE id = 'your-investor-user-id';
   
   -- Make user a founder
   UPDATE profiles SET role = 'founder' 
   WHERE id = 'your-founder-user-id';
   ```

### Step 3: Test Discovery Page
1. **Visit Discovery**: http://localhost:3000/discovery
2. **Test Features**:
   - ✅ View pitch cards with logos, names, taglines
   - ✅ See upvote counts and trending badges
   - ✅ Use search box to filter by keywords
   - ✅ Filter by sector (Technology, Energy, Healthcare)
   - ✅ Filter by location, stage, country
   - ✅ Switch between "Trending" and "Newest" sort
   - ✅ Test pagination if you have 20+ pitches

### Step 4: Test Pitch Detail Page
1. **Click on any pitch** from discovery page
2. **Test Features**:
   - ✅ View full pitch content with rich formatting
   - ✅ See highlighted funding ask amount
   - ✅ Test upvote button (heart icon)
   - ✅ Test "Save to Watchlist" button
   - ✅ View comment section at bottom
   - ✅ Test "Message Founder" button (paid investors only)

### Step 5: Test Upvoting System
**As an Investor**:
1. **Click upvote button** on any pitch
2. **Verify**:
   - ✅ Heart fills in and turns red
   - ✅ Count increases by 1
   - ✅ Button shows "Remove upvote" on hover
3. **Click again** to remove upvote
4. **Verify**:
   - ✅ Heart empties and turns gray
   - ✅ Count decreases by 1
   - ✅ Button shows "Upvote this pitch" on hover

**As a Founder or Non-logged-in User**:
1. **Try to upvote**
2. **Verify**:
   - ✅ Button is disabled/grayed out
   - ✅ Tooltip shows appropriate message
   - ✅ No action occurs on click

### Step 6: Test Comment System
**As Any Logged-in User**:
1. **Scroll to comments section** on pitch detail page
2. **Add a comment**:
   - ✅ Type in textarea
   - ✅ Click "Post Comment"
   - ✅ Comment appears immediately
3. **Edit your comment**:
   - ✅ Click edit icon on your comment
   - ✅ Modify text and save
   - ✅ Changes appear with "(edited)" label
4. **Delete your comment**:
   - ✅ Click delete icon
   - ✅ Confirm deletion
   - ✅ Comment disappears

**As Non-logged-in User**:
1. **View comments section**
2. **Verify**:
   - ✅ See "Please log in to comment" message
   - ✅ "Log In to Comment" button appears
   - ✅ Can view existing comments but not post

### Step 7: Test Watchlist Functionality
**As an Investor**:
1. **Click "Save to Watchlist"** on pitch detail page
2. **Verify**:
   - ✅ Button changes to "Saved" with yellow color
   - ✅ Bookmark icon fills in
3. **Click again** to remove from watchlist
4. **Verify**:
   - ✅ Button returns to "Save to Watchlist"
   - ✅ Bookmark icon empties

### Step 8: Test Search & Filters
**On Discovery Page**:
1. **Search Test**:
   - ✅ Type "AI" → should show TechFlow AI
   - ✅ Type "solar" → should show GreenEnergy Solutions
   - ✅ Type "health" → should show HealthTrack Pro

2. **Filter Test**:
   - ✅ Select "Technology" sector → shows only tech pitches
   - ✅ Select "Energy" sector → shows only energy pitches
   - ✅ Type "San Francisco" in location → shows relevant pitches
   - ✅ Select "Series A" stage → shows only Series A pitches

3. **Sort Test**:
   - ✅ "Trending" → pitches ordered by upvote count (highest first)
   - ✅ "Newest" → pitches ordered by creation date (newest first)

## 🐛 Troubleshooting Common Issues

### API Errors
- **500 errors**: Check Supabase connection in browser dev tools
- **403 errors**: Verify user roles are set correctly
- **404 errors**: Ensure test data was inserted properly

### UI Issues
- **Components not loading**: Check browser console for errors
- **Buttons not working**: Verify user authentication status
- **Data not showing**: Check network tab for API responses

### Database Issues
- **No pitches showing**: Ensure `status = 'published'` on test data
- **Upvotes not working**: Verify upvote functions were created
- **Comments not appearing**: Check user authentication

## 📊 Expected Test Results

### Discovery Page Should Show:
- 3 sample pitches with different sectors
- Upvote counts (23, 18, 31)
- Trending badge on HealthTrack Pro (31 upvotes)
- Filtering and search working correctly

### Pitch Detail Page Should Show:
- Full rich content formatting
- Interactive upvote and watchlist buttons
- Comment section with user avatars
- Proper role-based permissions

### API Endpoints Should Return:
- `GET /api/discovery` → Filtered pitch list
- `POST /api/upvotes` → Success message
- `POST /api/comments` → New comment object
- `GET /api/watchlist` → Watchlist status

## 🎯 Success Criteria

✅ **All functionality works without errors**
✅ **Role-based permissions are enforced**
✅ **Real-time updates work (upvotes, comments)**
✅ **Search and filtering return correct results**
✅ **UI is responsive and user-friendly**
✅ **Database operations complete successfully**

## 🔧 Advanced Testing

### Performance Testing
- Add 50+ pitches and test pagination
- Test search with large datasets
- Verify loading states work properly

### Edge Case Testing
- Try to upvote same pitch multiple times
- Test with very long comments (2000+ chars)
- Test with special characters in search
- Test with empty search results

### Security Testing
- Try to access investor-only features as founder
- Attempt to edit other users' comments
- Test API endpoints directly with different user tokens
