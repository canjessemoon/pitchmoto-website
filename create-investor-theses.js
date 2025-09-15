const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rc2t0cHVqd3dydm5kaW5lbmNsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzQ2MzMyMywiZXhwIjoyMDY5MDM5MzIzfQ.wWEkjvZ-VdKe3Dega8vmWOxcXRsEQ7izztJK_KSOWyU";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createInvestorThesesTable() {
  console.log('Creating investor_theses table with location preferences...');
  
  try {
    // Read the updated migration
    const migrationSql = fs.readFileSync('./supabase/migrations/20250911_update_location_preferences.sql', 'utf8');
    
    console.log('Executing migration SQL...');
    
    // Execute the SQL directly - PostgreSQL can handle multiple statements
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: migrationSql 
    });
    
    if (error) {
      console.log('❌ Migration failed:', error.message);
      console.log('Full error:', error);
    } else {
      console.log('✅ Migration executed successfully!');
      
      // Verify the table was created
      const { data: testData, error: testError } = await supabase
        .from('investor_theses')
        .select('*')
        .limit(1);
      
      if (testError) {
        console.log('❌ Table verification failed:', testError.message);
      } else {
        console.log('✅ investor_theses table created and accessible!');
        console.log('Table is ready for use.');
      }
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error.message);
  }
}

createInvestorThesesTable();
