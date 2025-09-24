# Step 3: Exact cURL Test for pitch-decks bucket
# Based on your console output showing perfect authenticated token

# CRITICAL: Get the USER ACCESS TOKEN first
# 1. In your browser console, right after the upload attempt, run:
#    const { data: session } = await supabase.auth.getSession()
#    console.log('USER_TOKEN:', session?.session?.access_token)
# 2. Copy that token and replace <USER_ACCESS_TOKEN> below

# PowerShell Test 1: Authenticated upload (should succeed if policies allow)
$headers1 = @{
    "apikey" = "sb_publishable_en7oBtMUR3Ai1Jxa0Nt0hg_vWMrxSkM"
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsImtpZCI6IjNWdzQ5SzVURXRRZ0VnbjgiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL21rc2t0cHVqd3dydm5kaW5lbmNsLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJmNjZlYTZkNi1hMDg2LTRjNmMtYTJjYS1iNzVlYjA0OGRkYjAiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU4MjEwNzIwLCJpYXQiOjE3NTgyMDcxMjAsImVtYWlsIjoiamRtb29uK3Rlc3Rmb3VuZGVyMTBAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbCI6ImpkbW9vbit0ZXN0Zm91bmRlcjEwQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmdWxsX25hbWUiOiJUZXN0IEZvdW5kZXIxMCIsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiZjY2ZWE2ZDYtYTA4Ni00YzZjLWEyY2EtYjc1ZWIwNDhkZGIwIiwidXNlcl90eXBlIjoiZm91bmRlciJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzU4MjA3MTIwfV0sInNlc3Npb25faWQiOiI4ZmIxZjJhOS0wYWJmLTRlYzktOTdlYy1iNzE5Y2I4ZjZmZmYiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.VT4gz-x64JriM44lYDT2i3UKEzzhp64G0dwmNcqPY4A"
    "Content-Type" = "application/pdf"
}

try {
    $response1 = Invoke-WebRequest -Uri "https://mksktpujwwrvndinencl.supabase.co/storage/v1/object/pitch-decks/test-auth.pdf" -Method POST -Headers $headers1 -Body "fake pdf content"
    Write-Host "✅ Authenticated upload SUCCESS: $($response1.StatusCode)"
} catch {
    Write-Host "❌ Authenticated upload FAILED: $($_.Exception.Response.StatusCode)"
    Write-Host "Error details: $($_.Exception.Message)"
}

# PowerShell Test 2: Control - no Authorization (should FAIL)
$headers2 = @{
    "apikey" = "sb_publishable_en7oBtMUR3Ai1Jxa0Nt0hg_vWMrxSkM"
    "Content-Type" = "application/pdf"
}

try {
    $response2 = Invoke-WebRequest -Uri "https://mksktpujwwrvndinencl.supabase.co/storage/v1/object/pitch-decks/test-anon.pdf" -Method POST -Headers $headers2 -Body "fake pdf content"
    Write-Host "❌ Anon upload UNEXPECTEDLY SUCCEEDED: $($response2.StatusCode)"
} catch {
    Write-Host "✅ Anon upload correctly FAILED: $($_.Exception.Response.StatusCode)"
}

# INTERPRETATION:
# - First succeeds + second fails → headers/session correct, proceed to policy work
# - Both fail → check bucket name/path, confirm policies exist and that RLS is enabled