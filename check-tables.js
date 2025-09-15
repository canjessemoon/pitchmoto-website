const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('Checking if investor_theses table exists...');
  
  // Try to query the table structure
  const { data, error } = await supabase
    .from('investor_theses')
    .select('*')
    .limit(1);
  
  if (error) {
    console.log('Error:', error.message);
    console.log('Table might not exist or RLS might be blocking access');
    
    // Let's also check what tables do exist
    console.log('\nTrying to list available tables...');
    const { data: tables, error: tablesError } = await supabase
      .rpc('exec_sql', { sql: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;" });
    
    if (tablesError) {
      console.log('Cannot list tables:', tablesError.message);
    } else {
      console.log('Available tables:', tables);
    }
  } else {
    console.log('Table exists! Found', data?.length || 0, 'records');
    if (data && data.length > 0) {
      console.log('Sample record structure:', Object.keys(data[0]));
    }
  }
}

checkTables().catch(console.error);
