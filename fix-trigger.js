const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = 'https://mksktpujwwrvndinencl.supabase.co';
const SUPABASE_SECRET_KEY = 'sb_secret_RtkpszPB5waXAzM5NtFPew_A9nffWW1';

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

async function fixTrigger() {
  console.log('Fixing profile creation trigger...');
  
  try {
    // Read the SQL fix
    const sql = fs.readFileSync('./fix-profile-trigger.sql', 'utf8');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('Error executing SQL:', error);
      
      // Try alternative approach - execute each statement separately
      const statements = sql.split(';').filter(s => s.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          console.log('Executing:', statement.trim().substring(0, 50) + '...');
          const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement.trim() + ';' });
          if (stmtError) {
            console.error('Statement error:', stmtError);
          } else {
            console.log('✓ Statement executed successfully');
          }
        }
      }
    } else {
      console.log('✓ Trigger fixed successfully');
    }
    
  } catch (error) {
    console.error('Failed to fix trigger:', error);
  }
}

fixTrigger();