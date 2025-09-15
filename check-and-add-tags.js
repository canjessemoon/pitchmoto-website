// Direct SQL execution to add tags column
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function addTagsColumn() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY
  )

  console.log('Adding tags column to startups table...')

  try {
    // First check if column exists
    const { data: tableInfo, error: tableError } = await supabase
      .from('startups')
      .select('*')
      .limit(1)

    if (tableError) {
      console.error('Error checking table:', tableError)
      return
    }

    // Try to add the column using a simple approach
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `ALTER TABLE startups ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';`
    })

    if (error) {
      console.log('RPC method not available, trying alternative approach...')
      
      // Alternative: Use raw SQL through a function or direct query
      const { error: directError } = await supabase
        .from('startups')
        .select('tags')
        .limit(1)

      if (directError && directError.message.includes('column "tags" does not exist')) {
        console.log('Column does not exist, need to add it manually via Supabase dashboard')
        console.log('Please run this SQL in your Supabase SQL editor:')
        console.log(`
ALTER TABLE startups ADD COLUMN tags TEXT[] DEFAULT '{}';
CREATE INDEX IF NOT EXISTS idx_startups_tags ON startups USING GIN (tags);
COMMENT ON COLUMN startups.tags IS 'Cross-industry tags for enhanced categorization and search';
        `)
      } else {
        console.log('Tags column already exists or other error:', directError)
      }
    } else {
      console.log('Successfully added tags column!')
    }

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

addTagsColumn()