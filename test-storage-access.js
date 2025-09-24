// Try to check bucket using storage API directly
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mksktpujwwrvndinencl.supabase.co';
const supabaseKey = 'sb_publishable_en7oBtMUR3Ai1Jxa0Nt0hg_vWMrxSkM'; // Publishable key

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStorageAccess() {
  console.log('🔍 Testing storage access...');
  
  try {
    // Try to list files in the bucket to see if bucket exists
    const { data: files, error: listError } = await supabase.storage
      .from('pitch-decks')
      .list('', { limit: 1 });
      
    if (listError) {
      console.error('❌ Storage list error:', listError);
      
      // Also try to get bucket info
      console.log('🔍 Trying to get bucket info...');
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error('❌ List buckets error:', bucketsError);
      } else {
        console.log('📋 Available buckets:', buckets);
      }
    } else {
      console.log('✅ Bucket exists and is accessible!');
      console.log('Files found:', files?.length || 0);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testStorageAccess();