import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  console.log('Starting location preferences migration...')
  
  try {
    // Add new columns
    console.log('Adding new columns...')
    await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE investor_theses 
        ADD COLUMN IF NOT EXISTS no_location_pref BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS remote_ok BOOLEAN DEFAULT true,
        ADD COLUMN IF NOT EXISTS countries TEXT[] DEFAULT '{}';
      `
    })
    
    // Migrate existing data
    console.log('Migrating existing data...')
    
    // Map US cities to 'US'
    await supabase.rpc('exec_sql', {
      sql: `
        UPDATE investor_theses 
        SET countries = ARRAY['US']
        WHERE preferred_locations && ARRAY['San Francisco', 'New York', 'Los Angeles', 'Boston', 'Austin', 'Seattle'];
      `
    })
    
    // Map 'Remote' to no_location_pref
    await supabase.rpc('exec_sql', {
      sql: `
        UPDATE investor_theses 
        SET no_location_pref = true 
        WHERE 'Remote' = ANY(preferred_locations);
      `
    })
    
    // Set no_location_pref for empty locations
    await supabase.rpc('exec_sql', {
      sql: `
        UPDATE investor_theses 
        SET no_location_pref = true 
        WHERE array_length(preferred_locations, 1) IS NULL OR array_length(preferred_locations, 1) = 0;
      `
    })
    
    console.log('Migration completed successfully!')
    
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  runMigration()
}
