# Step 3: Fixed cURL Test - Proper Headers
# 
# CRITICAL: Must use apikey + user access token, not project keys
#
# Instructions:
# 1. Go to your app at http://localhost:3000/edit-pitch/55f71cb3-bc99-4fc6-8c44-cfd64d7b5b54
# 2. Open dev tools console
# 3. Try uploading any file to get the console.table output
# 4. Copy the actual user access token from the console output
# 5. Replace <USER_ACCESS_TOKEN> below with that token
# 6. Replace <PUBLISHABLE_KEY> with your publishable key
# 7. Run both commands

# Test 1: Authenticated upload (should succeed if policies allow)
curl -i -X POST \
  "https://mksktpujwwrvndinencl.supabase.co/storage/v1/object/pitch-decks/diag-test-auth.txt" \
  -H "apikey: <PUBLISHABLE_KEY>" \
  -H "Authorization: Bearer <USER_ACCESS_TOKEN>" \
  -H "Content-Type: text/plain" \
  --data-binary "hello from proper authenticated test"

# Test 2: Control - no Authorization (should FAIL with 401/403 or RLS)  
curl -i -X POST \
  "https://mksktpujwwrvndinencl.supabase.co/storage/v1/object/pitch-decks/diag-test-anon.txt" \
  -H "apikey: <PUBLISHABLE_KEY>" \
  -H "Content-Type: text/plain" \
  --data-binary "this must fail - no auth"

# PowerShell versions (if needed):

# Test 1 PowerShell:
# $headers = @{ 
#   "apikey" = "<PUBLISHABLE_KEY>"
#   "Authorization" = "Bearer <USER_ACCESS_TOKEN>"
#   "Content-Type" = "text/plain" 
# }
# Invoke-WebRequest -Uri "https://mksktpujwwrvndinencl.supabase.co/storage/v1/object/pitch-decks/diag-test-auth.txt" -Method POST -Headers $headers -Body "hello from proper test"

# Test 2 PowerShell:
# $headers = @{ 
#   "apikey" = "<PUBLISHABLE_KEY>"
#   "Content-Type" = "text/plain" 
# }
# Invoke-WebRequest -Uri "https://mksktpujwwrvndinencl.supabase.co/storage/v1/object/pitch-decks/diag-test-anon.txt" -Method POST -Headers $headers -Body "this must fail"

# INTERPRETATION:
# - First succeeds + second fails → headers/session correct, proceed to policy work
# - Both fail → check bucket name/path, confirm project URL, verify policies exist