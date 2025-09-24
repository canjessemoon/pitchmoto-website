// Verify bucket configuration after SQL fix
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mksktpujwwrvndinencl.supabase.co';
const supabaseKey = 'sb_publishable_en7oBtMUR3Ai1Jxa0Nt0hg_vWMrxSkM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyBucketFix() {
  console.log('🔍 Verifying bucket configuration after SQL fix...');
  
  try {
    // Check if we can get bucket info via REST API
    const response = await fetch('https://mksktpujwwrvndinencl.supabase.co/rest/v1/storage/buckets?select=*&id=eq.pitch-decks', {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsImtpZCI6IjNWdzQ5SzVURXRRZ0VnbjgiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL21rc2t0cHVqd3dydm5kaW5lbmNsLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJmNjZlYTZkNi1hMDg2LTRjNmMtYTJjYS1iNzVlYjA0OGRkYjAiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU4MjE0MjEzLCJpYXQiOjE3NTgyMTA2MTMsImVtYWlsIjoiamRtb29uK3Rlc3Rmb3VuZGVyMTBAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbCI6ImpkbW9vbit0ZXN0Zm91bmRlcjEwQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmdWxsX25hbWUiOiJUZXN0IEZvdW5kZXIxMCIsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiZjY2ZWE2ZDYtYTA4Ni00YzZjLWEyY2EtYjc1ZWIwNDhkZGIwIiwidXNlcl90eXBlIjoiZm91bmRlciJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzU4MjA3MTIwfV0sInNlc3Npb25faWQiOiI4ZmIxZjJhOS0wYWJmLTRlYzktOTdlYy1iNzE5Y2I4ZjZmZmYiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.RVt3uria1sGTT_e2QDZ19U9hTaPYSS-3VTvP0F3_q6Y`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Bucket configuration retrieved:');
      console.log(JSON.stringify(data, null, 2));
      
      if (data.length > 0) {
        const bucket = data[0];
        if (bucket.allowed_mime_types && bucket.allowed_mime_types.length > 0) {
          console.log('✅ Bucket has mime types configured:', bucket.allowed_mime_types);
        } else {
          console.log('❌ Bucket still has no mime types configured!');
        }
      }
    } else {
      console.log(`❌ Failed to get bucket config: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.log('Error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error checking bucket:', error.message);
  }
}

verifyBucketFix();