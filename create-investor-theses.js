const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseSecretKey) {
  console.error('SUPABASE_SECRET_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseSecretKey);

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
