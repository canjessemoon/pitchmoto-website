import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// This script applies the matching system migration to Supabase
// Run with: npx tsx scripts/run-migration.ts

async function runMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Read the migration file
    const migrationPath = join(process.cwd(), 'supabase', 'migrations', '20250908_create_matching_system.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf8')

    console.log('Applying matching system migration...')
    
    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL })
    
    if (error) {
      console.error('Migration failed:', error)
      process.exit(1)
    }

    console.log('✅ Migration applied successfully!')
    console.log('New tables created:')
    console.log('  - investor_theses')
    console.log('  - startup_matches') 
    console.log('  - match_interactions')
    
  } catch (error) {
    console.error('Error running migration:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  runMigration()
}

export { runMigration }
