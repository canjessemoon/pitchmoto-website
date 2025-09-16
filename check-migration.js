require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

async function addFundingAskColumn() {
  try {
    console.log('Starting migration: Adding funding_ask column to pitches table...');
    
    // First check current table structure
    console.log('Checking current table structure...');
    const { data: existing, error: selectError } = await supabase
      .from('pitches')
      .select('*')
      .limit(1);
      
    if (selectError) {
      console.error('Error accessing pitches table:', selectError);
      return;
    }
    
    console.log('Table accessible. Sample record structure:', Object.keys(existing[0] || {}));
    
    // Check if funding_ask column already exists
    const hasColumn = existing.length > 0 && 'funding_ask' in existing[0];
    
    if (hasColumn) {
      console.log('✅ funding_ask column already exists!');
      return;
    }
    
    console.log('❌ funding_ask column does not exist. Need to add it via SQL editor in Supabase dashboard.');
    console.log('Please run this SQL in your Supabase SQL Editor:');
    console.log('');
    console.log('ALTER TABLE pitches ADD COLUMN funding_ask BIGINT DEFAULT 100000 NOT NULL;');
    console.log('');
    console.log('After running the SQL, you can test the pitch creation again.');
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

addFundingAskColumn();
