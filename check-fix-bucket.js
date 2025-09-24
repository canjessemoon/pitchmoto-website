// Check and fix bucket configuration using Supabase client
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mksktpujwwrvndinencl.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rc2t0cHVqd3dydm5kaW5lbmNsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkzMDEyMCwiZXhwIjoyMDczNTA2MTIwfQ.PQc3LJsEOzgKJBbGqjQfPx4gqMXN5OzLZIwOKqGrZqQ'; // Service role for admin access

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAndFixBucket() {
  console.log('🔍 Checking bucket configuration...');
  
  try {
    // First, check current bucket configuration
    const { data: buckets, error: bucketsError } = await supabase
      .from('storage.buckets')
      .select('id, name, public, allowed_mime_types')
      .eq('id', 'pitch-decks');
      
    if (bucketsError) {
      console.error('❌ Error checking buckets:', bucketsError);
      return;
    }
    
    console.log('📋 Current bucket config:', JSON.stringify(buckets, null, 2));
    
    if (buckets && buckets.length > 0) {
      const bucket = buckets[0];
      
      if (!bucket.allowed_mime_types || bucket.allowed_mime_types.length === 0) {
        console.log('🔧 Bucket needs mime types fix!');
        
        // Update bucket with allowed mime types
        const { data: updateResult, error: updateError } = await supabase
          .from('storage.buckets')
          .update({
            allowed_mime_types: [
              'application/pdf',
              'image/jpeg',
              'image/jpg', 
              'image/png',
              'image/webp',
              'image/gif'
            ]
          })
          .eq('id', 'pitch-decks');
          
        if (updateError) {
          console.error('❌ Error updating bucket:', updateError);
        } else {
          console.log('✅ Bucket updated successfully!');
          console.log('Update result:', updateResult);
        }
      } else {
        console.log('✅ Bucket already has mime types configured:', bucket.allowed_mime_types);
      }
    } else {
      console.log('❌ Bucket not found!');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkAndFixBucket();