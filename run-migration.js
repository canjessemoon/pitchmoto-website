const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rc2t0cHVqd3dydm5kaW5lbmNsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzQ2MzMyMywiZXhwIjoyMDY5MDM5MzIzfQ.wWEkjvZ-VdKe3Dega8vmWOxcXRsEQ7izztJK_KSOWyU";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('Creating investor_theses table...');
  
  try {
    // Read the matching system migration
    const migrationSql = fs.readFileSync('./supabase/migrations/20250908_create_matching_system.sql', 'utf8');
    
    // Split by statements and execute each one
    const statements = migrationSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        console.log(`Executing statement ${i + 1}...`);
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.log(`Error in statement ${i + 1}:`, error.message);
          console.log('Statement was:', statement.substring(0, 100) + '...');
          // Continue with other statements
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      }
    }
    
    console.log('Migration completed!');
    
    // Verify the table was created
    const { data, error } = await supabase
      .from('investor_theses')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Table verification failed:', error.message);
    } else {
      console.log('✅ investor_theses table created successfully!');
    }
    
  } catch (error) {
    console.error('Migration failed:', error.message);
  }
}

runMigration();
