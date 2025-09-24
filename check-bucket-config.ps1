# Check bucket configuration via REST API
$headers = @{
    "apikey" = "sb_publishable_en7oBtMUR3Ai1Jxa0Nt0hg_vWMrxSkM"
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsImtpZCI6IjNWdzQ5SzVURXRRZ0VnbjgiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL21rc2t0cHVqd3dydm5kaW5lbmNsLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJmNjZlYTZkNi1hMDg2LTRjNmMtYTJjYS1iNzVlYjA0OGRkYjAiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU4MjE0MjEzLCJpYXQiOjE3NTgyMTA2MTMsImVtYWlsIjoiamRtb29uK3Rlc3Rmb3VuZGVyMTBAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbCI6ImpkbW9vbit0ZXN0Zm91bmRlcjEwQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmdWxsX25hbWUiOiJUZXN0IEZvdW5kZXIxMCIsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiZjY2ZWE2ZDYtYTA4Ni00YzZjLWEyY2EtYjc1ZWIwNDhkZGIwIiwidXNlcl90eXBlIjoiZm91bmRlciJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzU4MjA3MTIwfV0sInNlc3Npb25faWQiOiI4ZmIxZjJhOS0wYWJmLTRlYzktOTdlYy1iNzE5Y2I4ZjZmZmYiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.RVt3uria1sGTT_e2QDZ19U9hTaPYSS-3VTvP0F3_q6Y"
}

Write-Host "Checking bucket configuration..."

try {
    $response = Invoke-WebRequest -Uri "https://mksktpujwwrvndinencl.supabase.co/rest/v1/storage/buckets?select=id,name,public,allowed_mime_types&id=eq.pitch-decks" -Method GET -Headers $headers
    Write-Host "✅ Bucket check successful!"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "❌ Bucket check failed: $($_.Exception.Message)"
}