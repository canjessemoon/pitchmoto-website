# Test direct upload to isolate the issue
$token = "eyJhbGciOiJIUzI1NiIsImtpZCI6IjNWdzQ5SzVURXRRZ0VnbjgiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL21rc2t0cHVqd3dydm5kaW5lbmNsLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJmNjZlYTZkNi1hMDg2LTRjNmMtYTJjYS1iNzVlYjA0OGRkYjAiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU4MjE0MjEzLCJpYXQiOjE3NTgyMTA2MTMsImVtYWlsIjoiamRtb29uK3Rlc3Rmb3VuZGVyMTBAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbCI6ImpkbW9vbit0ZXN0Zm91bmRlcjEwQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmdWxsX25hbWUiOiJUZXN0IEZvdW5kZXIxMCIsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiZjY2ZWE2ZDYtYTA4Ni00YzZjLWEyY2EtYjc1ZWIwNDhkZGIwIiwidXNlcl90eXBlIjoiZm91bmRlciJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzU4MjA3MTIwfV0sInNlc3Npb25faWQiOiI4ZmIxZjJhOS0wYWJmLTRlYzktOTdlYy1iNzE5Y2I4ZjZmZmYiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.RVt3uria1sGTT_e2QDZ19U9hTaPYSS-3VTvP0F3_q6Y"

$headers = @{
    "apikey" = "sb_publishable_en7oBtMUR3Ai1Jxa0Nt0hg_vWMrxSkM"
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/pdf"
    "x-upsert" = "true"
}

Write-Host "🔍 Testing post-SQL-fix upload..."
Write-Host "Uploading to exact same path that app uses..."

try {
    $response = Invoke-WebRequest -Uri "https://mksktpujwwrvndinencl.supabase.co/storage/v1/object/pitch-decks/7f30e44b-fb7e-48cb-9941-1c964cafc3a7/pitch-deck.pdf" -Method POST -Headers $headers -Body "test pdf content for post-fix verification"
    Write-Host "✅ SUCCESS: $($response.StatusCode) - $($response.StatusDescription)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Response.StatusCode)"
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $responseText = $reader.ReadToEnd()
    Write-Host "Error Response: $responseText"
    Write-Host ""
    Write-Host "🔍 Full error details:"
    Write-Host $_.Exception
}

Write-Host ""
Write-Host "🔍 Now testing simple path (no folder)..."

try {
    $response = Invoke-WebRequest -Uri "https://mksktpujwwrvndinencl.supabase.co/storage/v1/object/pitch-decks/test-simple.pdf" -Method POST -Headers $headers -Body "test pdf content simple path"
    Write-Host "✅ SUCCESS: $($response.StatusCode) - $($response.StatusDescription)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Response.StatusCode)"
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $responseText = $reader.ReadToEnd()
    Write-Host "Error Response: $responseText"
}